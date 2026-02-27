import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class HttpAuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

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

    return next.handle(request);
  }
}
