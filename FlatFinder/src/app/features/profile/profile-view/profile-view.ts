import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth';
import { FlatsService } from '../../../core/services/flats';
import { User as UserProfile } from '../../../shared/models/user';
import { Flat } from '../../../shared/models/flat';
import { FlatMessages } from '../../flats/flat-messages/flat-messages';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    FlatMessages
  ],
  templateUrl: './profile-view.html',
  styleUrls: ['./profile-view.scss']
})
export class ProfileView implements OnInit {
  private authService = inject(AuthService);
  private flatsService = inject(FlatsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  profile: UserProfile | null = null;
  currentViewer: UserProfile | null = null;
  ownedFlats: Flat[] = [];

  isLoading = true;
  isOwnProfile = false;
  canEdit = false;

  async ngOnInit(): Promise<void> {
    try {
      const authUser = await this.authService.getCurrentUserPromise();

      await this.ngZone.run(async () => {
        if (!authUser) {
          await this.router.navigate(['/login']);
          return;
        }

        const requestedUserId = this.route.snapshot.paramMap.get('id') ?? authUser.uid;

        this.currentViewer = await this.authService.getUserProfile(authUser.uid);
        this.isOwnProfile = requestedUserId === authUser.uid;

        const isAdmin = !!this.currentViewer?.isAdmin;

        if (!this.isOwnProfile && !isAdmin) {
          await this.router.navigate(['/home']);
          return;
        }

        this.profile = await this.authService.getUserProfile(requestedUserId);

        if (!this.profile) {
          await this.router.navigate(['/home']);
          return;
        }

        this.canEdit = this.isOwnProfile || isAdmin;

        if (this.isOwnProfile) {
          this.ownedFlats = await this.flatsService.getFlatsByOwnerId(authUser.uid);
          await this.flatsService.markOwnerMessagesAsRead(authUser.uid);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getEditLink(): any[] {
    if (!this.profile) {
      return ['/profile/edit'];
    }

    return this.isOwnProfile
      ? ['/profile/edit']
      : ['/profile', this.profile.id, 'edit'];
  }
}