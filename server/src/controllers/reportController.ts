import { Request, Response } from 'express';
import prisma from '../prisma';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Get Sales Report
export const getSalesReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: dateFilter,
      include: {
        items: true,
        user: { select: { name: true } }
      }
    });

    const totalSales = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalTransactions = transactions.length;
    const paymentMethods = transactions.reduce((acc: any, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.totalAmount;
      return acc;
    }, {});
    const dailySales = transactions.reduce((acc: any, t) => {
      const day = new Date(t.date).toISOString().split('T')[0];
      acc[day] = (acc[day] || 0) + t.totalAmount;
      return acc;
    }, {});
    const productCategoryTotals: Record<string, number> = {};
    for (const t of transactions) {
      for (const it of t.items) {
        const product = await prisma.product.findUnique({ where: { id: it.productId } });
        const cat = product?.category || 'Uncategorized';
        productCategoryTotals[cat] = (productCategoryTotals[cat] || 0) + it.subtotal;
      }
    }

    res.json({
      totalSales,
      totalTransactions,
      transactions,
      paymentMethods,
      dailySales,
      productCategoryTotals
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching sales report' });
  }
};

// Get Inventory Report
export const getInventoryReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const products = await prisma.product.findMany();
    const livestock = await prisma.livestock.findMany();

    // Group livestock by type and status
    const livestockSummary = livestock.reduce((acc: any, curr) => {
        const key = `${curr.type}-${curr.status}`;
        if (!acc[key]) {
            acc[key] = { type: curr.type, status: curr.status, count: 0, quantity: 0 };
        }
        acc[key].count += 1; // Number of records (batches for chicken, individual for cows)
        acc[key].quantity += curr.quantity; // Total heads
        return acc;
    }, {});

    res.json({
      products,
      livestockSummary: Object.values(livestockSummary)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching inventory report' });
  }
};

