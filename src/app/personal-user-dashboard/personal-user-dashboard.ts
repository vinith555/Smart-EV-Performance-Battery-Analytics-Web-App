import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { LoadingService } from '../services/loading.service';

// Notification interface
interface Notification {
  notification_id: number;
  priority: string;
  message: string;
  created_at: string;
  user_id: number;
  vehicle_id: number;
}

@Component({
  selector: 'app-personal-user-dashboard',
  imports: [CommonModule, RouterOutlet, RouterLinkActive, RouterLink],
  templateUrl: './personal-user-dashboard.html',
  styleUrl: './personal-user-dashboard.css',
})
export class PersonalUserDashboard implements OnInit {
  isNavbarCollapsed = false;
  isNotificationsVisible = false;
  isProfileVisible: boolean = false;

  // User data
  userName: string = 'Loading...';
  userRole: string = 'User';
  userId: number = 0;
  notifications: Notification[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  /**
   * Load user data from backend
   */
  loadUserData() {
    this.loadingService.show('Loading user data...');
    this.apiService.getUserDetail().subscribe({
      next: (response) => {
        console.log('User data response:', response);
        console.log('User data object:', response.data);
        if (response.success && response.data) {
          this.userName = response.data.name || 'User';
          this.userRole = response.data.role || 'User';
          // Try different possible field names for user ID
          this.userId =
            response.data.id || response.data.user_id || response.data.pk;
          console.log('User ID loaded:', this.userId);
          console.log('Full user data:', response.data);
          // After getting user data, load notifications
          if (this.userId) {
            this.loadNotifications();
          } else {
            console.warn('User ID not found in response data');
            this.loadingService.hide();
          }
        }
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.userName = 'User';
        this.loadingService.hide();
      },
    });
  }

  /**
   * Load notifications from backend
   */
  loadNotifications() {
    if (!this.userId) {
      console.warn('User ID not available, skipping notifications load');
      return;
    }

    console.log('Loading notifications for user ID:', this.userId);
    this.apiService.getNotificationDetails(this.userId).subscribe({
      next: (response) => {
        console.log('Notifications response:', response);
        if (response.success && response.data && Array.isArray(response.data)) {
          // Map backend notifications with proper structure
          this.notifications = response.data.map((notif: any) => ({
            notification_id: notif.notification_id,
            priority: notif.priority || 'MEDIUM',
            message: notif.message || notif.msg || 'No message',
            created_at: notif.created_at,
            user_id: notif.user_id,
            vehicle_id: notif.vehicle_id,
          }));
          console.log('Notifications loaded:', this.notifications);
        } else {
          console.warn('Invalid notifications response format:', response);
          this.notifications = [];
        }
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.notifications = [];
        this.loadingService.hide();
      },
    });
  }

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
    this.loadingService.show('Logging out...');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.loadingService.hide();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.loadingService.hide();
        // Even if logout API fails, clear local storage and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
      },
    });
  }
}
