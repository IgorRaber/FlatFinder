import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AppUser, UsersService } from '../../../core/services/users';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss'
})
export class UsersList implements OnInit {
  private usersService = inject(UsersService);
  private snackBar = inject(MatSnackBar);

  allUsers: AppUser[] = [];
  users: AppUser[] = [];

  searchTerm = '';
  userType = '';
  isAdminFilter = '';
  minAge: number | null = null;
  maxAge: number | null = null;
  minFlats: number | null = null;
  maxFlats: number | null = null;
  sortBy = '';

  isLoading = false;

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.isLoading = true;

    try {
      this.allUsers = await this.usersService.getAllUsers();
      this.applyFilters();
    } catch (error) {
      console.error(error);
      this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    let filtered = [...this.allUsers];

    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (normalizedSearch) {
      filtered = filtered.filter(user => {
        const firstName = user.firstName?.toLowerCase() || '';
        const lastName = user.lastName?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';

        return (
          firstName.includes(normalizedSearch) ||
          lastName.includes(normalizedSearch) ||
          email.includes(normalizedSearch)
        );
      });
    }

    if (this.userType === 'google') {
      filtered = filtered.filter(user => user.provider === 'google');
    }

    if (this.userType === 'password') {
      filtered = filtered.filter(user => user.provider !== 'google');
    }

    if (this.isAdminFilter === 'yes') {
      filtered = filtered.filter(user => user.isAdmin);
    }

    if (this.isAdminFilter === 'no') {
      filtered = filtered.filter(user => !user.isAdmin);
    }

    if (this.minAge !== null) {
      filtered = filtered.filter(user => this.getAge(user.birthDate) >= this.minAge!);
    }

    if (this.maxAge !== null) {
      filtered = filtered.filter(user => this.getAge(user.birthDate) <= this.maxAge!);
    }

    if (this.minFlats !== null) {
      filtered = filtered.filter(user => (user.flatsCount || 0) >= this.minFlats!);
    }

    if (this.maxFlats !== null) {
      filtered = filtered.filter(user => (user.flatsCount || 0) <= this.maxFlats!);
    }

    switch (this.sortBy) {
      case 'firstName':
        filtered.sort((a, b) => a.firstName.localeCompare(b.firstName));
        break;
      case 'lastName':
        filtered.sort((a, b) => a.lastName.localeCompare(b.lastName));
        break;
      case 'flatsCount':
        filtered.sort((a, b) => (b.flatsCount || 0) - (a.flatsCount || 0));
        break;
    }

    this.users = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.userType = '';
    this.isAdminFilter = '';
    this.minAge = null;
    this.maxAge = null;
    this.minFlats = null;
    this.maxFlats = null;
    this.sortBy = '';
    this.users = [...this.allUsers];
  }

  async makeAdmin(userId: string): Promise<void> {
    try {
      await this.usersService.grantAdmin(userId);
      this.snackBar.open('Admin permission granted', 'Close', { duration: 2500 });
      await this.loadUsers();
    } catch (error) {
      console.error(error);
      this.snackBar.open('Failed to update user', 'Close', { duration: 2500 });
    }
  }

  async removeAdmin(userId: string): Promise<void> {
    try {
      await this.usersService.removeAdmin(userId);
      this.snackBar.open('Admin permission removed', 'Close', { duration: 2500 });
      await this.loadUsers();
    } catch (error) {
      console.error(error);
      this.snackBar.open('Failed to update user', 'Close', { duration: 2500 });
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const confirmed = window.confirm('Are you sure you want to remove this user?');

    if (!confirmed) return;

    try {
      await this.usersService.deleteUser(userId);
      this.snackBar.open('User removed successfully', 'Close', { duration: 2500 });
      await this.loadUsers();
    } catch (error) {
      console.error(error);
      this.snackBar.open('Failed to remove user', 'Close', { duration: 2500 });
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
}