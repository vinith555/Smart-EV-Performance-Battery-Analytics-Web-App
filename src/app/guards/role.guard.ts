import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Role Guard - Checks if user has required role
 * Redirects to appropriate dashboard based on user's actual role
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.warn('User not authenticated');
    router.navigate(['/login']);
    return false;
  }

  // Get expected roles from route data
  const expectedRoles = route.data['roles'] as string[];
  let currentUser = authService.getCurrentUser();

  // If user data not loaded yet, load it first
  if (!currentUser || !currentUser.role) {
    console.log('User role not loaded, loading user data...');
    return authService.loadCurrentUser().pipe(
      map((response) => {
        currentUser = authService.getCurrentUser();

        if (!currentUser || !currentUser.role) {
          console.error('Failed to load user role');
          router.navigate(['/login']);
          return false;
        }

        return checkRoleAccess(currentUser.role, expectedRoles, router);
      }),
      catchError((error) => {
        console.error('Error loading user data:', error);
        router.navigate(['/login']);
        return of(false);
      }),
    );
  }

  // User data already loaded, check role immediately
  return checkRoleAccess(currentUser.role, expectedRoles, router);
};

/**
 * Helper function to check if user has required role
 */
function checkRoleAccess(
  userRole: string,
  expectedRoles: string[],
  router: Router,
): boolean {
  const normalizedUserRole = userRole.toUpperCase();
  const hasRole = expectedRoles.some(
    (role) => role.toUpperCase() === normalizedUserRole,
  );

  if (!hasRole) {
    console.warn(
      `Access denied. Required roles: ${expectedRoles}, User role: ${userRole}`,
    );

    // Redirect based on actual role
    switch (normalizedUserRole) {
      case 'ADMIN':
        router.navigate(['/']);
        break;
      case 'SERVICE':
        router.navigate(['/service-user-dashboard']);
        break;
      case 'PERSONAL':
        router.navigate(['/personal-user-dashboard']);
        break;
      default:
        console.error('Unknown role:', userRole);
        router.navigate(['/login']);
        break;
    }
    return false;
  }

  return true;
}