// Get Allowance Report
export const getAllowanceReport = async (req: Request, res: Response): Promise<any> => {
  try {
    const { year } = req.query;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const invoices = await prisma.invoiceAllowance.findMany({
      where: { year: targetYear, status: { not: 'DRAFT' } },
      include: {
        user: { select: { branch: true } },
        items: { include: { allowanceType: true } }
      }
    });

    // Group by Month
    const byMonth = invoices.reduce((acc: any, curr) => {
      const month = curr.month;
      acc[month] = (acc[month] || 0) + curr.totalAmount;
      return acc;
    }, {});

    // Group by Branch
    const byBranch = invoices.reduce((acc: any, curr) => {
      const branch = curr.user.branch || 'Unassigned';
      acc[branch] = (acc[branch] || 0) + curr.totalAmount;
      return acc;
    }, {});

    // Group by Category
    const byCategory = invoices.reduce((acc: any, inv) => {
      inv.items.forEach(it => {
        const cat = it.allowanceType.name;
        acc[cat] = (acc[cat] || 0) + it.amount;
      });
      return acc;
    }, {});

    // Status counts
    const statusCounts = invoices.reduce((acc: any, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      year: targetYear,
      byMonth,
      byBranch,
      byCategory,
      statusCounts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching allowance report' });
  }
};

export const exportAllowanceCSV = async (req: Request, res: Response): Promise<any> => {
  try {
    const { year } = req.query;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const invoices = await prisma.invoiceAllowance.findMany({
      where: { year: targetYear },
      include: {
        user: { select: { name: true, branch: true, position: true } },
        items: { include: { allowanceType: true } }
      }
    });

    const header = ['Invoice Number','Name','Branch','Position','Month','Year','Status','Total','Category','Amount','Description','Approved By (Role+Name)'];
    const rows = invoices.flatMap(inv => inv.items.map(it => [
      inv.invoiceNumber,
      inv.user.name,
      inv.user.branch || '',
      inv.user.position || '',
      inv.month,
      inv.year,
      inv.status,
      inv.totalAmount,
      it.allowanceType.name,
      it.amount,
      it.description || '',
      `${inv.approverRole || ''}${inv.approverName ? ` - ${inv.approverName}` : ''}`
    ]));
    const compliance = 'Compliance: All recorded allowances are cooperative-approved and do not represent employment salary, wages, or payroll.';
    const csv = [compliance, '', header.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=\"allowance_${targetYear}.csv\"`);
    res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting CSV' });
  }
};

export const exportAllowanceExcel = async (req: Request, res: Response): Promise<any> => {
  try {
    const { year } = req.query;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const invoices = await prisma.invoiceAllowance.findMany({
      where: { year: targetYear },
      include: {
        user: { select: { name: true, branch: true, position: true } },
        items: { include: { allowanceType: true } }
      }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Allowance');
    sheet.columns = [
      { header: 'Invoice Number', key: 'invoiceNumber', width: 18 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Branch', key: 'branch', width: 16 },
      { header: 'Position', key: 'position', width: 18 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Category', key: 'category', width: 24 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Description', key: 'desc', width: 30 },
      { header: 'Approved By (Role+Name)', key: 'approvedBy', width: 28 },
    ];

    sheet.addRow({}).commit();
    sheet.addRow({ invoiceNumber: 'Compliance: All recorded allowances are cooperative-approved and do not represent employment salary, wages, or payroll.' });
    sheet.addRow({}).commit();

    invoices.forEach(inv => {
      inv.items.forEach(it => {
        sheet.addRow({
          invoiceNumber: inv.invoiceNumber,
          name: inv.user.name,
          branch: inv.user.branch || '',
          position: inv.user.position || '',
          month: inv.month,
          year: inv.year,
          status: inv.status,
          total: inv.totalAmount,
          category: it.allowanceType.name,
          amount: it.amount,
          desc: it.description || '',
          approvedBy: `${inv.approverRole || ''}${inv.approverName ? ` - ${inv.approverName}` : ''}`
        });
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=\"allowance_${targetYear}.xlsx\"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting Excel' });
  }
};

export const exportAllowancePDF = async (req: Request, res: Response): Promise<any> => {
  try {
    const { year } = req.query;
    const targetYear = year ? Number(year) : new Date().getFullYear();

    const invoices = await prisma.invoiceAllowance.findMany({
      where: { year: targetYear },
      include: {
        user: { select: { name: true, branch: true, position: true } },
        items: { include: { allowanceType: true } }
      }
    });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=\"allowance_${targetYear}.pdf\"`);
    doc.pipe(res);

    doc.fontSize(16).text('Allowance Summary (Invois Elaun)', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Year: ${targetYear}`);
    doc.moveDown();
    doc.fontSize(9).text('Compliance: All recorded allowances are cooperative-approved and do not represent employment salary, wages, or payroll under employment contracts.', { align: 'left' });

    invoices.forEach(inv => {
      doc.moveDown();
      doc.fontSize(12).text(`Invoice: ${inv.invoiceNumber}`);
      doc.fontSize(10).text(`Name: ${inv.user.name} | Branch: ${inv.user.branch || ''} | Position: ${inv.user.position || ''}`);
      doc.text(`Period: ${inv.month}/${inv.year} | Status: ${inv.status} | Total: RM ${inv.totalAmount.toFixed(2)}`);
      if (inv.approverRole || inv.approverName) {
        const ts = inv.approvalTimestamp ? new Date(inv.approvalTimestamp).toLocaleString('ms-MY', { timeZone: 'Asia/Kuala_Lumpur' }) : '';
        doc.text(`Approved By: ${inv.approverRole || ''}${inv.approverName ? ` - ${inv.approverName}` : ''}${ts ? ` at ${ts}` : ''}`);
      }
      inv.items.forEach(it => {
        doc.text(`- ${it.allowanceType.name}: RM ${it.amount.toFixed(2)} ${it.description ? `(${it.description})` : ''}`);
      });
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting PDF' });
  }
};
