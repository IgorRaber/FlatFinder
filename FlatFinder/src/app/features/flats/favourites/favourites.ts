import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { Flat } from '../../../shared/models/flat';
import { FlatsService } from '../../../core/services/flats';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-favourites',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './favourites.html',
  styleUrls: ['./favourites.scss']
})
export class Favourites implements OnInit, OnDestroy {
  private flatsService = inject(FlatsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  private unsubscribeFlats: (() => void) | null = null;
  private unsubscribeFavourites: (() => void) | null = null;

  allFlats: Flat[] = [];
  favouriteIds: string[] = [];
  favouriteFlats: Flat[] = [];

  async ngOnInit(): Promise<void> {
    const user = await this.authService.getCurrentUserPromise();

    if (!user) {
      await this.router.navigate(['/login']);
      return;
    }

    this.listenToFavouriteIds();
    this.listenToFlats();
  }

  ngOnDestroy(): void {
    this.unsubscribeFlats?.();
    this.unsubscribeFavourites?.();
  }

  listenToFavouriteIds(): void {
    this.unsubscribeFavourites = this.authService.listenToFavouriteIds((ids) => {
      this.ngZone.run(() => {
        this.favouriteIds = ids;
        this.applyFavouriteFilter();
        this.cdr.detectChanges();
      });
    });
  }

  listenToFlats(): void {
    this.unsubscribeFlats = this.flatsService.listenToAllFlats((flats) => {
      this.ngZone.run(() => {
        this.allFlats = flats;
        this.applyFavouriteFilter();
        this.cdr.detectChanges();
      });
    });
  }

  applyFavouriteFilter(): void {
    this.favouriteFlats = this.allFlats.filter((flat) =>
      this.favouriteIds.includes(flat.id)
    );
  }

  async removeFromFavourites(flatId: string): Promise<void> {
    try {
      await this.authService.removeFavourite(flatId);
    } catch (error) {
      console.error('Error removing favourite:', error);
    }
  }
}