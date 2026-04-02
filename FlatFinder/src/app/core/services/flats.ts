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
  where
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { Flat } from '../../shared/models/flat';

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

    return snapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    })) as Flat[];
  }

  listenToAllFlats(callback: (flats: Flat[]) => void) {
    const q = query(this.flatsCollection, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const flats = snapshot.docs.map(docItem => ({
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

  async getMyFlats(): Promise<Flat[]> {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const q = query(
      this.flatsCollection,
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    })) as Flat[];
  }

  async updateFlat(id: string, data: Partial<Flat>) {
    return updateDoc(doc(db, 'flats', id), data);
  }

  async deleteFlat(id: string) {
    return deleteDoc(doc(db, 'flats', id));
  }
}