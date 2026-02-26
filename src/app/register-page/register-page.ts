import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.css'],
})
export class RegisterPage {
  userData = {
    name: '',
    email: '',
    password: '',
    password_confirm: '',
    role: '',
    performance: 0,
  };

  showPassword = false;
  showConfirmPassword = false;
  acceptTerms = false;
  isLoading = false;
  errorMessage = '';
  errorDetails: string[] = [];
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    // Check if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profile']);
    }
  }

  /**
   * Handle register form submission
   */
  onRegister(form: any): void {
    // Clear previous messages
    this.errorMessage = '';
    this.errorDetails = [];
    this.successMessage = '';

    // Validate form
    if (!form.valid) {
      this.errorMessage = 'Please fill in all required fields correctly';
      return;
    }

    // Validate password match
    if (this.userData.password !== this.userData.password_confirm) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Validate terms acceptance
    if (!this.acceptTerms) {
      this.errorMessage = 'You must accept the terms and conditions';
      return;
    }

    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          'Account created successfully! Redirecting to login...';

        console.log('Registration successful:', response);

        // Redirect to login after a short delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration failed:', error);

        // Handle different error types
        if (error.error?.errors) {
          // Handle validation errors from backend
          this.errorMessage =
            'Registration failed. Please correct the following:';
          this.errorDetails = [];

          // Extract error messages
          Object.keys(error.error.errors).forEach((key) => {
            const errorArray = error.error.errors[key];
            if (Array.isArray(errorArray)) {
              errorArray.forEach((err) => {
                this.errorDetails.push(`${key}: ${err}`);
              });
            } else {
              this.errorDetails.push(`${key}: ${errorArray}`);
            }
          });
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.detail) {
          this.errorMessage = error.error.detail;
        } else if (error.status === 400) {
          this.errorMessage =
            'Invalid registration data. Please check your information.';
        } else if (error.status === 0) {
          this.errorMessage =
            'Cannot connect to server. Please check your connection.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
    });
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
