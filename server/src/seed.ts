import prisma from './prisma';
import bcrypt from 'bcryptjs';

export async function runSeed(): Promise<void> {
  // Ensure Expense Categories exist
  const expenseCategories = [
    'Feed & Livestock Care', 'Veterinary', 'Utilities', 'Transport',
    'Equipment', 'Maintenance', 'Administration', 'Miscellaneous'
  ];
  for (const name of expenseCategories) {
    const existing = await prisma.expenseCategory.findUnique({ where: { name } });
    if (!existing) {
      await prisma.expenseCategory.create({ data: { name } });
    }
  }

  // Ensure Allowance Types exist
  const allowanceTypes = [
    'Elaun Mesyuarat', 'Elaun Kehadiran', 'Elaun Tugas Khas', 'Elaun Pengurusan',
    'Elaun Operasi', 'Elaun Logistik', 'Elaun Projek', 'Elaun Perjalanan'
  ];
  for (const name of allowanceTypes) {
    const existing = await prisma.allowanceType.findUnique({ where: { name } });
    if (!existing) {
      await prisma.allowanceType.create({ data: { name } });
    }
  }

  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  const passwordSuper = await bcrypt.hash('super123', 10);
  const passwordAdmin = await bcrypt.hash('admin123', 10);
  const passwordFinance = await bcrypt.hash('finance123', 10);
  const passwordPos = await bcrypt.hash('pos123', 10);
  const passwordFarm = await bcrypt.hash('farm123', 10);

  const superAdmin = await prisma.user.create({
    data: { username: 'superadmin@agrokoperasi.my', password: passwordSuper, name: 'Super Admin', role: 'SUPER_ADMIN', isActive: true }
  });
  const admin = await prisma.user.create({
    data: { username: 'admin@agrokoperasi.my', password: passwordAdmin, name: 'Operations Admin', role: 'ADMIN', isActive: true }
  });
  const finance = await prisma.user.create({
    data: { username: 'finance@agrokoperasi.my', password: passwordFinance, name: 'Finance Officer', role: 'FINANCE', isActive: true }
  });
  await prisma.user.create({
    data: { username: 'pos01@agrokoperasi.my', password: passwordPos, name: 'POS Staff 01', role: 'POS_USER', isActive: true }
  });
  await prisma.user.create({
    data: { username: 'farm@agrokoperasi.my', password: passwordFarm, name: 'Farm Admin', role: 'FARM_ADMIN', isActive: true }
  });

  await prisma.permissionModule.createMany({
    data: [
      { userId: admin.id, module: 'POS', allowed: true },
      { userId: admin.id, module: 'INVENTORY', allowed: true },
      { userId: admin.id, module: 'REPORTS', allowed: true },
      { userId: admin.id, module: 'USERS', allowed: true },
      { userId: admin.id, module: 'EXPENSES', allowed: true },
      { userId: finance.id, module: 'REPORTS', allowed: true },
      { userId: finance.id, module: 'EXPENSES', allowed: true },
      { userId: finance.id, module: 'ALLOWANCE', allowed: true }
    ]
  });

  const inv = await prisma.investmentSummary.create({
    data: {
      totalAmount: 500000,
      startDate: new Date('2024-01-01'),
      category: 'LIVESTOCK_OPERATIONS',
      active: true
    }
  });

  await prisma.dividendSetting.createMany({
    data: [
      { investmentId: inv.id, cycle: 'QUARTERLY', percentage: 5, amount: 10500, declarationDate: new Date(), paymentStatus: 'PAID', active: true },
      { investmentId: inv.id, cycle: 'HALF_YEAR', percentage: 8, amount: 16800, declarationDate: new Date(), paymentStatus: 'DECLARED', active: true },
      { investmentId: inv.id, cycle: 'YEARLY', percentage: 12, amount: 25200, paymentStatus: 'PENDING', active: true }
    ]
  });

  const catFeed = await prisma.expenseCategory.findUnique({ where: { name: 'Feed & Livestock Care' } });
  const catVet = await prisma.expenseCategory.findUnique({ where: { name: 'Veterinary' } });
  const catUtil = await prisma.expenseCategory.findUnique({ where: { name: 'Utilities' } });
  const catTransport = await prisma.expenseCategory.findUnique({ where: { name: 'Transport' } });

  if (!catFeed || !catVet || !catUtil || !catTransport) {
    console.log('Categories not found, skipping expenses seed');
    return;
  }

  await prisma.expenseVisibility.create({
    data: { superAdmin: true, admin: true, finance: true, posUser: false, farmAdmin: false }
  });

  await prisma.expense.createMany({
    data: [
      { name: 'Chicken Feed Jan', categoryId: catFeed.id, amount: 45000, date: new Date('2024-01-15'), paymentMethod: 'TRANSFER', referenceNo: 'INV-CH-001', notes: 'Monthly feed', createdByUserId: finance.id },
      { name: 'Vet Services', categoryId: catVet.id, amount: 12500, date: new Date('2024-01-20'), paymentMethod: 'TRANSFER', referenceNo: 'INV-VET-002', notes: 'Vaccinations', createdByUserId: finance.id },
      { name: 'Electricity', categoryId: catUtil.id, amount: 6800, date: new Date('2024-01-10'), paymentMethod: 'TRANSFER', referenceNo: 'INV-UTIL-003', notes: 'January bill', createdByUserId: admin.id },
      { name: 'Transport Fuel', categoryId: catTransport.id, amount: 9200, date: new Date('2024-01-12'), paymentMethod: 'CASH', referenceNo: 'EXP-TR-004', notes: 'Fuel for deliveries', createdByUserId: admin.id }
    ]
  });
}

