import { Component, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { UsersService, AppUser } from '../../../core/services/users';
import { FlatsService } from '../../../core/services/flats';
import { Flat } from '../../../shared/models/flat';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss'
})
export class UserDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  private flatsService = inject(FlatsService);
  private ngZone = inject(NgZone);

  user: AppUser | null = null;
  userFlats: Flat[] = [];
  isLoading = true;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Invalid user id.';
      this.isLoading = false;
      return;
    }

    try {
      const [user, flats] = await Promise.all([
        this.usersService.getUserById(id),
        this.flatsService.getFlatsByOwnerId(id)
      ]);

      this.ngZone.run(() => {
        this.user = user;
        this.userFlats = flats;

        if (!this.user) {
          this.errorMessage = 'User not found.';
        }

        this.isLoading = false;
      });
    } catch (error) {
      console.error('Error loading user details:', error);

      this.ngZone.run(() => {
        this.errorMessage = 'Failed to load user details.';
        this.isLoading = false;
      });
    }
  }

  getAge(birthDate: string): number {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  getCreatedAtTime(value: any): number {
    if (!value) return 0;

    if (typeof value?.toDate === 'function') {
      return value.toDate().getTime();
    }

    return new Date(value).getTime();
  }
}