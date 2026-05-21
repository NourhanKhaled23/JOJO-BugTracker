import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../../core/models/user.model';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, router = inject(Router)) => ({
    initialize(): void {
      const token = sessionStorage.getItem('token');
      const userRaw = sessionStorage.getItem('bugtrackr_user');
      if (token) {
        let user: User | null;
        try {
          user = userRaw ? JSON.parse(userRaw) : null;
        } catch {
          user = null;
        }
        patchState(store, { token, isAuthenticated: true, user });
      }
    },
    login(token: string, user: User): void {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('bugtrackr_user', JSON.stringify(user));
      patchState(store, { 
        token, 
        user, 
        isAuthenticated: true, 
        error: null,
        isLoading: false
      });
      router.navigate(['/dashboard']);
    },
    logout(): void {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('bugtrackr_user');
      patchState(store, { 
        token: null, 
        user: null, 
        isAuthenticated: false 
      });
      router.navigate(['/auth/login']);
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },
    setError(error: string): void {
      patchState(store, { error, isLoading: false });
    }
  })),
  withHooks({
    onInit(store) {
      store.initialize();
    }
  })
);
