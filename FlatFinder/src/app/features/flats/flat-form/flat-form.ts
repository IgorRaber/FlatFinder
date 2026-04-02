import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { onAuthStateChanged, User } from 'firebase/auth';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { auth } from '../../../core/firebase/firebase';
import { FlatsService } from '../../../core/services/flats';

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
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [FlatsService],
  templateUrl: './flat-form.html',
  styleUrls: ['./flat-form.scss']
})
export class FlatForm {
  city = '';
  streetName = '';
  streetNumber: number | null = null;
  areaSize: number | null = null;
  hasAC = false;
  yearBuilt: number | null = null;
  rentPrice: number | null = null;
  dateAvailable: Date | null = null;

  message = '';
  messageType: 'error' | 'success' = 'success';

  currentUser: User | null = null;
  isEditMode = false;
  flatId: string | null = null;
  isLoading = false;
  minAvailableDate = new Date();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(FlatsService) private flatsService: FlatsService
  ) {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = user;
      this.flatId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.flatId;

      if (this.isEditMode) {
        await this.loadFlat();
      }
    });
  }

  async loadFlat(): Promise<void> {
    if (!this.flatId || !this.currentUser) return;

    const flat = await this.flatsService.getFlatById(this.flatId);

    if (!flat || flat.ownerId !== this.currentUser.uid) {
      this.router.navigate(['/my-flats']);
      return;
    }

    this.city = flat.city;
    this.streetName = flat.streetName;
    this.streetNumber = Number(flat.streetNumber);
    this.areaSize = Number(flat.areaSize);
    this.hasAC = !!flat.hasAC;
    this.yearBuilt = Number(flat.yearBuilt);
    this.rentPrice = Number(flat.rentPrice);
    this.dateAvailable = flat.dateAvailable ? new Date(flat.dateAvailable) : null;
  }

  private isFormInvalid(): boolean {
    return (
      !this.currentUser ||
      !this.city.trim() ||
      !this.streetName.trim() ||
      this.streetNumber === null ||
      this.streetNumber <= 0 ||
      this.areaSize === null ||
      this.areaSize <= 0 ||
      this.yearBuilt === null ||
      this.yearBuilt < 1800 ||
      this.rentPrice === null ||
      this.rentPrice <= 0 ||
      !this.dateAvailable
    );
  }

  async onSubmit(): Promise<void> {
    if (this.isFormInvalid()) {
      this.messageType = 'error';
      this.message = 'Please fill in all required fields with valid values.';
      return;
    }

    this.isLoading = true;
    this.message = '';

    try {
      const payload = {
        city: this.city.trim(),
        streetName: this.streetName.trim(),
        streetNumber: String(this.streetNumber),
        areaSize: Number(this.areaSize),
        hasAC: this.hasAC,
        yearBuilt: Number(this.yearBuilt),
        rentPrice: Number(this.rentPrice),
        dateAvailable: this.dateAvailable instanceof Date
          ? this.dateAvailable.toISOString()
          : String(this.dateAvailable)
      };

      if (this.isEditMode && this.flatId) {
        await this.flatsService.updateFlat(this.flatId, payload);
        this.messageType = 'success';
        this.message = 'Flat updated successfully.';
      } else {
        await this.flatsService.createFlat(payload);
        this.messageType = 'success';
        this.message = 'Flat created successfully.';
      }

      await this.router.navigate(['/my-flats']);
    } catch (error) {
      console.error(error);
      this.messageType = 'error';
      this.message = 'Something went wrong while saving the flat.';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteFlat(): Promise<void> {
    if (!this.flatId) return;

    try {
      await this.flatsService.deleteFlat(this.flatId);
      await this.router.navigate(['/my-flats']);
    } catch (error) {
      console.error(error);
      this.messageType = 'error';
      this.message = 'Could not delete this flat.';
    }
  }
}