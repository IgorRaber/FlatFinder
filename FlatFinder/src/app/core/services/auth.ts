import { Injectable } from '@angular/core';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail
} from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { User as UserProfile } from '../../shared/models/user';

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

  getCurrentUserPromise(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data()
    } as UserProfile;
  }

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser;

    if (!user) {
      return null;
    }

    return this.getUserProfile(user.uid);
  }

  async isCurrentUserAdmin(): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    return !!profile?.isAdmin;
  }

  async updateUserProfile(
    targetUserId: string,
    data: Partial<UserProfile>,
    passwordConfirmation: string
  ): Promise<void> {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const currentProfile = await this.getUserProfile(currentUser.uid);
    const isCurrentUserAdmin = !!currentProfile?.isAdmin;
    const isOwnProfile = currentUser.uid === targetUserId;

    if (!isOwnProfile && !isCurrentUserAdmin) {
      throw new Error('You do not have permission to edit this profile.');
    }

    const payload: Partial<UserProfile> = {
      firstName: data.firstName?.trim() ?? '',
      lastName: data.lastName?.trim() ?? '',
      birthDate: data.birthDate?.trim() ?? '',
      favourites: Array.isArray(data.favourites)
        ? data.favourites.filter((item) => !!item?.trim())
        : [],
    };

    if (isOwnProfile) {
      payload.email = data.email?.trim().toLowerCase() ?? currentUser.email ?? '';
    }

    if (isCurrentUserAdmin) {
      payload.isAdmin = !!data.isAdmin;
    }

    const isPasswordProvider = currentUser.providerData.some(
      (provider) => provider.providerId === 'password'
    );

    if (isOwnProfile && isPasswordProvider) {
      const email = currentUser.email;

      if (!email) {
        throw new Error('Current user email not found.');
      }

      if (!passwordConfirmation.trim()) {
        throw new Error('Please confirm your password.');
      }

      const credential = EmailAuthProvider.credential(email, passwordConfirmation);
      await reauthenticateWithCredential(currentUser, credential);

      if (payload.email && payload.email !== currentUser.email) {
        await updateEmail(currentUser, payload.email);
      }
    }

    await updateDoc(doc(db, 'users', targetUserId), payload);
  }

  async getFavouriteIds(): Promise<string[]> {
    const user = auth.currentUser;

    if (!user) {
      return [];
    }

    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.data();
    return Array.isArray(data['favourites']) ? data['favourites'] : [];
  }

  listenToFavouriteIds(callback: (ids: string[]) => void): () => void {
    const user = auth.currentUser;

    if (!user) {
      callback([]);
      return () => {};
    }

    const userRef = doc(db, 'users', user.uid);

    return onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback([]);
        return;
      }

      const data = snapshot.data();
      const favouriteIds = Array.isArray(data['favourites']) ? data['favourites'] : [];
      callback(favouriteIds);
    });
  }

  async addFavourite(flatId: string): Promise<void> {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      favourites: arrayUnion(flatId)
    });
  }

  async removeFavourite(flatId: string): Promise<void> {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      favourites: arrayRemove(flatId)
    });
  }

  async toggleFavourite(flatId: string): Promise<boolean> {
    const favouriteIds = await this.getFavouriteIds();
    const isAlreadyFavourite = favouriteIds.includes(flatId);

    if (isAlreadyFavourite) {
      await this.removeFavourite(flatId);
      return false;
    }

    await this.addFavourite(flatId);
    return true;
  }
}