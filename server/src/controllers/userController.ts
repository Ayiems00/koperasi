import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';
import { logAudit } from '../utils/auditLog';
import { AuthRequest } from '../middleware/authMiddleware';

// Get all users
export const getUsers = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        branch: true,
        position: true,
        isActive: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Create User
export const createUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { username, password, name, role, branch, position } = req.body;
    const requestorRole = req.user?.role;

    // Strict Role Control
    if (role === 'SUPER_ADMIN' && requestorRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Only Super Admin can create another Super Admin' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
        branch,
        position,
      }
    });

    await logAudit(req.user!.userId, 'CREATE', 'USER', newUser.id, null, { username, role, branch }, `Created user ${username}`);

    res.status(201).json({ message: 'User created successfully', user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
};

// Update User
export const updateUser = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, role, branch, position, isActive, password } = req.body;
    const requestorRole = req.user?.role;

    const userToUpdate = await prisma.user.findUnique({ where: { id: Number(id) } });

    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Protection Rules
    if (userToUpdate.role === 'SUPER_ADMIN' && requestorRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Cannot modify Super Admin' });
    }

    const dataToUpdate: any = { name, role, branch, position, isActive };
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });

    await logAudit(
      req.user!.userId, 
      'UPDATE', 
      'USER', 
      updatedUser.id, 
      userToUpdate, 
      dataToUpdate, 
      `Updated user ${userToUpdate.username}`
    );

    res.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Request Profile Change
export const requestProfileChange = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { field, newValue } = req.body;
    const userId = req.user!.userId;

    const allowedFields = ['name', 'branch', 'position', 'phone', 'email'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: 'Invalid field for profile change' });
    }

    // Get current value
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldValue = (user as any)[field];

    const request = await prisma.profileChangeRequest.create({
      data: {
        userId,
        field,
        oldValue: String(oldValue || ''),
        newValue,
        status: 'PENDING'
      }
    });

    res.json({ message: 'Change request submitted', request });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting request' });
  }
};

// Approve/Reject Profile Change
export const handleProfileChangeRequest = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params; // Request ID
    const { status, adminNote } = req.body; // APPROVED or REJECTED

    const request = await prisma.profileChangeRequest.findUnique({ where: { id: Number(id) } });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (status === 'APPROVED') {
      // Apply change
      await prisma.user.update({
        where: { id: request.userId },
        data: { [request.field]: request.newValue }
      });
      
      await logAudit(
        req.user!.userId,
        'UPDATE',
        'USER_PROFILE',
        request.userId,
        { [request.field]: request.oldValue },
        { [request.field]: request.newValue },
        `Approved profile change request ${id}`
      );
    }

    const updatedRequest = await prisma.profileChangeRequest.update({
      where: { id: Number(id) },
      data: { status, adminNote }
    });

    res.json({ message: `Request ${status}`, request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error handling request' });
  }
};

// Get Pending Requests
export const getPendingRequests = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const requests = await prisma.profileChangeRequest.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { username: true, name: true } } }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

// --- Permissions (Module-level) ---
const ALLOWED_MODULES = [
  'DASHBOARD',
  'INVESTMENT',
  'EXPENSES',
  'POS',
  'INVENTORY',
  'SLAUGHTER',
  'PRODUCTS',
  'REPORTS',
  'USERS',
  'ALLOWANCE',
  'MY_ALLOWANCE',
  'PROFILE',
  'AUDIT'
];

export const getUserPermissions = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const requestorRole = req.user?.role;

    if (requestorRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    const modules = await prisma.permissionModule.findMany({
      where: { userId: Number(id) },
      orderBy: { module: 'asc' }
    });

    res.json({ modules });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};

export const updateUserPermissions = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { modules } = req.body as { modules: { module: string; allowed: boolean }[] };

    if (req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }

    // Validate modules
    const sanitized = (modules || [])
      .filter(m => ALLOWED_MODULES.includes(m.module))
      .map(m => ({ module: m.module, allowed: !!m.allowed }));

    // Get old modules for audit
    const oldModules = await prisma.permissionModule.findMany({ where: { userId: Number(id) } });

    const newModules = await prisma.$transaction(async (tx) => {
      for (const m of sanitized) {
        const existing = await tx.permissionModule.findFirst({
          where: { userId: Number(id), module: m.module }
        });
        if (existing) {
          await tx.permissionModule.update({
            where: { id: existing.id },
            data: { allowed: m.allowed }
          });
        } else {
          await tx.permissionModule.create({
            data: { userId: Number(id), module: m.module, allowed: m.allowed }
          });
        }
      }
      return tx.permissionModule.findMany({ where: { userId: Number(id) } });
    });

    await logAudit(
      req.user!.userId,
      'UPDATE',
      'PERMISSIONS',
      id,
      oldModules,
      newModules,
      `Updated module permissions for user ${id}`
    );

    res.json({ message: 'Permissions updated', modules: newModules });
  } catch (error) {
    res.status(500).json({ message: 'Error updating permissions' });
  }
};

export const getMyPermissions = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user!.userId;
    const modules = await prisma.permissionModule.findMany({
      where: { userId },
      orderBy: { module: 'asc' }
    });
    res.json({ modules });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching permissions' });
  }
};
