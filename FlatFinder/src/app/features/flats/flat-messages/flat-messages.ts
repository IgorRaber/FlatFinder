import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth';
import { FlatsService } from '../../../core/services/flats';
import { FlatMessage } from '../../../shared/models/messages';

@Component({
  selector: 'app-flat-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './flat-messages.html',
  styleUrl: './flat-messages.scss'
})
export class FlatMessages implements OnChanges, OnDestroy {
  @Input({ required: true }) flatId!: string;
  @Input() isOwner = false;

  private flatsService = inject(FlatsService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  messages: FlatMessage[] = [];
  loading = true;
  sending = false;
  newMessage = '';
  currentUserId = '';
  errorMessage = '';

  private stopMessagesListener: (() => void) | null = null;

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.flatId) {
      return;
    }

    if (changes['flatId'] || changes['isOwner']) {
      await this.loadMessages();
    }
  }

  ngOnDestroy(): void {
    this.stopMessagesListener?.();
  }

  private async loadMessages(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      const currentUser = await this.authService.getCurrentUserPromise();

      if (!currentUser) {
        this.errorMessage = 'User not authenticated.';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      this.currentUserId = currentUser.uid;

      this.stopMessagesListener?.();

      this.stopMessagesListener = this.flatsService.listenToMessages(
        this.flatId,
        this.currentUserId,
        this.isOwner,
        (messages) => {
          this.zone.run(() => {
            this.messages = messages;
            this.loading = false;
            this.cdr.detectChanges();
          });
        }
      );
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Failed to load messages.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async sendMessage(): Promise<void> {
    if (this.isOwner) {
      return;
    }

    const content = this.newMessage.trim();

    if (!content) {
      this.snackBar.open('Write a message first.', 'Close', { duration: 2500 });
      return;
    }

    this.sending = true;

    try {
      await this.flatsService.createMessage(this.flatId, content);
      this.newMessage = '';
      this.snackBar.open('Message sent.', 'Close', { duration: 2500 });
    } catch (error) {
      console.error(error);
      this.snackBar.open('Failed to send message.', 'Close', { duration: 2500 });
    } finally {
      this.sending = false;
      this.cdr.detectChanges();
    }
  }
}