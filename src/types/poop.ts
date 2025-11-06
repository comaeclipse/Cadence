export interface Poop {
  id: string;
  childId: string;
  timestamp: string | Date;
  consistency: string;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type PoopConsistency = 'hard' | 'formed' | 'soft' | 'liquid';
