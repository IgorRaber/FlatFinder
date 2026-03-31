import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../../shared/components/navbar/navbar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-flat-search',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './flat-search.html',
  styleUrl: './flat-search.scss'
})
export class FlatSearch {
  flats = [
    {
      id: '1',
      city: 'Vancouver',
      streetName: 'Main Street',
      streetNumber: 120,
      areaSize: 85,
      rentPrice: 2400,
      hasAc: true,
      yearBuilt: 2018,
      dateAvailable: '2026-04-15'
    },
    {
      id: '2',
      city: 'Burnaby',
      streetName: 'Kingsway',
      streetNumber: 4500,
      areaSize: 72,
      rentPrice: 2100,
      hasAc: false,
      yearBuilt: 2015,
      dateAvailable: '2026-05-01'
    },
    {
      id: '3',
      city: 'Richmond',
      streetName: 'No. 3 Road',
      streetNumber: 800,
      areaSize: 95,
      rentPrice: 2800,
      hasAc: true,
      yearBuilt: 2020,
      dateAvailable: '2026-04-01'
    }
  ];
}