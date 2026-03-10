import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFoundPage {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  goBack(): void {
    const currentUser = this.authService.getCurrentUser();

    // If user session exists, send them to a safe page based on role
    if (currentUser?.role) {
      switch (currentUser.role.toUpperCase()) {
        case 'PERSONAL':
          this.router.navigate(['/personal-user-dashboard']);
          return;
        case 'SERVICE':
          this.router.navigate(['/service-user-dashboard']);
          return;
        case 'ADMIN':
          this.router.navigate(['/profile']);
          return;
      }
    }

    // If role isn't loaded yet but token exists, load profile then route safely
    if (this.authService.isAuthenticated()) {
      this.authService.loadCurrentUser().subscribe({
        next: () => {
          const user = this.authService.getCurrentUser();
          if (user?.role?.toUpperCase() === 'PERSONAL') {
            this.router.navigate(['/personal-user-dashboard']);
          } else if (user?.role?.toUpperCase() === 'SERVICE') {
            this.router.navigate(['/service-user-dashboard']);
          } else {
            this.router.navigate(['/profile']);
          }
        },
        error: () => {
          this.router.navigate(['/']);
        },
      });
      return;
    }

    // Guest fallback
    this.router.navigate(['/']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
