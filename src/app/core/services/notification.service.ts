import { Injectable, signal, computed } from '@angular/core';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
}

const STORAGE_KEY = 'bugtrackr_notifications';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<AppNotification[]>(this.load());

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = computed(() => this._notifications().filter(n => !n.read).length);

  push(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const entry: AppNotification = {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [entry, ...this._notifications()].slice(0, 50);
    this._notifications.set(updated);
    this.save(updated);
  }

  markRead(id: string): void {
    const updated = this._notifications().map(n => n.id === id ? { ...n, read: true } : n);
    this._notifications.set(updated);
    this.save(updated);
  }

  markAllRead(): void {
    const updated = this._notifications().map(n => ({ ...n, read: true }));
    this._notifications.set(updated);
    this.save(updated);
  }

  remove(id: string): void {
    const updated = this._notifications().filter(n => n.id !== id);
    this._notifications.set(updated);
    this.save(updated);
  }

  clearAll(): void {
    this._notifications.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private save(data: AppNotification[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private load(): AppNotification[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
