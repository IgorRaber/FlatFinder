import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { FlatsService } from '../../../core/services/flats';
import { Flat } from '../../../shared/models/flat';
import { FlatMessages } from '../flat-messages/flat-messages';

@Component({
  selector: 'app-flat-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FlatMessages
  ],
  templateUrl: './flat-detail.html',
  styleUrl: './flat-detail.scss'
})
export class FlatDetail implements OnInit, OnChanges {
  @Input() flatId = '';

  private flatsService = inject(FlatsService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private dialogData = inject(MAT_DIALOG_DATA, { optional: true }) as { flatId?: string } | null;
  public dialogRef = inject(MatDialogRef<FlatDetail>, { optional: true });

  flat: Flat | null = null;
  loading = true;
  errorMessage = '';
  isOwner = false;

  private readonly editRouteBase = '/my-flats/edit';

  get isDialog(): boolean {
    return !!this.dialogRef;
  }

  get resolvedFlatId(): string {
    return this.flatId || this.dialogData?.flatId || '';
  }

  async ngOnInit(): Promise<void> {
    await this.loadFlat();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['flatId']) {
      await this.loadFlat();
    }
  }

  async loadFlat(): Promise<void> {
    const currentFlatId = this.resolvedFlatId;

    if (!currentFlatId) {
      this.errorMessage = 'Flat id not provided.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const [flat, currentUser] = await Promise.all([
        this.flatsService.getFlatById(currentFlatId),
        this.authService.getCurrentUserPromise()
      ]);

      if (!flat) {
        this.errorMessage = 'Flat not found.';
        this.loading = false;
        return;
      }

      if (!currentUser) {
        this.errorMessage = 'User not authenticated.';
        this.loading = false;
        return;
      }

      this.flat = flat;
      this.isOwner = flat.ownerId === currentUser.uid;
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Failed to load flat details.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  goToEdit(): void {
    if (!this.flat?.id) {
      return;
    }

    this.dialogRef?.close();
    this.router.navigate([this.editRouteBase, this.flat.id]);
  }

  close(): void {
    this.dialogRef?.close();
  }
}