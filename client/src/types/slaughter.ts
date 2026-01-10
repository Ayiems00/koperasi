import { Livestock } from './livestock';

export interface SlaughterLog {
  id: number;
  livestockId: number;
  livestock?: Livestock;
  quantity: number;
  yieldWeight?: number;
  notes?: string;
  date: string;
}

export interface ProcessSlaughterData {
  livestockId: number;
  quantity: number;
  yieldWeight?: number;
  notes?: string;
  producedProducts: {
    productId: number;
    quantity: number;
  }[];
}
