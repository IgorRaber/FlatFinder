import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { onAuthStateChanged, User } from 'firebase/auth';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { auth } from '../../../core/firebase/firebase';
import { Flat } from '../../../shared/models/flat';

@Component({
  selector: 'app-my-flats',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './my-flats.html',
  styleUrls: ['./my-flats.scss']
})
export class MyFlats {
  currentUser: User | null = null;
  myFlats: Flat[] = [];

  constructor(private router: Router) {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = user;
      this.loadMyFlats();
    });
  }

  loadMyFlats(): void {
    if (!this.currentUser) return;

    const flats: Flat[] = JSON.parse(localStorage.getItem('flats') || '[]');

    this.myFlats = flats
      .filter(flat => flat.ownerId === this.currentUser!.uid)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  deleteFlat(id: string): void {
    const flats: Flat[] = JSON.parse(localStorage.getItem('flats') || '[]');
    const updated = flats.filter(flat => flat.id !== id);

    localStorage.setItem('flats', JSON.stringify(updated));
    this.loadMyFlats();
  }
}