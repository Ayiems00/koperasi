import { Request, Response } from 'express';
import prisma from '../prisma';

// Get all livestock
export const getLivestock = async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, status } = req.query;
    
    const filter: any = {};
    if (type) filter.type = String(type);
    if (status) filter.status = String(status);

    const livestock = await prisma.livestock.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      include: { slaughterLogs: true }
    });
    
    res.json(livestock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get livestock by ID
export const getLivestockById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const livestock = await prisma.livestock.findUnique({
      where: { id: Number(id) },
      include: { slaughterLogs: true }
    });

    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }

    res.json(livestock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create livestock
export const createLivestock = async (req: Request, res: Response): Promise<any> => {
  try {
    const { type, batchId, tagId, quantity, initialWeight, dateReceived, farmLocation, costPrice, notes } = req.body;

    // Basic validation
    if (!type || !quantity || !dateReceived) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const livestock = await prisma.livestock.create({
      data: {
        type,
        batchId,
        tagId,
        quantity: Number(quantity),
        initialWeight: initialWeight ? Number(initialWeight) : null,
        currentWeight: initialWeight ? Number(initialWeight) : null,
        status: 'ALIVE',
        dateReceived: new Date(dateReceived),
        farmLocation,
        costPrice: costPrice ? Number(costPrice) : null,
        notes
      }
    });

    res.status(201).json(livestock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update livestock
export const updateLivestock = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Handle date conversion if present
    if (data.dateReceived) {
        data.dateReceived = new Date(data.dateReceived);
    }

    const livestock = await prisma.livestock.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    res.json(livestock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete livestock
export const deleteLivestock = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.livestock.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Livestock deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
