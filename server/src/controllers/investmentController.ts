import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { logAudit } from '../utils/auditLog';

async function computeFinancials() {
  const transactions = await prisma.transaction.findMany({
    include: { items: true }
  });
  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  let totalCost = 0;
  for (const t of transactions) {
    for (const it of t.items) {
      const product = await prisma.product.findUnique({ where: { id: it.productId } });
      const cp = product?.costPrice || 0;
      totalCost += cp * it.quantity;
    }
  }
  const netProfit = totalRevenue - totalCost;
  return { totalRevenue, totalCost, netProfit };
}

export const submitMemberInvestment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const { amount, type, bankName, referenceNo, date, notes, memberId } = req.body;
    const investment = await prisma.memberInvestment.create({
      data: {
        submittedByUserId: userId,
        memberId: memberId ? Number(memberId) : null,
        amount: Number(amount),
        type: String(type || 'CASH'),
        bankName: bankName ? String(bankName) : null,
        referenceNo: referenceNo ? String(referenceNo) : null,
        date: new Date(date),
        proofPath: null,
        notes: notes ? String(notes) : null,
        status: 'PENDING'
      }
    });
    await logAudit(userId, 'CREATE', 'MEMBER_INVESTMENT', investment.id, null, investment, 'Submitted member investment');
    res.status(201).json({ message: 'Investment submitted', investment });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting investment' });
  }
};

export const getPendingInvestments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const list = await prisma.memberInvestment.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        submittedBy: { select: { name: true } },
        member: { select: { name: true, id: true } }
      }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending investments' });
  }
};

export const getMyInvestments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const list = await prisma.memberInvestment.findMany({
      where: { submittedByUserId: userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my investments' });
  }
};

export const approveInvestment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { id } = req.params;
    const inv = await prisma.memberInvestment.findUnique({ where: { id: Number(id) } });
    if (!inv || inv.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid investment record' });
    }
    const updated = await prisma.memberInvestment.update({
      where: { id: inv.id },
      data: {
        status: 'APPROVED',
        approvedByUserId: req.user!.userId,
        approvedAt: new Date()
      }
    });
    let summary = await prisma.investmentSummary.findFirst({ where: { active: true } });
    if (summary) {
      summary = await prisma.investmentSummary.update({
        where: { id: summary.id },
        data: { totalAmount: summary.totalAmount + updated.amount }
      });
    } else {
      summary = await prisma.investmentSummary.create({
        data: {
          totalAmount: updated.amount,
          startDate: new Date(),
          category: 'OPERATIONS',
          active: true
        }
      });
    }
    await prisma.memberInvestmentHistory.create({
      data: {
        investmentId: updated.id,
        memberId: updated.memberId!,
        amount: updated.amount,
        transactionDate: updated.date,
        approvedByUserId: req.user!.userId,
        approvedAt: new Date(),
        source: 'MEMBER_CONTRIBUTION',
        proofPath: updated.proofPath
      }
    });

    await logAudit(req.user!.userId, 'UPDATE', 'MEMBER_INVESTMENT', updated.id, inv, updated, 'Approved investment');
    res.json({ message: 'Approved', investment: updated, summary });
  } catch (error) {
    res.status(500).json({ message: 'Error approving investment' });
  }
};

export const rejectInvestment = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || String(reason).trim().length === 0) {
      return res.status(400).json({ message: 'Rejection reason required' });
    }
    const inv = await prisma.memberInvestment.findUnique({ where: { id: Number(id) } });
    if (!inv || inv.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid investment record' });
    }
    const updated = await prisma.memberInvestment.update({
      where: { id: inv.id },
      data: {
        status: 'REJECTED',
        rejectionReason: String(reason),
        approvedByUserId: req.user!.userId,
        approvedAt: new Date()
      }
    });
    await logAudit(req.user!.userId, 'UPDATE', 'MEMBER_INVESTMENT', updated.id, inv, updated, 'Rejected investment');
    res.json({ message: 'Rejected', investment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting investment' });
  }
};

export const getInvestmentHistory = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const history = await prisma.memberInvestmentHistory.findMany({
      orderBy: { approvedAt: 'desc' },
      include: {
        member: { select: { name: true, icNumber: true } },
        approvedBy: { select: { name: true } },
        investment: { select: { type: true, bankName: true, referenceNo: true } }
      }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment history' });
  }
};

export const getIndividualInvestments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const grouped = await prisma.memberInvestment.groupBy({
      by: ['memberId'],
      where: { status: 'APPROVED' },
      _sum: { amount: true },
      _count: { _all: true }
    });
    const result = [];
    for (const g of grouped) {
      if (!g.memberId) continue;
      const m = await prisma.member.findUnique({ where: { id: g.memberId } });
      const last = await prisma.memberInvestment.findFirst({
        where: { memberId: g.memberId, status: 'APPROVED' },
        orderBy: { approvedAt: 'desc' }
      });
      result.push({
        memberId: g.memberId,
        memberName: m?.name || 'Unknown',
        totalApprovedInvestment: g._sum.amount || 0,
        lastInvestmentDate: last?.approvedAt || null,
        investmentCount: g._count._all
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching individual investments' });
  }
};

export const getInvestmentSummary = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const summary = await prisma.investmentSummary.findFirst({
      where: { active: true }
    });
    res.json(summary || null);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment summary' });
  }
};

