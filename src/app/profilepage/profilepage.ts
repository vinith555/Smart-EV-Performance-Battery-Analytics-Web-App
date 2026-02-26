import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-profilepage',
  imports: [CommonModule, FormsModule],
  templateUrl: './profilepage.html',
  styleUrl: './profilepage.css',
})
export class Profilepage implements OnInit {
  editProfileForm = false;
  isLoading = true;
  private hasLoadedProfile = false; // Prevent multiple loads

  constructor(
    private route: Router,
    private authService: AuthService,
    private apiService: ApiService,
  ) {
    // Don't check authentication in constructor - let ngOnInit handle it
    // This prevents issues with timing when tokens are being set
  }

  user = {
    name: '',
    role: '',
    email: '',
    phone: '+91 9876543210',
    username: '',
    created: '01 Oct, 2023',
    lastLogin: '24 Apr, 2024',
    status: 'Active',
    bio: `Loading user information...`,
    linkedin: '',
    twitter: '',
    facebook: '',
  };

  notification: { msg: string; severity: 'High' | 'Medium' | 'Low' }[] = [
    {
      msg: 'Battery temperature exceeded safe limit at Station 3',
      severity: 'High',
    },
    {
      msg: 'Charging session interrupted due to voltage fluctuation',
      severity: 'High',
    },
    {
      msg: 'New firmware update available for Battery Pack A12',
      severity: 'Medium',
    },
    { msg: 'Charging station 5 is under maintenance', severity: 'Medium' },
    { msg: 'Vehicle BMS communication delay detected', severity: 'Medium' },
    {
      msg: 'Low battery health detected in Vehicle TN-09-EV-4582',
      severity: 'High',
    },
    {
      msg: 'Scheduled system diagnostic completed successfully',
      severity: 'Low',
    },
    { msg: 'New user registered in the EV monitoring system', severity: 'Low' },
    {
      msg: 'Charging efficiency dropped below 85% at Station 2',
      severity: 'Medium',
    },
    {
      msg: 'Backup power supply activated during grid outage',
      severity: 'High',
    },
  ];

  ngOnInit(): void {
    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      this.route.navigate(['/login']);
      return;
    }

    // Only load if hasn't been loaded yet
    if (!this.hasLoadedProfile) {
      this.hasLoadedProfile = true;
      this.loadUserProfile();
    }
  }

  /**
   * Load user profile from backend API
   */
  loadUserProfile(): void {
    console.log('Loading user profile...');

    this.apiService.getUserDetail().subscribe({
      next: (response) => {
        console.log('Profile API response:', response);

        if (response.success && response.data) {
          // Map backend response to user object
          this.user = {
            name: response.data.name || 'N/A',
            role: response.data.role || 'N/A',
            email: response.data.email || 'N/A',
            phone: this.user.phone, // Keep existing phone (not in backend)
            username: response.data.email?.split('@')[0] || 'N/A',
            created: this.user.created, // Keep existing created date
            lastLogin: this.user.lastLogin, // Keep existing last login
            status: response.data.is_active ? 'Active' : 'Inactive',
            bio: `I'm a ${response.data.role} user with performance rating ${response.data.performance}/10`,
            linkedin: this.user.linkedin,
            twitter: this.user.twitter,
            facebook: this.user.facebook,
          };
          this.isLoading = false;
          console.log('User profile loaded successfully:', this.user);
        } else {
          console.error('Invalid response structure:', response);
          this.handleProfileLoadError('Invalid response from server');
        }
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
        this.handleProfileLoadError(error);
      },
    });
  }

  /**
   * Handle profile load errors
   */
  private handleProfileLoadError(error: any): void {
    this.isLoading = false;
    this.user.bio =
      'Failed to load user information. Please try logging in again.';

    // Only clear storage and redirect if it's an authentication error
    // Don't clear storage for other types of errors
    if (error.status === 401 || error.status === 403) {
      console.log(
        'Authentication error (401/403), clearing tokens and redirecting to login',
      );
      // Clear tokens and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setTimeout(() => {
        this.route.navigate(['/login']);
      }, 1000);
    } else {
      // For other errors, just log them - don't clear storage
      console.error('Non-authentication error occurred:', error);
      this.user.bio = 'Error loading profile. Your session is still active.';
    }
  }

  changePassword() {
    this.route.navigate(['login']);
  }

  logOut() {
    // Call logout API before navigating
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logged out successfully');
        this.route.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails, clear local storage and navigate
        this.route.navigate(['/login']);
      },
    });
  }

  updateProfile(form: any) {
    if (form.valid) {
      console.log('Updated User:', this.user);
      // TODO: Add API call to update user profile
      // this.apiService.updateUserProfile(this.user).subscribe(...)
      this.editProfileForm = false;
    }
  }
}
