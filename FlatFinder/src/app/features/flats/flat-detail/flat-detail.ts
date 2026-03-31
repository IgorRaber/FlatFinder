import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
  templateUrl: './flat-detail.html',
  styleUrls: ['./flat-detail.scss']
})
export class FlatDetail implements OnInit {
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

  isEditMode = false;
  flatId: string | null = null;
  currentFlat: Flat | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.flatId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.flatId;

    if (this.isEditMode) {
      this.loadFlatForEdit();
    }
  }

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

  loadFlatForEdit(): void {
    const session = this.getSession();

    if (!session) {
      this.router.navigate(['/login']);
      return;
    }

    const flats = this.getFlats();
    const flat = flats.find((f) => f.id === this.flatId);

    if (!flat) {
      this.router.navigate(['/home']);
      return;
    }

    if (flat.ownerId !== session.userId) {
      this.router.navigate(['/home']);
      return;
    }

    this.currentFlat = flat;

    this.city = flat.city;
    this.streetName = flat.streetName;
    this.streetNumber = flat.streetNumber;
    this.areaSize = flat.areaSize;
    this.hasAC = !!flat.hasAC;
    this.yearBuilt = flat.yearBuilt;
    this.rentPrice = flat.rentPrice;
    this.dateAvailable = flat.dateAvailable;
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

    const flats = this.getFlats();

    if (this.isEditMode) {
      const index = flats.findIndex((f) => f.id === this.flatId);

      if (index === -1) {
        this.showError('Flat not found.');
        return;
      }

      if (flats[index].ownerId !== session.userId) {
        this.showError('You are not allowed to edit this flat.');
        return;
      }

      flats[index] = {
        ...flats[index],
        city,
        streetName,
        streetNumber,
        areaSize,
        hasAC: this.hasAC,
        yearBuilt,
        rentPrice,
        dateAvailable
      };

      this.setFlats(flats);
      this.showSuccess('Flat updated successfully.');
      this.router.navigate(['/home']);
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

    flats.push(newFlat);
    this.setFlats(flats);

    this.showSuccess('Flat created successfully.');
    this.router.navigate(['/home']);
  }

  deleteFlat(): void {
    if (!this.isEditMode || !this.currentFlat) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete your flat?');

    if (!confirmed) {
      return;
    }

    const session = this.getSession();

    if (!session) {
      this.router.navigate(['/login']);
      return;
    }

    const flats = this.getFlats();
    const updatedFlats = flats.filter((f) => f.id !== this.currentFlat?.id);

    this.setFlats(updatedFlats);
    this.router.navigate(['/home']);
  }

  logout(): void {
    localStorage.removeItem('session');
    this.router.navigate(['/login']);
  }
}