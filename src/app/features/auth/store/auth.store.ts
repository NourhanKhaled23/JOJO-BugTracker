import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
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
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, router = inject(Router)) => ({
    login(token: string, user: User) {
      localStorage.setItem('token', token);
      patchState(store, { 
        token, 
        user, 
        isAuthenticated: true, 
        error: null 
      });
      router.navigate(['/dashboard']);
    },
    logout() {
      localStorage.removeItem('token');
      patchState(store, { 
        token: null, 
        user: null, 
        isAuthenticated: false 
      });
      router.navigate(['/auth/login']);
    },
    setLoading(isLoading: boolean) {
      patchState(store, { isLoading });
    },
    setError(error: string) {
      patchState(store, { error, isLoading: false });
    }
  }))
);
