import { Timestamp } from 'firebase/firestore';

export interface Flat {
  id: string;
  city: string;
  streetName: string;
  streetNumber: string;
  areaSize: number;
  hasAC: boolean;
  yearBuilt: number;
  rentPrice: number;
  dateAvailable: string;
  ownerId: string;
  createdAt: Timestamp | null;
}