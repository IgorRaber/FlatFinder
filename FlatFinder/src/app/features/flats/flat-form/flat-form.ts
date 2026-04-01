import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { onAuthStateChanged, User } from 'firebase/auth';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { auth } from '../../../core/firebase/firebase';
import { Flat } from '../../../shared/models/flat';

@Component({
  selector: 'app-flat-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './flat-form.html',
  styleUrls: ['./flat-form.scss']
})
export class FlatForm {
  city = '';
  streetName = '';
  streetNumber = '';
  areaSize: number | null = null;
  hasAC = false;
  yearBuilt: number | null = null;
  rentPrice: number | null = null;
  dateAvailable = '';

  message = '';
  messageType: 'error' | 'success' = 'success';

  currentUser: User | null = null;
  isEditMode = false;
  flatId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = user;
      this.flatId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.flatId;

      if (this.isEditMode) {
        this.loadFlat();
      }
    });
  }

  loadFlat(): void {
    const flats: Flat[] = JSON.parse(localStorage.getItem('flats') || '[]');
    const flat = flats.find(f => f.id === this.flatId);

    if (!flat || !this.currentUser || flat.ownerId !== this.currentUser.uid) {
      this.router.navigate(['/my-flats']);
      return;
    }

    this.city = flat.city;
    this.streetName = flat.streetName;
    this.streetNumber = flat.streetNumber;
    this.areaSize = flat.areaSize;
    this.hasAC = flat.hasAC;
    this.yearBuilt = flat.yearBuilt;
    this.rentPrice = flat.rentPrice;
    this.dateAvailable = flat.dateAvailable;
  }

  onSubmit(): void {
    if (
      !this.currentUser ||
      !this.city ||
      !this.streetName ||
      !this.streetNumber ||
      this.areaSize === null ||
      this.yearBuilt === null ||
      this.rentPrice === null ||
      !this.dateAvailable
    ) {
      this.messageType = 'error';
      this.message = 'Please fill in all required fields.';
      return;
    }

    const flats: Flat[] = JSON.parse(localStorage.getItem('flats') || '[]');

    if (this.isEditMode && this.flatId) {
      const index = flats.findIndex(f => f.id === this.flatId);

      if (index === -1) {
        this.messageType = 'error';
        this.message = 'Flat not found.';
        return;
      }

      flats[index] = {
        ...flats[index],
        city: this.city,
        streetName: this.streetName,
        streetNumber: this.streetNumber,
        areaSize: this.areaSize,
        hasAC: this.hasAC,
        yearBuilt: this.yearBuilt,
        rentPrice: this.rentPrice,
        dateAvailable: this.dateAvailable
      };
    } else {
      const newFlat: Flat = {
        id: crypto.randomUUID(),
        city: this.city,
        streetName: this.streetName,
        streetNumber: this.streetNumber,
        areaSize: this.areaSize,
        hasAC: this.hasAC,
        yearBuilt: this.yearBuilt,
        rentPrice: this.rentPrice,
        dateAvailable: this.dateAvailable,
        ownerId: this.currentUser.uid,
        createdAt: new Date().toISOString()
      };

      flats.push(newFlat);
    }

    localStorage.setItem('flats', JSON.stringify(flats));
    this.router.navigate(['/my-flats']);
  }

  deleteFlat(): void {
    if (!this.flatId) return;

    const flats: Flat[] = JSON.parse(localStorage.getItem('flats') || '[]');
    const updated = flats.filter(f => f.id !== this.flatId);

    localStorage.setItem('flats', JSON.stringify(updated));
    this.router.navigate(['/my-flats']);
  }
}