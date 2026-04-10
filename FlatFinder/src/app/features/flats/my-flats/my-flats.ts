import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { onAuthStateChanged, User } from 'firebase/auth';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';

import { auth } from '../../../core/firebase/firebase';
import { Flat } from '../../../shared/models/flat';
import { FlatsService } from '../../../core/services/flats';
import { FlatDetail } from '../flat-detail/flat-detail';

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
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
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

  openFlat(flatId: string): void {
    this.dialog.open(FlatDetail, {
      width: '1000px',
      maxWidth: '92vw',
      maxHeight: '90vh',
      autoFocus: false,
      panelClass: 'flat-detail-dialog',
      data: { flatId }
    });
  }

  async loadMyFlats(userId?: string): Promise<void> {
    const uid = userId ?? this.currentUser?.uid;

    if (!uid) {
      return;
    }

    try {
      this.myFlats = await this.flatsService.getMyFlats(uid);
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