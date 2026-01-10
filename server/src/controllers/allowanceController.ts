import { Request, Response } from 'express';
import prisma from '../prisma';
import { logAudit } from '../utils/auditLog';
import { AuthRequest } from '../middleware/authMiddleware';
import PDFDocument from 'pdfkit';

// --- Allowance Types ---

export const getAllowanceTypes = async (req: Request, res: Response): Promise<any> => {
  try {
    const types = await prisma.allowanceType.findMany();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching allowance types' });
  }
};

export const createAllowanceType = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { name, description, approvalRequired, active } = req.body;
    const type = await prisma.allowanceType.create({
      data: { name, description, approvalRequired: !!approvalRequired, active: active !== false }
    });
    
    await logAudit(req.user!.userId, 'CREATE', 'ALLOWANCE_TYPE', type.id, null, { name }, 'Created allowance type');
    
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Error creating allowance type' });
  }
};

// --- Invoice Allowance ---

const generateInvoiceNumber = (month: number, year: number, seq: number) => {
  const mm = String(month).padStart(2, '0');
  const yy = String(year);
  const s = String(seq).padStart(4, '0');
  return `INV-ELAUN-${yy}${mm}-${s}`;
};

export const createInvoiceAllowance = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { userId, month, year, items, originalInvoiceId } = req.body; 
    // items: [{ allowanceTypeId, amount, description }]

    const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    const countForPeriod = await prisma.invoiceAllowance.count({
      where: { month: Number(month), year: Number(year) }
    });

    const invoiceNumber = generateInvoiceNumber(Number(month), Number(year), countForPeriod + 1);

    const invoice = await prisma.invoiceAllowance.create({
      data: {
        userId: Number(userId),
        month: Number(month),
        year: Number(year),
        totalAmount,
        invoiceNumber,
        status: 'ISSUED',
        originalInvoiceId: originalInvoiceId ? Number(originalInvoiceId) : null,
        items: {
          create: items.map((item: any) => ({
            allowanceTypeId: Number(item.allowanceTypeId),
            amount: Number(item.amount),
            description: item.description
          }))
        }
      },
      include: { items: true }
    });

    await logAudit(req.user!.userId, 'CREATE', 'INVOICE_ALLOWANCE', invoice.id, null, { totalAmount, userId }, 'Created invoice allowance');

    res.status(201).json(invoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating invoice allowance' });
  }
};

export const getInvoiceAllowances = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { userId, month, year } = req.query;
    const requestorId = req.user!.userId;
    const requestorRole = req.user?.role;

    const where: any = {};

    // Permission Check
    if (['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(requestorRole)) {
        if (userId) where.userId = Number(userId);
    } else {
        // Regular user can only see their own
        where.userId = requestorId;
    }

    if (month) where.month = Number(month);
    if (year) where.year = Number(year);

    const invoices = await prisma.invoiceAllowance.findMany({
      where,
      include: {
        user: { select: { name: true, branch: true, position: true } },
        items: { include: { allowanceType: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices' });
  }
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const invoice = await prisma.invoiceAllowance.findUnique({ where: { id: Number(id) } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (invoice.status === 'FINALIZED') return res.status(400).json({ message: 'Invoice is finalized' });

    const allowed = ['DRAFT', 'ISSUED', 'SUBMITTED', 'APPROVED', 'FINALIZED'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const approver = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    const updatedInvoice = await prisma.invoiceAllowance.update({
      where: { id: Number(id) },
      data: { 
        status,
        approvalTimestamp: status === 'APPROVED' || status === 'FINALIZED' ? new Date() : invoice.approvalTimestamp,
        approverRole: status === 'APPROVED' || status === 'FINALIZED' ? req.user?.role : invoice.approverRole,
        approverName: status === 'APPROVED' || status === 'FINALIZED' ? (approver?.name || null) : invoice.approverName
      }
    });

    await logAudit(
        req.user!.userId, 
        'UPDATE', 
        'INVOICE_STATUS', 
        updatedInvoice.id, 
        { status: invoice.status }, 
        { status }, 
        `Updated invoice status to ${status}${reason ? ` | Reason: ${reason}` : ''}`
    );

    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ message: 'Error updating invoice status' });
  }
};

export const exportInvoicePDF = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoiceAllowance.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        items: { include: { allowanceType: true } }
      }
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('Allowance Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Employee: ${invoice.user.name}`);
    doc.text(`Period: ${invoice.month}/${invoice.year}`);
    doc.moveDown();

    doc.text('Items:', { underline: true });
    invoice.items.forEach((item: any) => {
      doc.text(`- ${item.allowanceType.name}: RM ${item.amount.toFixed(2)} (${item.description || ''})`);
    });
    doc.moveDown();
    doc.fontSize(14).text(`Total: RM ${invoice.totalAmount.toFixed(2)}`, { align: 'right' });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Error generating PDF' });
  }
};
