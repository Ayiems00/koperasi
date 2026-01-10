import { Request, Response } from 'express';
import prisma from '../prisma';

// Get all products
export const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { category, search } = req.query;
    
    const filter: any = {};
    if (category) filter.category = String(category);
    if (search) {
      filter.OR = [
        { name: { contains: String(search) } }, // Remove mode: 'insensitive' for SQLite compatibility if needed, but Prisma usually handles it. SQLite supports it.
        { sku: { contains: String(search) } }
      ];
    }

    const products = await prisma.product.findMany({
      where: filter,
      orderBy: { name: 'asc' }
    });
    
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product
export const createProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, category, unitType, price, costPrice, stock, sku } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        category,
        unitType,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
        sku
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
