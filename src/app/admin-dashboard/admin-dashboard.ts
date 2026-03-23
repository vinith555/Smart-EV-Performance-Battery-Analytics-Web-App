import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';

interface Notification {
  notification_id: number;
  priority: string;
  message: string;
  created_at: string;
  user_id: number;
  vehicle_id: number;
}

interface ScopeUserOption {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

interface ScopeVehicleOption {
  vehicle_id: number;
  registration_number: string;
  vehicle_model: string;
  owner__name?: string;
}

type DatasetKey =
  | 'companies'
  | 'users'
  | 'vehicles'
  | 'vehicle_stats'
  | 'trips'
  | 'charge_history'
  | 'tasks'
  | 'service_tasks'
  | 'services'
  | 'issues'
  | 'notifications'
  | 'bills';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  isNavbarCollapsed = false;
  isNotificationsVisible = false;
  isProfileVisible = false;

  userName: string = 'Loading...';
  userRole: string = 'ADMIN';
  userId: number = 0;
  notifications: Notification[] = [];

  isLoadingData = true;
  isLoadingScopedData = false;
  dataError = '';
  scopedDataError = '';

  counts: Record<string, number> = {};
  scopedCounts: Record<string, number> = {};
  data: Record<DatasetKey, any[]> = {
    companies: [],
    users: [],
    vehicles: [],
    vehicle_stats: [],
    trips: [],
    charge_history: [],
    tasks: [],
    service_tasks: [],
    services: [],
    issues: [],
    notifications: [],
    bills: [],
  };

  selectedScopeType: '' | 'user' | 'vehicle' = '';
  selectedScopeId: number | null = null;
  activeScopeLabel = '';
  isScopedDataLoaded = false;

  scopeOptions = {
    users: [] as ScopeUserOption[],
    vehicles: [] as ScopeVehicleOption[],
  };