export const upsertInvestmentSummary = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    const { totalAmount, startDate, category, active, reason } = req.body;
    if (!reason || String(reason).trim().length === 0) {
      return res.status(400).json({ message: 'Reason is required for changes' });
    }
    const current = await prisma.investmentSummary.findFirst({ where: { active: true } });
    const prevAmount = current?.totalAmount || 0;
    const changeType = totalAmount > prevAmount ? 'INCREASE' : totalAmount < prevAmount ? 'DECREASE' : 'CORRECTION';

    const updated = current
      ? await prisma.investmentSummary.update({
          where: { id: current.id },
          data: {
            totalAmount: Number(totalAmount),
            startDate: new Date(startDate),
            category: String(category),
            active: active !== false
          }
        })
      : await prisma.investmentSummary.create({
          data: {
            totalAmount: Number(totalAmount),
            startDate: new Date(startDate),
            category: String(category),
            active: active !== false
          }
        });

    await prisma.investmentHistory.create({
      data: {
        investmentId: updated.id,
        previousAmount: prevAmount,
        newAmount: Number(totalAmount),
        changeType,
        editedByUserId: req.user!.userId,
        reason
      }
    });

    await logAudit(req.user!.userId, 'UPDATE', 'INVESTMENT_SUMMARY', updated.id, current, updated, 'Updated investment summary');
    res.json({ message: 'Investment summary saved', summary: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error saving investment summary' });
  }
};

export const getInvestmentSummaryHistory = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    const histories = await prisma.investmentHistory.findMany({
      orderBy: { timestamp: 'desc' },
      include: { editedBy: { select: { name: true } } }
    });
    res.json(histories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment summary history' });
  }
};

export const getDividendSettings = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const summary = await prisma.investmentSummary.findFirst({ where: { active: true } });
    if (!summary) return res.json([]);
    const settings = await prisma.dividendSetting.findMany({
      where: { investmentId: summary.id }
    });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dividend settings' });
  }
};

export const setDividendSetting = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    const { cycle, percentage, declarationDate, paymentStatus } = req.body;
    const summary = await prisma.investmentSummary.findFirst({ where: { active: true } });
    if (!summary) return res.status(400).json({ message: 'No active investment summary' });

    const fin = await computeFinancials();
    const amount = Math.max(0, fin.netProfit * (Number(percentage) / 100));

    if (amount < 0) return res.status(400).json({ message: 'Negative dividend not allowed' });
    if (amount > fin.netProfit) return res.status(400).json({ message: 'Dividend exceeds net profit' });

    const existing = await prisma.dividendSetting.findFirst({
      where: { investmentId: summary.id, cycle: String(cycle) }
    });

    const data = {
      investmentId: summary.id,
      cycle: String(cycle),
      percentage: Number(percentage),
      amount,
      declarationDate: declarationDate ? new Date(declarationDate) : null,
      paymentStatus: String(paymentStatus || 'DECLARED'),
      active: true
    };

    const saved = existing
      ? await prisma.dividendSetting.update({ where: { id: existing.id }, data })
      : await prisma.dividendSetting.create({ data });

    await prisma.dividendHistory.create({
      data: {
        dividendId: saved.id,
        cycle: saved.cycle,
        percentage: saved.percentage,
        amount: saved.amount,
        declarationDate: saved.declarationDate || new Date(),
        status: saved.paymentStatus,
        editedByUserId: req.user!.userId,
        paymentDate: saved.paymentStatus === 'PAID' ? new Date() : null
      }
    });

    await logAudit(req.user!.userId, 'UPDATE', 'DIVIDEND_SETTING', saved.id, existing, saved, 'Updated dividend setting');
    res.json({ message: 'Dividend setting saved', setting: saved });
  } catch (error) {
    res.status(500).json({ message: 'Error saving dividend setting' });
  }
};

export const cancelDividend = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    const { id } = req.params;
    const setting = await prisma.dividendSetting.findUnique({ where: { id: Number(id) } });
    if (!setting) return res.status(404).json({ message: 'Dividend setting not found' });
    const updated = await prisma.dividendSetting.update({
      where: { id: setting.id },
      data: { paymentStatus: 'CANCELLED', active: false }
    });
    await prisma.dividendHistory.create({
      data: {
        dividendId: updated.id,
        cycle: updated.cycle,
        percentage: updated.percentage,
        amount: updated.amount,
        declarationDate: updated.declarationDate || new Date(),
        status: 'CANCELLED',
        editedByUserId: req.user!.userId
      }
    });
    await logAudit(req.user!.userId, 'UPDATE', 'DIVIDEND_SETTING', updated.id, setting, updated, 'Cancelled dividend');
    res.json({ message: 'Dividend cancelled', setting: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling dividend' });
  }
};

export const getDividendHistory = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const history = await prisma.dividendHistory.findMany({
      orderBy: { createdAt: 'desc' },
      include: { editedBy: { select: { name: true } } }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dividend history' });
  }
};

export const getROI = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    if (!['SUPER_ADMIN', 'ADMIN', 'FINANCE'].includes(req.user?.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const summary = await prisma.investmentSummary.findFirst({ where: { active: true } });
    const fin = await computeFinancials();
    const totalInvestment = summary?.totalAmount || 0;
    const roiPercent = totalInvestment > 0 ? (fin.netProfit / totalInvestment) * 100 : 0;
    res.json({
      totalInvestment,
      totalRevenue: fin.totalRevenue,
      totalCost: fin.totalCost,
      netProfit: fin.netProfit,
      roiPercent
    });
  } catch (error) {
    res.status(500).json({ message: 'Error computing ROI' });
  }
};
