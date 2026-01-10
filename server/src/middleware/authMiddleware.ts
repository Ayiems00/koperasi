import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authReq = req as AuthRequest;
  const authHeader = authReq.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    authReq.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' });
    return;
  }
};

export const authorizeRole = (roles: string[]) => {
  return ((req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    if (!authReq.user || !roles.includes(authReq.user.role)) {
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      return;
    }
    next();
  }) as any;
};

export const authorizeModule = (module: string) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Access denied. No user.' });
        return;
      }
      const record = await prisma.permissionModule.findFirst({
        where: { userId, module }
      });
      if (record && record.allowed === false) {
        res.status(403).json({ message: `Access to module ${module} denied.` });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Permission check failed.' });
      return;
    }
  }) as any;
};

export const authorizeAnyModule = (modules: string[]) => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const userId = authReq.user?.userId;
      if (!userId) {
        res.status(401).json({ message: 'Access denied. No user.' });
        return;
      }
      const records = await prisma.permissionModule.findMany({
        where: { userId, module: { in: modules } }
      });
      const deniedAll = modules.every(m => {
        const r = records.find(x => x.module === m);
        return r ? r.allowed === false : false; // default allow
      });
      if (deniedAll) {
        res.status(403).json({ message: `Access to required modules denied.` });
        return;
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Permission check failed.' });
      return;
    }
  }) as any;
};