  readonly datasetConfig: { key: DatasetKey; title: string; icon: string }[] = [
    { key: 'companies', title: 'Companies', icon: 'fa-building' },
    { key: 'users', title: 'Users', icon: 'fa-users' },
    { key: 'vehicles', title: 'Vehicles', icon: 'fa-car' },
    { key: 'vehicle_stats', title: 'Vehicle Stats', icon: 'fa-chart-column' },
    { key: 'trips', title: 'Trips', icon: 'fa-route' },
    {
      key: 'charge_history',
      title: 'Charge History',
      icon: 'fa-bolt-lightning',
    },
    { key: 'tasks', title: 'Tasks', icon: 'fa-list-check' },
    { key: 'service_tasks', title: 'Service Tasks', icon: 'fa-screwdriver-wrench' },
    { key: 'services', title: 'Services', icon: 'fa-gears' },
    { key: 'issues', title: 'Issues', icon: 'fa-triangle-exclamation' },
    {
      key: 'notifications',
      title: 'Notifications',
      icon: 'fa-bell',
    },
    { key: 'bills', title: 'Bills', icon: 'fa-file-invoice-dollar' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadSummaryData();
  }

  loadUserData() {
    this.apiService.getUserDetail().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userName = response.data.name || 'Admin';
          this.userRole = response.data.role || 'ADMIN';
          this.userId =
            response.data.id || response.data.user_id || response.data.pk;

          if (this.userId) {
            this.loadNotifications();
          }
        }
      },
      error: () => {
        this.userName = 'Admin';
      },
    });
  }

  loadSummaryData() {
    this.isLoadingData = true;
    this.dataError = '';
    this.loadingService.show('Loading admin summary...');

    this.apiService.getAdminDashboardData(false).subscribe({
      next: (response) => {
        if (response?.success) {
          this.counts = response.counts || {};
          this.scopeOptions = response.scope_options || this.scopeOptions;
        } else {
          this.dataError = 'Invalid admin summary response from server.';
        }

        this.isLoadingData = false;
        this.loadingService.hide();
      },
      error: (error) => {
        this.dataError =
          error?.error?.message ||
          'Failed to load admin summary. Please try again.';
        this.isLoadingData = false;
        this.loadingService.hide();
      },
    });
  }

  onScopeTypeChange() {
    this.selectedScopeId = null;
    this.clearScopedData();
  }

  loadScopedData() {
    this.scopedDataError = '';

    if (!this.selectedScopeType || this.selectedScopeId === null) {
      this.scopedDataError = 'Please select a scope type and a specific record.';
      return;
    }

    this.isLoadingScopedData = true;
    this.loadingService.show('Loading scoped details...');

    this.apiService
      .getAdminDashboardData(
        true,
        this.selectedScopeType,
        Number(this.selectedScopeId),
      )
      .subscribe({
        next: (response) => {
          if (response?.success && response?.data) {
            this.data = {
              ...this.data,
              ...response.data,
            };
            this.scopedCounts = response.scoped_counts || {};
            this.isScopedDataLoaded = true;
            this.activeScopeLabel = this.getActiveScopeLabel();
          } else {
            this.scopedDataError = 'Invalid scoped details response from server.';
          }

          this.isLoadingScopedData = false;
          this.loadingService.hide();
        },
        error: (error) => {
          this.scopedDataError =
            error?.error?.message ||
            'Failed to load scoped details. Please try again.';
          this.isLoadingScopedData = false;
          this.loadingService.hide();
        },
      });
  }

  clearScopedData() {
    this.data = {
      companies: [],
      users: [],
      vehicles: [],
      vehicle_stats: [],
      trips: [],
      charge_history: [],
      tasks: [],
      service_tasks: [],
      services: [],
      issues: [],
      notifications: [],
      bills: [],
    };
    this.scopedCounts = {};
    this.activeScopeLabel = '';
    this.isScopedDataLoaded = false;
  }

  getScopeList(): Array<ScopeUserOption | ScopeVehicleOption> {
    if (this.selectedScopeType === 'user') {
      return this.scopeOptions.users;
    }

    if (this.selectedScopeType === 'vehicle') {
      return this.scopeOptions.vehicles;
    }

    return [];
  }

  getScopeOptionValue(option: ScopeUserOption | ScopeVehicleOption): number {
    if ('user_id' in option) {
      return option.user_id;
    }

    return option.vehicle_id;
  }

  getScopeOptionLabel(option: ScopeUserOption | ScopeVehicleOption): string {
    if ('user_id' in option) {
      return `${option.name} (${option.email}) [${option.role}]`;
    }

    return `${option.registration_number} - ${option.vehicle_model} (${option.owner__name || 'No Owner'})`;
  }

  getActiveScopeLabel(): string {
    const options = this.getScopeList();
    const target = options.find(
      (item) => this.getScopeOptionValue(item) === this.selectedScopeId,
    );

    if (!target) {
      return '';
    }

    return this.getScopeOptionLabel(target);
  }

  hasScopedRows(): boolean {
    return this.datasetConfig.some((dataset) => this.getRows(dataset.key).length > 0);
  }

  loadNotifications() {
    this.apiService.getNotificationDetails(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data && Array.isArray(response.data)) {
          this.notifications = response.data.map((notif: any) => ({
            notification_id: notif.notification_id,
            priority: notif.priority || 'MEDIUM',
            message: notif.message || notif.msg || 'No message',
            created_at: notif.created_at,
            user_id: notif.user_id,
            vehicle_id: notif.vehicle_id,
          }));
        }
      },
      error: () => {
        this.notifications = [];
      },
    });
  }

  getRows(dataset: DatasetKey): any[] {
    return this.data[dataset] || [];
  }

  getColumns(dataset: DatasetKey): string[] {
    const rows = this.getRows(dataset);
    if (!rows.length) {
      return [];
    }

    return Object.keys(rows[0]);
  }

  getDatasetCount(dataset: DatasetKey): number {
    return this.counts[dataset] ?? this.getRows(dataset).length;
  }

  getScopedDatasetCount(dataset: DatasetKey): number {
    return this.scopedCounts[dataset] ?? this.getRows(dataset).length;
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value);
  }

  toHeading(column: string): string {
    return column
      .replace(/__/g, ' -> ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  scrollToSection(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.isNavbarCollapsed = false;
    }
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
      error: () => {
        // no-op, retain local state when delete fails
      },
    });
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  logout() {
    this.loadingService.show('Logging out...');
    this.authService.logout().subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loadingService.hide();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
      },
    });
  }
}
