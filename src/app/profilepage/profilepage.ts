import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-profilepage',
  imports: [CommonModule, FormsModule],
  templateUrl: './profilepage.html',
  styleUrl: './profilepage.css',
})
export class Profilepage implements OnInit {
  editProfileForm = false;
  private hasLoadedProfile = false;

  constructor(
    private route: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) {}

  user = {
    userId: 0,
    name: '',
    role: '',
    email: '',
    phone: '',
    username: '',
    created: '',
    lastLogin: '',
    status: 'Active',
    bio: '',
    performance: 0,
    linkedin: '',
    twitter: '',
    facebook: '',
  };

  notifications: { message: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; created_at: string }[] = [];
  notificationsLoading = true;
  vehicleDetails: { vehicle_model: string; vehicle_colour: string; registration_number: string }[] = [];
  vehiclesLoading = true;

  get initials(): string {
    if (!this.user.name) return '?';
    return this.user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  get avatarGradient(): string {
    const role = this.user.role?.toUpperCase();
    if (role === 'SERVICE') return 'from-blue-500 to-blue-700';
    if (role === 'ADMIN') return 'from-purple-500 to-purple-700';
    return 'from-[#00712D] to-green-700';
  }

  get performanceStars(): number[] {
    return Array.from({ length: 10 }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.route.navigate(['/login']);
      return;
    }
    if (!this.hasLoadedProfile) {
      this.hasLoadedProfile = true;
      this.loadUserProfile();
    }
  }

  loadUserProfile(): void {
    this.loadingService.show('Loading profile...');
    this.apiService.getUserDetail().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const d = response.data;
          this.user = {
            userId: d.user_id || 0,
            name: d.name || 'Unknown User',
            role: d.role || 'N/A',
            email: d.email || 'N/A',
            phone: d.phone || '',
            username: d.email?.split('@')[0] || 'N/A',
            created: this.user.created || '',
            lastLogin: this.user.lastLogin || '',
            status: d.is_active ? 'Active' : 'Inactive',
            bio: d.bio || '',
            performance: d.performance || 0,
            linkedin: d.linkedin || '',
            twitter: d.twitter || '',
            facebook: d.facebook || '',
          };
          this.loadingService.hide();
          this.loadVehicleDetails();
          if (this.user.userId) {
            this.loadNotifications();
          } else {
            this.notificationsLoading = false;
          }
        } else {
          this.handleProfileLoadError('Invalid response from server');
        }
      },
      error: (error) => this.handleProfileLoadError(error),
    });
  }

  loadNotifications(): void {
    this.notificationsLoading = true;
    this.apiService.getNotificationDetails(this.user.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notifications = response.data;
        }
        this.notificationsLoading = false;
      },
      error: () => {
        this.notificationsLoading = false;
      },
    });
  }

  loadVehicleDetails(): void {
    this.vehiclesLoading = true;
    this.apiService.getVehicleDetails().subscribe({
      next: (response) => {
        if (response.success && response.data?.vehicle) {
          this.vehicleDetails = response.data.vehicle;
        }
        this.vehiclesLoading = false;
      },
      error: () => {
        this.vehiclesLoading = false;
      },
    });
  }

  private handleProfileLoadError(error: any): void {
    this.loadingService.hide();
    this.notificationsLoading = false;
    this.vehiclesLoading = false;
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setTimeout(() => this.route.navigate(['/login']), 1000);
    }
  }

  navigateToDashboard(): void {
    const role = this.user.role?.toUpperCase();
    if (role === 'SERVICE') {
      this.route.navigate(['/service-user-dashboard']);
    } else if (role === 'PERSONAL') {
      this.route.navigate(['/personal-user-dashboard']);
    } else {
      this.route.navigate(['/']);
    }
  }

  changePassword() {
    this.route.navigate(['login']);
  }

  logOut() {
    this.loadingService.show('Logging out...');
    this.authService.logout().subscribe({
      next: () => {
        this.loadingService.hide();
        this.route.navigate(['/login']);
      },
      error: () => {
        this.loadingService.hide();
        this.route.navigate(['/login']);
      },
    });
  }

  updateProfile(form: any) {
    if (form.valid) {
      this.loadingService.show('Updating profile...');
      this.apiService.updateUserProfile({
        name: this.user.name,
        email: this.user.email,
        phone: this.user.phone,
        linkedin: this.user.linkedin,
        twitter: this.user.twitter,
        facebook: this.user.facebook,
        bio: this.user.bio,
      }).subscribe({
        next: (response) => {
          this.loadingService.hide();
          if (response.success && response.data) {
            const d = response.data;
            this.user.name = d.name || this.user.name;
            this.user.email = d.email || this.user.email;
            this.user.username = d.email?.split('@')[0] || this.user.username;
            this.user.phone = d.phone ?? this.user.phone;
            this.user.linkedin = d.linkedin ?? this.user.linkedin;
            this.user.twitter = d.twitter ?? this.user.twitter;
            this.user.facebook = d.facebook ?? this.user.facebook;
            this.user.bio = d.bio ?? this.user.bio;
          }
          this.editProfileForm = false;
        },
        error: () => {
          this.loadingService.hide();
          this.editProfileForm = false;
        },
      });
    }
  }
}
