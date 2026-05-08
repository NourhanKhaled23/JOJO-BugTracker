import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      // Placeholder for dashboard
      { 
        path: 'dashboard', 
        loadComponent: () => import('./shared/components/badge/badge').then(m => m.Badge) // Just a placeholder to prevent error
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/auth/login' }
];
