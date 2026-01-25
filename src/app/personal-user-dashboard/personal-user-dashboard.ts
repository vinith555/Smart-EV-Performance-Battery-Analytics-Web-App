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

  toggleNavbar() {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
}
