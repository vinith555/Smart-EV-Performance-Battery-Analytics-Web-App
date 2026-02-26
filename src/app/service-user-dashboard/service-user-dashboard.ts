import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-service-user-dashboard',
  imports: [RouterLink,RouterLinkActive,CommonModule,RouterOutlet],
  templateUrl: './service-user-dashboard.html',
  styleUrl: './service-user-dashboard.css',
})
export class ServiceUserDashboard {
  isNavbarCollapsed = false;
  isNotificationsVisible = false;
  isProfileVisible = false;

  toggleNotifications() {
    this.isNotificationsVisible = !this.isNotificationsVisible;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
}
