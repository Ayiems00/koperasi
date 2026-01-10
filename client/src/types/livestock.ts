export interface Livestock {
  id: number;
  type: 'COW' | 'CHICKEN';
  batchId?: string; // For chickens
  tagId?: string; // For cows
  quantity: number;
  initialWeight?: number;
  currentWeight?: number;
  status: 'ALIVE' | 'SLAUGHTERED' | 'SOLD' | 'DECEASED' | 'PARTIAL_SLAUGHTERED';
  dateReceived: string;
  farmLocation?: string;
  costPrice?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLivestockData {
  type: 'COW' | 'CHICKEN';
  batchId?: string;
  tagId?: string;
  quantity: number;
  initialWeight?: number;
  dateReceived: string;
  farmLocation?: string;
  costPrice?: number;
  notes?: string;
}
