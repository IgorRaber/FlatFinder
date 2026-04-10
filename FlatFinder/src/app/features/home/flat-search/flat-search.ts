import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';

import { Flat } from '../../../shared/models/flat';
import { FlatsService } from '../../../core/services/flats';
import { AuthService } from '../../../core/services/auth';
import { FlatDetail } from '../../flats/flat-detail/flat-detail';

@Component({
  selector: 'app-flat-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule
  ],
  templateUrl: './flat-search.html',
  styleUrls: ['./flat-search.scss']
})
export class FlatSearch implements OnInit, OnDestroy {
  private flatsService = inject(FlatsService);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  private unsubscribeFlats: (() => void) | null = null;
  private unsubscribeAuth: (() => void) | null = null;
  private unsubscribeFavourites: (() => void) | null = null;

  allFlats: Flat[] = [];
  flats: Flat[] = [];
  favouriteIds: string[] = [];
  currentUserId: string | null = null;

  searchTerm = '';
  city = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minArea: number | null = null;
  sortBy = '';

  ngOnInit(): void {
    this.listenToAuth();
    this.listenToFlats();
  }

  ngOnDestroy(): void {
    this.unsubscribeFlats?.();
    this.unsubscribeAuth?.();
    this.unsubscribeFavourites?.();
  }

  listenToAuth(): void {
    this.unsubscribeAuth = this.authService.onAuthStateChanged((user) => {
      this.ngZone.run(() => {
        this.currentUserId = user?.uid ?? null;

        this.unsubscribeFavourites?.();
        this.unsubscribeFavourites = null;

        if (!user) {
          this.favouriteIds = [];
          this.applyFilters();
          this.cdr.detectChanges();
          return;
        }

        this.listenToFavouriteIds();
        this.applyFilters();
        this.cdr.detectChanges();
      });
    });
  }

  listenToFavouriteIds(): void {
    this.unsubscribeFavourites = this.authService.listenToFavouriteIds((ids: string[]) => {
      this.ngZone.run(() => {
        this.favouriteIds = ids;
        this.cdr.detectChanges();
      });
    });
  }

  listenToFlats(): void {
    this.unsubscribeFlats = this.flatsService.listenToAllFlats((flats: Flat[]) => {
      this.ngZone.run(() => {
        this.allFlats = flats;
        this.applyFilters();
        this.cdr.detectChanges();
      });
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

  applyFilters(): void {
    let filtered = [...this.allFlats];

    if (this.currentUserId) {
      filtered = filtered.filter((flat) => flat.ownerId !== this.currentUserId);
    }

    const normalizedSearch = this.searchTerm.trim().toLowerCase();
    const normalizedCity = this.city.trim().toLowerCase();

    if (normalizedSearch) {
      filtered = filtered.filter((flat) => {
        const city = flat.city?.toLowerCase() || '';
        const streetName = flat.streetName?.toLowerCase() || '';
        const streetNumber = String(flat.streetNumber ?? '').toLowerCase();

        return (
          city.includes(normalizedSearch) ||
          streetName.includes(normalizedSearch) ||
          streetNumber.includes(normalizedSearch)
        );
      });
    }

    if (normalizedCity) {
      filtered = filtered.filter(
        (flat) => flat.city?.toLowerCase() === normalizedCity
      );
    }

    if (this.minPrice !== null) {
      const minPrice = this.minPrice;
      filtered = filtered.filter(
        (flat) => Number(flat.rentPrice) >= minPrice
      );
    }

    if (this.maxPrice !== null) {
      const maxPrice = this.maxPrice;
      filtered = filtered.filter(
        (flat) => Number(flat.rentPrice) <= maxPrice
      );
    }

    if (this.minArea !== null) {
      const minArea = this.minArea;
      filtered = filtered.filter(
        (flat) => Number(flat.areaSize) >= minArea
      );
    }

    switch (this.sortBy) {
      case 'price':
        filtered.sort((a, b) => Number(a.rentPrice) - Number(b.rentPrice));
        break;

      case 'city':
        filtered.sort((a, b) => a.city.localeCompare(b.city));
        break;

      case 'area':
        filtered.sort((a, b) => Number(a.areaSize) - Number(b.areaSize));
        break;

      default:
        filtered.sort((a, b) => {
          const dateA = this.getCreatedAtTime(a.createdAt);
          const dateB = this.getCreatedAtTime(b.createdAt);
          return dateB - dateA;
        });
        break;
    }

    this.flats = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.city = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minArea = null;
    this.sortBy = '';
    this.applyFilters();
  }

  isFavourite(flatId: string): boolean {
    return this.favouriteIds.includes(flatId);
  }

  async toggleFavourite(flatId: string): Promise<void> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    const wasFavourite = this.isFavourite(flatId);

    if (wasFavourite) {
      this.favouriteIds = this.favouriteIds.filter((id) => id !== flatId);
    } else {
      this.favouriteIds = [...this.favouriteIds, flatId];
    }

    this.cdr.detectChanges();

    try {
      if (wasFavourite) {
        await this.authService.removeFavourite(flatId);
      } else {
        await this.authService.addFavourite(flatId);
      }
    } catch (error) {
      console.error('Error updating favourite:', error);

      if (wasFavourite) {
        this.favouriteIds = [...this.favouriteIds, flatId];
      } else {
        this.favouriteIds = this.favouriteIds.filter((id) => id !== flatId);
      }

      this.cdr.detectChanges();
    }
  }

  private getCreatedAtTime(value: any): number {
    if (!value) return 0;

    if (typeof value?.toDate === 'function') {
      return value.toDate().getTime();
    }

    if (typeof value?.seconds === 'number') {
      return value.seconds * 1000;
    }

    return new Date(value).getTime();
  }
}