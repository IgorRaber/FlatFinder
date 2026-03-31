import { Injectable } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async register(data: {
    firstName: string;
    lastName: string;
    birthDate: string;
    email: string;
    password: string;
  }) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    await setDoc(doc(db, 'users', credential.user.uid), {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      isAdmin: false,
      favourites: [],
    });

    return credential;
  }

  logout() {
    return signOut(auth);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}