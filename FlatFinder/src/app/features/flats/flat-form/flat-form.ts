import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface Flat {
  id: string;
  city: string;
  streetName: string;
  streetNumber: string;
  areaSize: number;
  hasAC: boolean;
  yearBuilt: number;
  rentPrice: number;
  dateAvailable: string;
  ownerId: string;
  createdAt: string;
}

interface Session {
  userId: string;
}

@Component({
  selector: 'app-flat-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './flat-form.html',
  styleUrl: './flat-form.scss'
})
export class FlatForm {
  message = '';
  messageColor = '';

  city = '';
  streetName = '';
  streetNumber = '';
  areaSize: number | null = null;
  hasAC = false;
  yearBuilt: number | null = null;
  rentPrice: number | null = null;
  dateAvailable = '';

  constructor(private router: Router) {}

  clearMessage(): void {
    this.message = '';
    this.messageColor = '';
  }

  showError(text: string): void {
    this.message = text;
    this.messageColor = 'red';
  }

  showSuccess(text: string): void {
    this.message = text;
    this.messageColor = 'green';
  }

  getSession(): Session | null {
    const data = localStorage.getItem('session');
    return data ? JSON.parse(data) : null;
  }

  getFlats(): Flat[] {
    const data = localStorage.getItem('flats');
    return data ? JSON.parse(data) : [];
  }

  setFlats(flats: Flat[]): void {
    localStorage.setItem('flats', JSON.stringify(flats));
  }

  makeId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  onSubmit(): void {
    this.clearMessage();

    const city = this.city.trim();
    const streetName = this.streetName.trim();
    const streetNumber = this.streetNumber.trim();
    const areaSize = Number(this.areaSize);
    const yearBuilt = Number(this.yearBuilt);
    const rentPrice = Number(this.rentPrice);
    const dateAvailable = this.dateAvailable;

    if (city === '') {
      this.showError('City is required.');
      return;
    }

    if (streetName === '') {
      this.showError('Street name is required.');
      return;
    }

    if (streetNumber === '') {
      this.showError('Street number is required.');
      return;
    }

    if (!Number.isFinite(areaSize) || areaSize <= 0) {
      this.showError('Area size must be a number greater than 0.');
      return;
    }

    const currentYear = new Date().getFullYear();
    if (!Number.isFinite(yearBuilt) || yearBuilt < 1800 || yearBuilt > currentYear) {
      this.showError(`Year built must be between 1800 and ${currentYear}.`);
      return;
    }

    if (!Number.isFinite(rentPrice) || rentPrice <= 0) {
      this.showError('Rent price must be a number greater than 0.');
      return;
    }

    if (dateAvailable === '') {
      this.showError('Available date is required.');
      return;
    }

    const session = this.getSession();

    if (!session) {
      this.showError('Session not found. Please log in again.');
      return;
    }

    const newFlat: Flat = {
      id: this.makeId('f'),
      city,
      streetName,
      streetNumber,
      areaSize,
      hasAC: this.hasAC,
      yearBuilt,
      rentPrice,
      dateAvailable,
      ownerId: session.userId,
      createdAt: new Date().toISOString()
    };

    const flats = this.getFlats();
    flats.push(newFlat);
    this.setFlats(flats);

    this.showSuccess('Flat created successfully.');

    this.router.navigate(['/all-flats']);
  }

  logout(): void {
    localStorage.removeItem('session');
    this.router.navigate(['/login']);
  }
}