import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function isTokenExpired(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) { return false; }
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return false;
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return false;
  }

  try {
    const token = sessionStorage.getItem('token');

    if (token && !isTokenExpired(token)) {
      return true;
    }

    if (token && isTokenExpired(token)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('bugtrackr_user');
    }
  } catch {
    // Storage unavailable
  }

  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
