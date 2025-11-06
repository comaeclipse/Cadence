export interface Food {
  id: string;
  childId: string;
  timestamp: string | Date;
  foodItem: string;
  amountConsumed: 'tried it' | 'ate some' | 'all of it';
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type AmountConsumedOption = 'tried it' | 'ate some' | 'all of it';
