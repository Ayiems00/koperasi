import { Request, Response } from 'express';
import prisma from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

// Create new transaction (Sale)
export const createTransaction = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { items, paymentMethod, memberId, discount } = req.body;
    // items: [{ productId, quantity }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in transaction' });
    }

    const userId = req.user.userId;

    // Calculate total and verify stock
    let totalAmount = 0;
    // Removed transactionItemsData from here as it's defined inside the transaction
    
    // Start a transaction to ensure atomicity
    const result = await prisma.$transaction(async (prisma) => {
      const transactionItemsData: { productId: number; quantity: number; price: number; subtotal: number }[] = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        transactionItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          subtotal
        });

        // Deduct stock
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity }
        });
      }
      
      // Apply discount if needed (logic can be expanded)
      
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          memberId: memberId ? Number(memberId) : null,
          totalAmount,
          paymentMethod,
          status: 'COMPLETED',
          items: {
            create: transactionItemsData
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return transaction;
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Transaction failed' });
  }
};

// Get all transactions
export const getTransactions = async (req: Request, res: Response): Promise<any> => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: {
        user: {
          select: { name: true }
        },
        items: {
            include: { product: { select: { name: true } } }
        }
      }
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get transaction by ID
export const getTransactionById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { name: true } },
        items: { include: { product: true } },
        member: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
