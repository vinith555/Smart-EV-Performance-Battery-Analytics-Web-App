import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-personal-user-dashboard',
  imports: [CommonModule,RouterOutlet,RouterLinkActive,RouterLink],
  templateUrl: './personal-user-dashboard.html',
  styleUrl: './personal-user-dashboard.css',
})
export class PersonalUserDashboard {
  isNavbarCollapsed = false;
  isNotificationsVisible = false;
  isProfileVisible:boolean = false;

  toggleNotifications() {
    this.isNotificationsVisible = !this.isNotificationsVisible;
  }

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  notifications:string[] = [
  'New Message from Admin',
  'System Maintenance Scheduled',
  'Profile Updated Successfully',
  'Password Changed',
  'New Login Detected',
  'Support Ticket Resolved'
];

}
