import { Timestamp } from 'firebase/firestore';

export interface FlatMessage {
  id?: string;
  flatId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  createdAt: Timestamp | null;
}