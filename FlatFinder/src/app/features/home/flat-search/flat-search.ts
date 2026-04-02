import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';

import { Flat } from '../../../shared/models/flat';
import { FlatsService } from '../../../core/services/flats';

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
  private ngZone = inject(NgZone);
  private unsubscribeFlats: (() => void) | null = null;

  allFlats: Flat[] = [];
  flats: Flat[] = [];

  searchTerm = '';
  city = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minArea: number | null = null;
  sortBy = '';

  ngOnInit(): void {
    this.listenToFlats();
  }

  ngOnDestroy(): void {
    this.unsubscribeFlats?.();
  }

  listenToFlats(): void {
    this.unsubscribeFlats = this.flatsService.listenToAllFlats((flats) => {
      this.ngZone.run(() => {
        this.allFlats = flats;
        this.applyFilters();
      });
    });
  }

  applyFilters(): void {
    let filtered = [...this.allFlats];

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
      filtered = filtered.filter(
        (flat) => Number(flat.rentPrice) >= this.minPrice!
      );
    }

    if (this.maxPrice !== null) {
      filtered = filtered.filter(
        (flat) => Number(flat.rentPrice) <= this.maxPrice!
      );
    }

    if (this.minArea !== null) {
      filtered = filtered.filter(
        (flat) => Number(flat.areaSize) >= this.minArea!
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

  private getCreatedAtTime(value: any): number {
    if (!value) return 0;

    if (typeof value?.toDate === 'function') {
      return value.toDate().getTime();
    }

    return new Date(value).getTime();
  }
}