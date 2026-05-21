import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    retry({
      count: req.method === 'GET' ? 2 : 0,
      delay: (error, retryCount) => {
        return timer(Math.pow(2, retryCount) * 1000);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      switch (error.status) {
        case 0:
          message = 'No internet connection available';
          break;
        case 401:
          message = 'Session expired. Please login again.';
          try {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('bugtrackr_user');
          } catch {
            // Storage unavailable
          }
          router.navigate(['/auth/login']);
          break;
        case 403:
          message = 'You do not have permission to perform this action';
          break;
        case 404:
          message = 'Requested resource not found';
          break;
        case 422:
          return throwError(() => error);
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Internal server error. Our team has been notified.';
          break;
      }

      console.error(`[HTTP Error ${error.status}]`, message, error);
      toast.show(message, 'error');
      return throwError(() => error);
    })
  );
};
