import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../../core/firebase/firebase';

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

@Component({
  selector: 'app-flat-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './flat-form.html',
  styleUrls: ['./flat-form.scss']
})
export class FlatForm implements OnInit {
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
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = user;
      this.flatId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.flatId;

      if (this.isEditMode) {
        this.loadFlatForEdit();
      }
    });
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
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    const flats = this.getFlats();
    const flat = flats.find((f) => f.id === this.flatId);

    if (!flat) {
      this.router.navigate(['/home']);
      return;
    }

    if (flat.ownerId !== this.currentUser.uid) {
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

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

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

    const flats = this.getFlats();

    if (this.isEditMode) {
      const index = flats.findIndex((f) => f.id === this.flatId);

      if (index === -1) {
        this.showError('Flat not found.');
        return;
      }

      if (flats[index].ownerId !== this.currentUser.uid) {
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
      ownerId: this.currentUser.uid,
      createdAt: new Date().toISOString()
    };

    flats.push(newFlat);
    this.setFlats(flats);
    this.router.navigate(['/home']);
  }

  deleteFlat(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.isEditMode || !this.currentFlat) {
      return;
    }

    if (this.currentFlat.ownerId !== this.currentUser.uid) {
      this.router.navigate(['/home']);
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete your flat?');

    if (!confirmed) {
      return;
    }

    const flats = this.getFlats();
    const updatedFlats = flats.filter((f) => f.id !== this.currentFlat?.id);

    this.setFlats(updatedFlats);
    this.router.navigate(['/home']);
  }

  async logout(): Promise<void> {
    await signOut(auth);
    this.router.navigate(['/login']);
  }
}