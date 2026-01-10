import { Request, Response } from 'express';
import prisma from '../prisma';

// Process a slaughter event
export const processSlaughter = async (req: Request, res: Response): Promise<any> => {
  const { livestockId, quantity, yieldWeight, notes, producedProducts } = req.body;
  // producedProducts is an array of { productId, quantity }

  try {
    // 1. Validate Livestock exists
    const livestock = await prisma.livestock.findUnique({
      where: { id: Number(livestockId) }
    });

    if (!livestock) {
      return res.status(404).json({ message: 'Livestock not found' });
    }

    if (livestock.status === 'SLAUGHTERED' || livestock.status === 'DEAD' || livestock.status === 'SOLD') {
       return res.status(400).json({ message: 'Livestock is not available for slaughter' });
    }

    // Check if enough quantity
    if (livestock.quantity < Number(quantity)) {
        return res.status(400).json({ message: 'Insufficient livestock quantity' });
    }

    // 2. Perform Transaction
    const result = await prisma.$transaction(async (tx) => {
      // A. Create Slaughter Log
      const log = await tx.slaughterLog.create({
        data: {
          livestockId: Number(livestockId),
          quantity: Number(quantity),
          yieldWeight: yieldWeight ? Number(yieldWeight) : null,
          notes,
          date: new Date()
        }
      });

      // B. Update Livestock
      let newStatus = livestock.status;
      const newQuantity = livestock.quantity - Number(quantity);

      if (newQuantity === 0) {
        newStatus = 'SLAUGHTERED';
      } else {
        newStatus = 'PARTIAL_SLAUGHTERED';
      }

      await tx.livestock.update({
        where: { id: Number(livestockId) },
        data: {
          quantity: newQuantity,
          status: newStatus
        }
      });

      // C. Update Product Stock (if products produced are provided)
      if (producedProducts && Array.isArray(producedProducts)) {
        for (const prod of producedProducts) {
            // Check if product exists first
            const product = await tx.product.findUnique({ where: { id: Number(prod.productId) } });
            if(product) {
                 await tx.product.update({
                    where: { id: Number(prod.productId) },
                    data: {
                        stock: {
                            increment: Number(prod.quantity)
                        }
                    }
                });
            }
        }
      }

      return log;
    });

    res.status(201).json({ message: 'Slaughter processed successfully', log: result });

  } catch (error) {
    console.error('Error processing slaughter:', error);
    res.status(500).json({ message: 'Server error processing slaughter' });
  }
};

// Get all slaughter logs
export const getSlaughterLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const logs = await prisma.slaughterLog.findMany({
      include: {
        livestock: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching slaughter logs:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
};
