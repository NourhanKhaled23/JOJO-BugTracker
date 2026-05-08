import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    retry({ count: 2, delay: 1000, resetOnSuccess: true }),
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          console.error('No internet connection');
          break;
        case 401:
          router.navigate(['/auth/login']);
          break;
        case 403:
          console.error('You do not have permission');
          break;
        case 404:
          router.navigate(['/404']);
          break;
        case 422:
          return throwError(() => error);
        case 429:
          console.error('Too many requests. Please wait.');
          break;
        default:
          console.error('Something went wrong. Please try again.');
      }
      return throwError(() => error);
    })
  );
};
