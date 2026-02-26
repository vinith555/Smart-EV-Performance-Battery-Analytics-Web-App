import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-service-user-dashboard',
  imports: [RouterLink, RouterLinkActive, CommonModule, RouterOutlet],
  templateUrl: './service-user-dashboard.html',
  styleUrl: './service-user-dashboard.css',
})
export class ServiceUserDashboard {
  isNavbarCollapsed = false;
  isNotificationsVisible = false;
  isProfileVisible = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  toggleNotifications() {
    this.isNotificationsVisible = !this.isNotificationsVisible;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  /**
   * Logout user and redirect to login page
   */
  logout() {
    console.log('Logging out...');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout API fails, clear local storage and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
      },
    });
  }
}
