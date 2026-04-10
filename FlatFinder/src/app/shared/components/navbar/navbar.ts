import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../core/firebase/firebase';

import { UsersService, AppUser } from '../../../core/services/users';
import { FlatsService } from '../../../core/services/flats';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit, OnDestroy {
  private usersService = inject(UsersService);
  private flatsService = inject(FlatsService);
  private ngZone = inject(NgZone);
  private router = inject(Router);

  currentUser: AppUser | null = null;
  isAdmin = false;
  unreadMessagesCount = 0;
  private unsubscribeUnread: (() => void) | null = null;

  ngOnInit(): void {
    onAuthStateChanged(auth, async (firebaseUser) => {
      this.unsubscribeUnread?.();
      this.unreadMessagesCount = 0;

      if (!firebaseUser) {
        this.ngZone.run(() => {
          this.currentUser = null;
          this.isAdmin = false;
        });
        return;
      }

      try {
        const user = await this.usersService.getUserById(firebaseUser.uid);

        this.ngZone.run(() => {
          this.currentUser = user;
          this.isAdmin = user?.isAdmin === true;
        });

        this.unsubscribeUnread = this.flatsService.listenUnreadOwnerMessages(
          firebaseUser.uid,
          (count) => {
            this.ngZone.run(() => {
              this.unreadMessagesCount = count;
            });
          }
        );
      } catch (error) {
        console.error('Error loading navbar user:', error);

        this.ngZone.run(() => {
          this.currentUser = null;
          this.isAdmin = false;
          this.unreadMessagesCount = 0;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeUnread?.();
  }

  async logout(): Promise<void> {
    await auth.signOut();
    await this.router.navigate(['/login']);
  }

  get hasUnread(): boolean {
  return this.unreadMessagesCount > 0;
}
}
