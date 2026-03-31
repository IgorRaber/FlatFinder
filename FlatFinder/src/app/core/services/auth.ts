import { Injectable } from '@angular/core';
import {
  User,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      provider: 'password',
    });

    return credential;
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const credential = await signInWithPopup(auth, provider);
    const user = credential.user;

    const userRef = doc(db, 'users', user.uid);
    const existingUser = await getDoc(userRef);

    if (!existingUser.exists()) {
      const displayName = user.displayName ?? '';
      const [firstName = '', ...rest] = displayName.split(' ');
      const lastName = rest.join(' ');

      await setDoc(userRef, {
        email: user.email ?? '',
        firstName,
        lastName,
        birthDate: '',
        isAdmin: false,
        favourites: [],
        provider: 'google',
      });
    }

    return credential;
  }

  async sendResetPasswordEmail(email: string) {
    return sendPasswordResetEmail(auth, email);
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