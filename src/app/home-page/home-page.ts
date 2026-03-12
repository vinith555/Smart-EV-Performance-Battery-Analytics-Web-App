import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  isMenuOpen = false;
  isUserDropdownOpen = false;
  isLoggedIn = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  private isTokenValid(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return false;

      const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(
        normalized.length + ((4 - (normalized.length % 4)) % 4),
        '=',
      );

      const payload = JSON.parse(atob(padded));
      if (!payload?.exp) return true;

      const nowInSeconds = Math.floor(Date.now() / 1000);
      return Number(payload.exp) > nowInSeconds;
    } catch {
      return false;
    }
  }

  checkLoginStatus() {
    // Check if user token exists in localStorage
    const token = localStorage.getItem('accessToken')?.trim() ?? '';
    const isValid = token ? this.isTokenValid(token) : false;

    if (!isValid) {
      localStorage.removeItem('accessToken');
    }

    this.isLoggedIn = isValid;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeUserDropdown() {
    this.isUserDropdownOpen = false;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.closeUserDropdown();
  }
}
