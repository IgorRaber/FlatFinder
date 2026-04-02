import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { onAuthStateChanged, User } from 'firebase/auth';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { auth } from '../../../core/firebase/firebase';
import { Flat } from '../../../shared/models/flat';
import { FlatsService } from '../../../core/services/flats';

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

  constructor(
    private router: Router,
    private flatsService: FlatsService,
    private cdr: ChangeDetectorRef
  ) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        await this.router.navigate(['/login']);
        return;
      }

      this.currentUser = user;
      await this.loadMyFlats(user.uid);
    });
  }

  async loadMyFlats(userId?: string): Promise<void> {
    const uid = userId ?? this.currentUser?.uid;

    if (!uid) return;

    try {
      this.myFlats = await this.flatsService.getMyFlats(uid);
      console.log('My flats:', this.myFlats);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading flats:', error);
      this.myFlats = [];
      this.cdr.detectChanges();
    }
  }

  async deleteFlat(id: string): Promise<void> {
    try {
      await this.flatsService.deleteFlat(id);
      await this.loadMyFlats();
    } catch (error) {
      console.error('Error deleting flat:', error);
    }
  }
}