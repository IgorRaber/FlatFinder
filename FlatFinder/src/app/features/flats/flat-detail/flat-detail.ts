import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Flat } from '../../../shared/models/flat';

@Component({
  selector: 'app-flat-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './flat-detail.html',
  styleUrls: ['./flat-detail.scss']
})
export class FlatDetail {
  flat: Flat | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    const flats: Flat[] = JSON.parse(localStorage.getItem('flats') || '[]');
    this.flat = flats.find(f => f.id === id) || null;

    if (!this.flat) {
      this.router.navigate(['/home']);
    }
  }
}