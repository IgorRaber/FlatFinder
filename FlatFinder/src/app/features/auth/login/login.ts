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
      } else if (error?.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      }

      this.snackBar.open(message, 'Close', {
        duration: 4000
      });
    } finally {
      this.isLoading = false;
    }
  }
}