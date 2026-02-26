import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  credentials = {
    email: '',
    password: '',
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;
  errorMessage = '';
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
   * Handle login form submission
   */
  onLogin(form: any): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    if (form.valid) {
      this.isLoading = true;

      this.authService
        .login(this.credentials.email, this.credentials.password)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = 'Login successful! Redirecting...';

            console.log('Login successful:', response);

            // Redirect based on user role after a short delay
            setTimeout(() => {
              const currentUser = this.authService.getCurrentUser();
              if (currentUser) {
                switch (currentUser.role) {
                  case 'ADMIN':
                    this.router.navigate(['/admin-dashboard']);
                    break;
                  case 'SERVICE':
                    this.router.navigate(['/service-user-dashboard']);
                    break;
                  case 'PERSONAL':
                  default:
                    this.router.navigate(['/personal-user-dashboard']);
                    break;
                }
              } else {
                this.router.navigate(['/profile']);
              }
            }, 1000);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Login failed:', error);

            // Handle different error types
            if (error.error?.detail) {
              this.errorMessage = error.error.detail;
            } else if (error.error?.message) {
              this.errorMessage = error.error.message;
            } else if (error.status === 401) {
              this.errorMessage = 'Invalid email or password';
            } else if (error.status === 0) {
              this.errorMessage =
                'Cannot connect to server. Please check your connection.';
            } else {
              this.errorMessage = 'Login failed. Please try again.';
            }
          },
        });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly';
    }
  }

  /**
   * Navigate to register page
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
