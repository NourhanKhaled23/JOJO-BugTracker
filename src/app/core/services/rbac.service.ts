import { Injectable, inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';

export type Permission =
  | 'bug:create' | 'bug:edit' | 'bug:delete' | 'bug:view'
  | 'project:create' | 'project:edit' | 'project:delete' | 'project:view' | 'project:archive'
  | 'member:invite' | 'member:remove' | 'member:edit-role'
  | 'comment:create' | 'comment:edit-own' | 'comment:delete-own' | 'comment:delete-any'
  | 'label:manage' | 'settings:edit' | 'data:export' | 'data:import';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    'bug:create', 'bug:edit', 'bug:delete', 'bug:view',
    'project:create', 'project:edit', 'project:delete', 'project:view', 'project:archive',
    'member:invite', 'member:remove', 'member:edit-role',
    'comment:create', 'comment:edit-own', 'comment:delete-own', 'comment:delete-any',
    'label:manage', 'settings:edit', 'data:export', 'data:import'
  ],
  admin: [
    'bug:create', 'bug:edit', 'bug:delete', 'bug:view',
    'project:create', 'project:edit', 'project:delete', 'project:view', 'project:archive',
    'member:invite', 'member:remove', 'member:edit-role',
    'comment:create', 'comment:edit-own', 'comment:delete-own', 'comment:delete-any',
    'label:manage', 'settings:edit', 'data:export', 'data:import'
  ],
  developer: [
    'bug:create', 'bug:edit', 'bug:view',
    'project:view',
    'comment:create', 'comment:edit-own', 'comment:delete-own',
    'data:export'
  ],
  viewer: [
    'bug:view', 'project:view'
  ]
};

@Injectable({ providedIn: 'root' })
export class RbacService {
  private readonly authStore = inject(AuthStore);

  can(permission: Permission): boolean {
    const user = this.authStore.user();
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role] ?? [];
    return perms.includes(permission);
  }

  canAny(...permissions: Permission[]): boolean {
    return permissions.some(p => this.can(p));
  }

  canAll(...permissions: Permission[]): boolean {
    return permissions.every(p => this.can(p));
  }

  get currentRole(): string {
    return this.authStore.user()?.role ?? 'viewer';
  }
}
