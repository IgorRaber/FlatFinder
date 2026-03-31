import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  isLoading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const { email, password } = this.form.getRawValue();

      await this.authService.login(email, password);

      this.snackBar.open('Login successful', 'Close', {
        duration: 3000
      });

      await this.router.navigate(['/home']);
    } catch (error: any) {
      let message = 'Login failed';

      if (error?.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error?.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      }

      this.snackBar.open(message, 'Close', { duration: 4000 });
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;

    try {
      await this.authService.loginWithGoogle();
      this.snackBar.open('Google login successful', 'Close', { duration: 3000 });
      await this.router.navigate(['/home']);
    } catch (error: any) {
      let message = 'Google login failed';

      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by the browser';
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = 'Another sign-in popup is already open';
      }

      this.snackBar.open(message, 'Close', { duration: 4000 });
    } finally {
      this.isLoading = false;
    }
  }

  async onForgotPassword(): Promise<void> {
    const email = this.form.controls.email.value?.trim();

    if (!email) {
      this.form.controls.email.markAsTouched();
      this.snackBar.open('Enter your email first', 'Close', { duration: 3000 });
      return;
    }

    if (this.form.controls.email.invalid) {
      this.snackBar.open('Enter a valid email address', 'Close', { duration: 3000 });
      return;
    }

    try {
      await this.authService.sendResetPasswordEmail(email);
      this.snackBar.open(
        'If this email is registered, a reset link has been sent',
        'Close',
        { duration: 5000 }
      );
    } catch (error: any) {
      let message = 'Could not send reset email';

      if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later';
      }

      this.snackBar.open(message, 'Close', { duration: 4000 });
    }
  }
}