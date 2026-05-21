import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Shell } from './layout/shell/shell';
import { roleGuard } from './core/auth/role.guard';
import { Role } from './core/enums/role';


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
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'projects',
        loadChildren: () => import('./features/projects/projects.routes').then(m => m.PROJECT_ROUTES)
      },
      {
        path: 'bugs',
        loadChildren: () => import('./features/bugs/bugs.routes').then(m => m.BUGS_ROUTES)
      },
      {
        path: 'settings',
        canActivate: [roleGuard([Role.Admin, Role.Owner])],
        loadComponent: () => import('./features/settings/settings').then(m => m.Settings)
      },
      {
        path: 'members',
        canActivate: [roleGuard([Role.Admin, Role.Owner])],
        loadComponent: () => import('./features/members/members').then(m => m.Members)
      },
      {
        path: 'labels',
        canActivate: [roleGuard([Role.Admin, Role.Owner, Role.Developer])],
        loadComponent: () => import('./features/labels/labels').then(m => m.Labels)
      },
      {
        path: 'admin',
        canActivate: [roleGuard([Role.Admin, Role.Owner])],
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./features/auth/unauthorized/unauthorized').then(m => m.Unauthorized)
  },
  { path: 'not-found', loadComponent: () => import('./features/auth/not-found/not-found').then(m => m.NotFound) },
  { path: '**', redirectTo: '/not-found' }
];
