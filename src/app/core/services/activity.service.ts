import { Injectable, signal } from '@angular/core';

export type ActivityType = 'bug_created' | 'bug_updated' | 'bug_deleted' | 'bug_status_changed'
  | 'project_created' | 'project_updated' | 'project_deleted' | 'project_archived'
  | 'comment_added' | 'comment_deleted' | 'member_invited' | 'member_removed'
  | 'label_created' | 'label_deleted' | 'attachment_added';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  entityId: string;
  entityTitle: string;
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

const STORAGE_KEY = 'bugtrackr_activity';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private _entries = signal<ActivityEntry[]>(this.load());

  readonly entries = this._entries.asReadonly();

  log(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): void {
    const newEntry: ActivityEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    const updated = [newEntry, ...this._entries()].slice(0, 200);
    this._entries.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  getForEntity(entityId: string): ActivityEntry[] {
    return this._entries().filter(e => e.entityId === entityId);
  }

  getRecent(limit = 20): ActivityEntry[] {
    return this._entries().slice(0, limit);
  }

  clear(): void {
    this._entries.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private load(): ActivityEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
