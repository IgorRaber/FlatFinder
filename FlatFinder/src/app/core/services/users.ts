import { Injectable } from '@angular/core';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc
} from 'firebase/firestore';

import { db } from '../firebase/firebase';

export interface AppUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  isAdmin: boolean;
  favourites?: string[];
  provider?: string;
  flatsCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersCollection = collection(db, 'users');
  private flatsCollection = collection(db, 'flats');

  async getAllUsers(): Promise<AppUser[]> {
    const usersSnapshot = await getDocs(query(this.usersCollection));
    const flatsSnapshot = await getDocs(query(this.flatsCollection));

    const flats = flatsSnapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    })) as any[];

    return usersSnapshot.docs.map(docItem => {
      const user = {
        id: docItem.id,
        ...docItem.data()
      } as AppUser;

      const flatsCount = flats.filter(flat => flat.ownerId === user.id).length;

      return {
        ...user,
        flatsCount
      };
    });
  }

  async getUserById(userId: string): Promise<AppUser | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const flatsSnapshot = await getDocs(query(this.flatsCollection));
    const flats = flatsSnapshot.docs.map(docItem => ({
      id: docItem.id,
      ...docItem.data()
    })) as any[];

    const user = {
      id: userSnap.id,
      ...userSnap.data()
    } as AppUser;

    const flatsCount = flats.filter(flat => flat.ownerId === user.id).length;

    return {
      ...user,
      flatsCount
    };
  }

  async grantAdmin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { isAdmin: true });
  }

  async removeAdmin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), { isAdmin: false });
  }

  async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(db, 'users', userId));
  }
}