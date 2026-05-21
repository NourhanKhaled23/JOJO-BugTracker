import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
    return next(req);
  }

  // Only attach token to requests matching the API URL
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = sessionStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
