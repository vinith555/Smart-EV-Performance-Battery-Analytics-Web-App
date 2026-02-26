import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';

interface User {
  user_id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  private isAuthenticatedSubject: BehaviorSubject<boolean>;

  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  constructor(private apiService: ApiService) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    // Don't automatically load user here - let components do it explicitly
    // This prevents unnecessary API calls and infinite loops
  }

  /**
   * Login user
   * @param email User email
   * @param password User password
   * @returns Observable
   */
  login(email: string, password: string): Observable<any> {
    return this.apiService.login(email, password).pipe(
      tap((response) => {
        console.log('Login response:', response);
        if (response.access && response.refresh) {
          localStorage.setItem('accessToken', response.access);
          localStorage.setItem('refreshToken', response.refresh);

          // Set current user
          const user: User = {
            user_id: response.user_id,
            email: response.email,
            name: response.name,
            role: response.role,
          };
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        }
      }),
    );
  }

  /**
   * Register new user
   * @param data Registration data
   * @returns Observable
   */
  register(data: any): Observable<any> {
    return this.apiService.register(data);
  }

  /**
   * Logout user
   * @returns Observable
   */
  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.apiService.logout(refreshToken || '').pipe(
      tap(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }),
    );
  }

  /**
   * Get current user from localStorage
   * @returns Current user or null
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get access token from localStorage
   * @returns Access token or null
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token from localStorage
   * @returns Refresh token or null
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Check if user is authenticated
   * @returns True if token exists
   */
  isAuthenticated(): boolean {
    const hasToken = this.hasToken();
    console.log('AuthService.isAuthenticated():', hasToken);
    console.log(
      'Access token:',
      this.getAccessToken()?.substring(0, 20) + '...',
    );
    return hasToken;
  }

  /**
   * Load current user details
   * @returns Observable
   */
  loadCurrentUser(): Observable<any> {
    console.log('AuthService: Loading current user details...');
    return this.apiService.getUserDetail().pipe(
      tap((response) => {
        console.log('AuthService: User details loaded:', response);
        if (response.success && response.data) {
          const user: User = {
            user_id: response.data.user_id,
            email: response.data.email,
            name: response.data.name,
            role: response.data.role,
          };
          this.currentUserSubject.next(user);
        }
      }),
    );
  }

  /**
   * Change user password
   * @param oldPassword Old password
   * @param newPassword New password
   * @returns Observable
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.apiService.changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPassword,
    });
  }

  /**
   * Deactivate account
   * @returns Observable
   */
  deactivateAccount(): Observable<any> {
    return this.apiService.deactivateAccount('deactivate').pipe(
      tap(() => {
        this.logout();
      }),
    );
  }

  /**
   * Reactivate account
   * @returns Observable
   */
  reactivateAccount(): Observable<any> {
    return this.apiService.deactivateAccount('reactivate');
  }

  /**
   * Reset user password (admin only)
   * @param email User email
   * @param newPassword New password
   * @returns Observable
   */
  resetUserPassword(email: string, newPassword: string): Observable<any> {
    return this.apiService.resetPassword(email, newPassword);
  }

  /**
   * Refresh access token
   * @returns Observable
   */
  refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.apiService.refreshToken(refreshToken || '').pipe(
      tap((response) => {
        if (response.access) {
          localStorage.setItem('accessToken', response.access);
        }
      }),
    );
  }

  /**
   * Check if token exists in localStorage
   * @returns True if token exists
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}
