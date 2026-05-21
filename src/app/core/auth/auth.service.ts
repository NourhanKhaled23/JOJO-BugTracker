import { Injectable, inject } from '@angular/core';
import { AuthStore } from '../stores/auth.store';
import { User } from '../models/user.model';
import { Role } from '../enums/role';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authStore = inject(AuthStore);

  currentUser(): User | null {
    return this.authStore.user();
  }

  isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  loginWithCredentials(email: string, password: string): { user: User | null; error: string | null } {
    // 1. Check Demo Account
    if (email === 'test@test.com' && password === 'password') {
      const user: User = {
        id: '1',
        fullName: 'Demo Admin',
        email: 'test@test.com',
        avatarUrl: null,
        role: Role.Admin,
        createdAt: new Date().toISOString()
      };
      return { user, error: null };
    }

    // 2. Check Registered Users
    try {
      const usersRaw = localStorage.getItem('bugtrackr_users');
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        const found = users.find((u: { email: string }) => u.email === email);
        if (found) {
          // Sync with members panel for role
          const membersRaw = localStorage.getItem('bugtrackr_members');
          const user: User = {
            id: found.id,
            fullName: found.fullName,
            email: found.email,
            avatarUrl: null,
            role: found.role?.toLowerCase() || Role.Developer,
            createdAt: new Date().toISOString()
          };
          if (membersRaw) {
            const members = JSON.parse(membersRaw);
            const mem = members.find((m: { email: string }) => m.email === email);
            if (mem) {
              user.fullName = mem.name;
              user.role = mem.role?.toLowerCase();
            }
          }
          return { user, error: null };
        }
      }
    } catch {
      // Ignore
    }

    return { user: null, error: 'Invalid email or password' };
  }
}
