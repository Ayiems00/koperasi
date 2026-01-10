import { Product } from './product';

export interface TransactionItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  userId: number;
  user?: { name: string };
  memberId?: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'QR' | 'TRANSFER';
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  date: string;
  items: TransactionItem[];
}

export interface CreateTransactionData {
  items: {
    productId: number;
    quantity: number;
  }[];
  paymentMethod: 'CASH' | 'QR' | 'TRANSFER';
  memberId?: number;
  discount?: number;
}
