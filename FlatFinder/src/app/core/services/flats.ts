import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Flat } from '../../shared/models/flat';
import { FlatMessage } from '../../shared/models/messages';

@Injectable({
  providedIn: 'root'
})
export class FlatsService {
  private flatsCollection = collection(db, 'flats');

  async createFlat(flat: Omit<Flat, 'id' | 'ownerId' | 'createdAt'>) {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    return addDoc(this.flatsCollection, {
      ...flat,
      ownerId: user.uid,
      createdAt: serverTimestamp()
    });
  }

  async getAllFlats(): Promise<Flat[]> {
    const q = query(this.flatsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docItem: QueryDocumentSnapshot<DocumentData>) => ({
      id: docItem.id,
      ...docItem.data()
    })) as Flat[];
  }

  listenToAllFlats(callback: (flats: Flat[]) => void): () => void {
    const q = query(this.flatsCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const flats = snapshot.docs.map((docItem: QueryDocumentSnapshot<DocumentData>) => ({
        id: docItem.id,
        ...docItem.data()
      })) as Flat[];

      callback(flats);
    });
  }

  async getFlatById(id: string): Promise<Flat | null> {
    const flatRef = doc(db, 'flats', id);
    const snapshot = await getDoc(flatRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Flat;
  }

  async getMyFlats(userId: string): Promise<Flat[]> {
    const q = query(this.flatsCollection, where('ownerId', '==', userId));
    const snapshot = await getDocs(q);

    const flats = snapshot.docs.map((docItem: QueryDocumentSnapshot<DocumentData>) => ({
      id: docItem.id,
      ...docItem.data()
    })) as Flat[];

    return flats.sort(
      (a, b) => this.getCreatedAtTime(b.createdAt) - this.getCreatedAtTime(a.createdAt)
    );
  }

  async getFlatsByOwnerId(ownerId: string): Promise<Flat[]> {
    const q = query(this.flatsCollection, where('ownerId', '==', ownerId));
    const snapshot = await getDocs(q);

    const flats = snapshot.docs.map((docItem: QueryDocumentSnapshot<DocumentData>) => ({
      id: docItem.id,
      ...docItem.data()
    })) as Flat[];

    return flats.sort(
      (a, b) => this.getCreatedAtTime(b.createdAt) - this.getCreatedAtTime(a.createdAt)
    );
  }

  listenToMessages(
    flatId: string,
    currentUserId: string,
    isOwner: boolean,
    callback: (messages: FlatMessage[]) => void
  ): () => void {
    const messagesCollection = collection(db, 'flats', flatId, 'messages');

    const messagesQuery = isOwner
      ? query(messagesCollection, orderBy('createdAt', 'desc'))
      : query(
          messagesCollection,
          where('senderId', '==', currentUserId),
          orderBy('createdAt', 'desc')
        );

    return onSnapshot(messagesQuery, (snapshot: QuerySnapshot<DocumentData>) => {
      const messages = snapshot.docs.map((messageDoc: QueryDocumentSnapshot<DocumentData>) => ({
        id: messageDoc.id,
        ...messageDoc.data()
      })) as FlatMessage[];

      callback(messages);
    });
  }

  async createMessage(flatId: string, content: string): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const messagesCollection = collection(db, 'flats', flatId, 'messages');

    await addDoc(messagesCollection, {
      flatId,
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'User',
      senderEmail: currentUser.email || '',
      content: content.trim(),
      createdAt: serverTimestamp()
    });
  }

  async updateFlat(id: string, data: Partial<Flat>) {
    return updateDoc(doc(db, 'flats', id), data);
  }

  async deleteFlat(id: string) {
    return deleteDoc(doc(db, 'flats', id));
  }

  private getCreatedAtTime(value: unknown): number {
    if (!value) return 0;

    if (
      typeof value === 'object' &&
      value !== null &&
      'toDate' in value &&
      typeof (value as { toDate: () => Date }).toDate === 'function'
    ) {
      return (value as { toDate: () => Date }).toDate().getTime();
    }

    if (
      typeof value === 'object' &&
      value !== null &&
      'seconds' in value &&
      typeof (value as { seconds: number }).seconds === 'number'
    ) {
      return (value as { seconds: number }).seconds * 1000;
    }

    if (typeof value === 'string') {
      return new Date(value).getTime();
    }

    return 0;
  }
}