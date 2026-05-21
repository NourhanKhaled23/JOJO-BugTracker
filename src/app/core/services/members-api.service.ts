import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Role } from '../enums/role';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Away' | 'Offline' | 'Pending';
  initials: string;
  color: string;
}

const STORAGE_KEY = 'bugtrackr_members';

const DEFAULT_MEMBERS: Member[] = [
  { id: 'u1', name: 'Jane Doe', email: 'jane.doe@example.com', role: Role.Admin, status: 'Active', initials: 'JD', color: 'var(--accent)' },
  { id: 'u2', name: 'John Smith', email: 'john.smith@example.com', role: Role.Developer, status: 'Active', initials: 'JS', color: 'var(--success)' },
  { id: 'u3', name: 'Emily Chen', email: 'emily.chen@example.com', role: Role.Viewer, status: 'Away', initials: 'EC', color: 'var(--warning)' },
  { id: 'u4', name: 'Michael Brown', email: 'michael.b@example.com', role: Role.Developer, status: 'Offline', initials: 'MB', color: 'var(--text-muted)' },
  { id: 'u5', name: 'Sarah Wilson', email: 'sarah.w@example.com', role: Role.Admin, status: 'Active', initials: 'SW', color: 'var(--info)' },
];

@Injectable({ providedIn: 'root' })
export class MembersApiService {
  getMembers(): Observable<Member[]> {
    return of(this.load()).pipe(delay(300));
  }

  inviteMember(member: Member): Observable<Member> {
    const list = this.load();
    list.push(member);
    this.save(list);
    this.syncToUsers(list);
    return of(member).pipe(delay(300));
  }

  updateRole(id: string, role: Role): Observable<void> {
    const list = this.load();
    const index = list.findIndex(m => m.id === id);
    if (index !== -1) {
      list[index].role = role;
      this.save(list);
    }
    return of(void 0).pipe(delay(300));
  }

  deleteMember(id: string): Observable<void> {
    const list = this.load();
    this.save(list.filter(m => m.id !== id));
    return of(void 0).pipe(delay(300));
  }

  private load(): Member[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.save(DEFAULT_MEMBERS);
        return [...DEFAULT_MEMBERS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_MEMBERS];
    }
  }

  private save(data: Member[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private syncToUsers(members: Member[]): void {
    try {
      const usersRaw = localStorage.getItem('bugtrackr_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      for (const m of members) {
        if (!users.some((u: { id: string }) => u.id === m.id)) {
          users.push({ id: m.id, fullName: m.name, email: m.email, role: m.role });
        }
      }
      localStorage.setItem('bugtrackr_users', JSON.stringify(users));
    } catch {
      // Storage unavailable
    }
  }
}
