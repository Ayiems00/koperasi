import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const getExpenseCategories = async (req: AuthRequest, res: Response): Promise<any> => {
  const cats = await prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  res.json(cats);
};

export const createExpenseCategory = async (req: AuthRequest, res: Response): Promise<any> => {
  if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(req.user?.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { name } = req.body;
  const cat = await prisma.expenseCategory.create({ data: { name } });
  res.status(201).json(cat);
};

async function canViewExpenses(role: string): Promise<boolean> {
  const vis = await prisma.expenseVisibility.findFirst();
  const v = vis || { superAdmin: true, admin: true, finance: true, posUser: false, farmAdmin: false };
  if (role === 'SUPER_ADMIN') return v.superAdmin;
  if (role === 'ADMIN') return v.admin;
  if (role === 'FINANCE') return v.finance;
  if (role === 'POS_USER') return v.posUser;
  if (role === 'FARM_ADMIN') return v.farmAdmin;
  return false;
}

export const getExpenses = async (req: AuthRequest, res: Response): Promise<any> => {
  const role = req.user?.role || '';
  if (!(await canViewExpenses(role))) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const expenses = await prisma.expense.findMany({
    include: { category: true, createdBy: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });
  res.json(expenses);
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<any> => {
  const role = req.user?.role || '';
  if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { name, categoryId, amount, date, paymentMethod, referenceNo, notes, bankName, proofPath } = req.body;
  const exp = await prisma.expense.create({
    data: {
      name,
      categoryId: Number(categoryId),
      amount: Number(amount),
      date: new Date(date),
      paymentMethod: String(paymentMethod),
      referenceNo,
      notes,
      bankName,
      proofPath,
      createdByUserId: req.user!.userId
    }
  });
  res.status(201).json(exp);
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<any> => {
  const role = req.user?.role || '';
  if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { id } = req.params;
  const existing = await prisma.expense.findUnique({ where: { id: Number(id) } });
  if (!existing) return res.status(404).json({ message: 'Expense not found' });
  const { name, categoryId, amount, date, paymentMethod, referenceNo, notes, bankName, proofPath } = req.body;
  const updated = await prisma.expense.update({
    where: { id: existing.id },
    data: {
      name,
      categoryId: Number(categoryId),
      amount: Number(amount),
      date: new Date(date),
      paymentMethod: String(paymentMethod),
      referenceNo,
      notes,
      bankName,
      proofPath
    }
  });
  await prisma.expenseHistory.create({
    data: {
      expenseId: existing.id,
      previousAmount: existing.amount,
      newAmount: Number(amount ?? existing.amount),
      editedByUserId: req.user!.userId
    }
  });
  res.json(updated);
};

export const getExpenseVisibility = async (_req: AuthRequest, res: Response): Promise<any> => {
  const vis = await prisma.expenseVisibility.findFirst();
  if (!vis) {
    const def = await prisma.expenseVisibility.create({
      data: { superAdmin: true, admin: true, finance: true, posUser: false, farmAdmin: false }
    });
    return res.json(def);
  }
  res.json(vis);
};

export const updateExpenseVisibility = async (req: AuthRequest, res: Response): Promise<any> => {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { superAdmin, admin, finance, posUser, farmAdmin } = req.body;
  const vis = await prisma.expenseVisibility.findFirst();
  if (vis) {
    const updated = await prisma.expenseVisibility.update({
      where: { id: vis.id },
      data: { superAdmin, admin, finance, posUser, farmAdmin }
    });
    return res.json(updated);
  }
  const created = await prisma.expenseVisibility.create({
    data: { superAdmin, admin, finance, posUser, farmAdmin }
  });
  res.json(created);
};

export const exportExpensesPDF = async (req: AuthRequest, res: Response): Promise<any> => {
  const role = req.user?.role || '';
  if (!(await canViewExpenses(role))) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const expenses = await prisma.expense.findMany({ include: { category: true } });
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);
  doc.fontSize(18).text('Expense Report', { align: 'center' });
  doc.moveDown();
  expenses.forEach((e: any) => {
    doc.fontSize(12).text(`${new Date(e.date).toLocaleDateString()} - ${e.name} - ${e.category.name} - RM ${e.amount.toFixed(2)}`);
  });
  doc.end();
};

export const exportExpensesExcel = async (req: AuthRequest, res: Response): Promise<any> => {
  const role = req.user?.role || '';
  if (!(await canViewExpenses(role))) {
    return res.status(403).json({ message: 'Access denied' });
  }
  const expenses = await prisma.expense.findMany({ include: { category: true } });
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Expenses');
  ws.addRow(['Date', 'Name', 'Category', 'Amount (RM)', 'Payment Method', 'Reference', 'Notes']);
  expenses.forEach((e: any) => {
    ws.addRow([
      new Date(e.date).toLocaleDateString(),
      e.name,
      e.category.name,
      e.amount,
      e.paymentMethod,
      e.referenceNo || '',
      e.notes || ''
    ]);
  });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="expenses.xlsx"');
  await wb.xlsx.write(res);
  res.end();
};
