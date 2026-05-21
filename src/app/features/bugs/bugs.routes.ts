import { Routes } from '@angular/router';

export const BUGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./bug-list/bug-list').then(m => m.BugList)
  },
  {
    path: 'kanban',
    loadComponent: () => import('./bug-kanban/bug-kanban').then(m => m.BugKanban)
  },
  {
    path: ':id',
    loadComponent: () => import('./bug-detail/bug-detail').then(m => m.BugDetail)
  }
];
