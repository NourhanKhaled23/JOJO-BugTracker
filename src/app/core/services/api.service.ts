import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiOptions {
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  headers?: HttpHeaders | { [header: string]: string | string[] };
  skipCache?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(path: string, options?: ApiOptions): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${path}`, {
      params: options?.params,
      headers: options?.headers
    });
  }

  post<T>(path: string, body: any, options?: ApiOptions): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${path}`, body, {
      params: options?.params,
      headers: options?.headers
    });
  }

  put<T>(path: string, body: any, options?: ApiOptions): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${path}`, body, {
      params: options?.params,
      headers: options?.headers
    });
  }

  patch<T>(path: string, body: any, options?: ApiOptions): Observable<T> {
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
