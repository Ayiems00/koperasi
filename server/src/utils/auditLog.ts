import prisma from '../prisma';

export const logAudit = async (
  userId: number,
  action: string,
  entity: string,
  entityId: string | number | null,
  oldValue: any | null,
  newValue: any | null,
  details: string | null
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        details,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent blocking main flow, but log it
  }
};
