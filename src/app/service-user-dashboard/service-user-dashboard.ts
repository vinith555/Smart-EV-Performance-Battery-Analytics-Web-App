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
  selector: 'app-service-user-dashboard',
  imports: [RouterLink, RouterLinkActive, CommonModule, RouterOutlet],
  templateUrl: './service-user-dashboard.html',
  styleUrl: './service-user-dashboard.css',
})
export class ServiceUserDashboard implements OnInit {
  isNavbarCollapsed = false;
  isNotificationsVisible = false;
  isProfileVisible = false;

  // User data
  userName: string = 'Loading...';
  userRole: string = 'Service User';
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
        if (response.success && response.data) {
          this.userName = response.data.name || 'Service User';
          this.userRole = response.data.role || 'Service User';
          // Try different possible field names for user ID
          this.userId =
            response.data.id || response.data.user_id || response.data.pk;
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
        this.userName = 'Service User';
        this.loadingService.hide();
      },
    });
  }

  /**
   * Load notifications from backend
   */
  loadNotifications() {
    if (!this.userId) {
      return;
    }

    this.apiService.getNotificationDetails(this.userId).subscribe({
      next: (response) => {
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
        } else {
          this.notifications = [];
        }
        this.loadingService.hide();
      },
      error: (error) => {
        this.notifications = [];
        this.loadingService.hide();
      },
    });
  }

  toggleNotifications() {
    this.isNotificationsVisible = !this.isNotificationsVisible;
  }

  deleteNotification(notificationId: number, event?: Event) {
    event?.stopPropagation();
    this.apiService.deleteNotification(notificationId).subscribe({
      next: (response) => {
        if (response?.success) {
          this.notifications = this.notifications.filter(
            (notification) => notification.notification_id !== notificationId,
          );
        }
      },
      error: (error) => {
        console.error('Error deleting notification:', error);
      },
    });
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  /**
   * Logout user and redirect to login page
   */
  logout() {
    this.loadingService.show('Logging out...');
    this.authService.logout().subscribe({
      next: () => {
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
