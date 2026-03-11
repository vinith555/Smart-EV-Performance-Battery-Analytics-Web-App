import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    // Get access token
    const token = this.authService.getAccessToken();

    console.log('HttpInterceptor: Intercepting request to:', request.url);
    console.log('HttpInterceptor: Token exists:', !!token);

    // Clone request and add authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('HttpInterceptor: Added Authorization header');
    } else {
      console.log(
        'HttpInterceptor: No token found, proceeding without Authorization header',
      );
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('HttpInterceptor: Error caught:', error.status);

        // Handle 401 Unauthorized errors
        if (error.status === 401) {
          console.log(
            'HttpInterceptor: 401 Unauthorized - Token expired or invalid',
          );

          // Clear tokens and user data
          this.authService.logout().subscribe({
            next: () => {
              console.log(
                'HttpInterceptor: Logout successful, redirecting to login',
              );
            },
            error: (logoutError) => {
              console.log(
                'HttpInterceptor: Logout API failed, clearing local data anyway',
              );
            },
            complete: () => {
              // Always clear local storage and redirect regardless of API response
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');

              // Redirect to login page
              this.router.navigate(['/login'], {
                queryParams: { sessionExpired: 'true' },
              });
            },
          });
        }

        return throwError(() => error);
      }),
    );
  }
}
