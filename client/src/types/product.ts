export interface Product {
  id: number;
  sku: string;
  name: string;
  category: 'MEAT' | 'PROCESSED' | 'LIVESTOCK' | 'OTHER';
  unitType: 'PER_KG' | 'PER_UNIT';
  price: number;
  costPrice?: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  sku: string;
  name: string;
  category: 'MEAT' | 'PROCESSED' | 'LIVESTOCK' | 'OTHER';
  unitType: 'PER_KG' | 'PER_UNIT';
  price: number;
  costPrice?: number;
  stock: number;
}
