import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiOptions {
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  headers?: HttpHeaders | Record<string, string | string[]>;
  skipCache?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  get<T>(path: string, options?: ApiOptions): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${path}`, {
      params: options?.params,
      headers: options?.headers
    });
  }

  post<T>(path: string, body: unknown, options?: ApiOptions): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${path}`, body, {
      params: options?.params,
      headers: options?.headers
    });
  }

  put<T>(path: string, body: unknown, options?: ApiOptions): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${path}`, body, {
      params: options?.params,
      headers: options?.headers
    });
  }

  patch<T>(path: string, body: unknown, options?: ApiOptions): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${path}`, body, {
      params: options?.params,
      headers: options?.headers
    });
  }

  delete<T>(path: string, options?: ApiOptions): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${path}`, {
      params: options?.params,
      headers: options?.headers
    });
  }
}
