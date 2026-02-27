import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // ============ Authentication Endpoints ============

  /**
   * Login user with email and password
   * @param email User email
   * @param password User password
   * @returns Observable with access and refresh tokens
   */
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login/`, { email, password });
  }

  /**
   * Register a new user
   * @param data Registration data (email, name, password, role, performance)
   * @returns Observable with user details
   */
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, data);
  }

  /**
   * Logout user and blacklist token
   * @param refreshToken Refresh token to blacklist
   * @returns Observable
   */
  logout(refreshToken: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout/`,
      {
        refresh: refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    );
  }

  /**
   * Get current user details
   * @returns Observable with user information
   */
  getUserDetail(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/me/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Change password
   * @param data Old and new password data
   * @returns Observable
   */
  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password/`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Deactivate or reactivate account
   * @param action 'deactivate' or 'reactivate'
   * @returns Observable
   */
  deactivateAccount(action: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/deactivate-account/`,
      {
        action,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    );
  }

  /**
   * Reset user password (admin only)
   * @param email User email
   * @param newPassword New password
   * @returns Observable
   */
  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/reset-password/`,
      {
        email,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      },
    );
  }

  // ============ Data Endpoints ============

  /**
   * Get vehicle details for current user
   * @returns Observable with vehicle data
   */
  getVehicleDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-vehicle-details/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Get charging details for user's vehicles
   * @returns Observable with charging data
   */
  getChargingDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-charging-details/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Get trip details for user's vehicles
   * @returns Observable with trip data
   */
  getTripDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-trip-details/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Get service details
   * @returns Observable with service data
   */
  getServiceDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-service-details/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Get issue details for user's vehicles
   * @returns Observable with issue data
   */
  getIssueDetails(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-issue-details/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Get user details by vehicle
   * @returns Observable with user and vehicle details
   */
  getUserDetailsByVehicle(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get-user-details-by-vehicle/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  }

  /**
   * Refresh access token
   * @param refreshToken Refresh token
   * @returns Observable with new access token
   */
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refresh/`, {
      refresh: refreshToken,
    });
  }
}
