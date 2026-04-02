import { ChangeDetectorRef, Component, NgZone, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { AuthService } from '../../../core/services/auth';
import { User as UserProfile } from '../../../shared/models/user';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './profile-edit.html',
  styleUrls: ['./profile-edit.scss']
})
export class ProfileEdit implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  currentViewer: UserProfile | null = null;
  targetProfile: UserProfile | null = null;

  targetUserId = '';
  isOwnProfile = false;
  isCurrentUserAdmin = false;
  isPasswordProvider = false;

  isLoading = true;
  isSaving = false;

  message = '';
  messageType: 'error' | 'success' = 'success';

  email = '';
  firstName = '';
  lastName = '';
  birthDate = '';
  favouritesText = '';
  isAdmin = false;
  passwordConfirmation = '';

  async ngOnInit(): Promise<void> {
    try {
      const authUser = await this.authService.getCurrentUserPromise();

      await this.ngZone.run(async () => {
        if (!authUser) {
          await this.router.navigate(['/login']);
          return;
        }

        this.targetUserId = this.route.snapshot.paramMap.get('id') ?? authUser.uid;
        this.isOwnProfile = this.targetUserId === authUser.uid;
        this.isPasswordProvider = authUser.providerData.some(
          (provider) => provider.providerId === 'password'
        );

        this.currentViewer = await this.authService.getUserProfile(authUser.uid);
        this.isCurrentUserAdmin = !!this.currentViewer?.isAdmin;

        if (!this.isOwnProfile && !this.isCurrentUserAdmin) {
          await this.router.navigate(['/home']);
          return;
        }

        this.targetProfile = await this.authService.getUserProfile(this.targetUserId);

        if (!this.targetProfile) {
          await this.router.navigate(['/home']);
          return;
        }

        this.email = this.targetProfile.email;
        this.firstName = this.targetProfile.firstName;
        this.lastName = this.targetProfile.lastName;
        this.birthDate = this.targetProfile.birthDate;
        this.favouritesText = (this.targetProfile.favourites ?? []).join(', ');
        this.isAdmin = this.targetProfile.isAdmin;

        this.isLoading = false;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error loading edit profile:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getCancelLink(): any[] {
    return this.isOwnProfile
      ? ['/profile']
      : ['/profile', this.targetUserId];
  }

  private parseFavourites(): string[] {
    return this.favouritesText
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item);
  }

  private isFormInvalid(): boolean {
    return (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.birthDate.trim() ||
      !this.email.trim()
    );
  }

  async onSubmit(): Promise<void> {
    if (this.isFormInvalid()) {
      this.messageType = 'error';
      this.message = 'Please fill in all required fields.';
      return;
    }

    if (this.isOwnProfile && this.isPasswordProvider && !this.passwordConfirmation.trim()) {
      this.messageType = 'error';
      this.message = 'Please confirm your current password.';
      return;
    }

    this.isSaving = true;
    this.message = '';
    this.cdr.detectChanges();

    try {
      const payload: Partial<UserProfile> = {
        email: this.email.trim().toLowerCase(),
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        birthDate: this.birthDate.trim(),
        favourites: this.parseFavourites(),
        isAdmin: this.isCurrentUserAdmin ? this.isAdmin : this.targetProfile?.isAdmin ?? false
      };

      await this.authService.updateUserProfile(
        this.targetUserId,
        payload,
        this.passwordConfirmation
      );

      if (this.isOwnProfile) {
        await this.router.navigate(['/home']);
      } else {
        await this.router.navigate(['/admin/users']);
      }
    } catch (error: any) {
      console.error(error);
      this.messageType = 'error';
      this.message = error?.message || 'Could not update the profile.';
    } finally {
      this.isSaving = false;
      this.cdr.detectChanges();
    }
  }
}