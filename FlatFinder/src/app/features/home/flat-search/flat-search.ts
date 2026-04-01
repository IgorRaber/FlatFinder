import { Component, OnInit } from '@angular/core';
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
export class FlatSearch implements OnInit {
  allFlats: Flat[] = [];
  flats: Flat[] = [];

  searchTerm = '';
  city = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minArea: number | null = null;
  sortBy = '';

  ngOnInit(): void {
    this.loadFlats();
  }

  loadFlats(): void {
    this.allFlats = JSON.parse(localStorage.getItem('flats') || '[]');
    this.flats = [...this.allFlats];
    this.applyFilters();
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

    if (this.minPrice !== null && this.minPrice !== undefined) {
      filtered = filtered.filter(
        (flat) => Number(flat.rentPrice) >= Number(this.minPrice)
      );
    }

    if (this.maxPrice !== null && this.maxPrice !== undefined) {
      filtered = filtered.filter(
        (flat) => Number(flat.rentPrice) <= Number(this.maxPrice)
      );
    }

    if (this.minArea !== null && this.minArea !== undefined) {
      filtered = filtered.filter(
        (flat) => Number(flat.areaSize) >= Number(this.minArea)
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
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
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

    this.flats = [...this.allFlats].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }
}