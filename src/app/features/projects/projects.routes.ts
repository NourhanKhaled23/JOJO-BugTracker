import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-list/project-list').then(m => m.ProjectList)
  },
  {
    path: ':id',
    loadComponent: () => import('./project-detail/project-detail').then(m => m.ProjectDetail)
  }
];
