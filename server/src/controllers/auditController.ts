import { Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // Strict Check: Only Super Admin
    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { username: true, role: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit for now
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};
