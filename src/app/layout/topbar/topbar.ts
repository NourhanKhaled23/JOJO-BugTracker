import { Component, EventEmitter, Output, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { AuthStore } from '../../features/auth/store/auth.store';
import { LucideAngularModule, Menu, Bell, Search, User as UserIcon, LogOut, Sun, Moon, Palette, ChevronRight, Check, Trash2, X } from 'lucide-angular';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { NotificationService, AppNotification } from '../../core/services/notification.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Topbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  readonly themeService = inject(ThemeService);
  readonly notifService = inject(NotificationService);

  readonly Menu = Menu;
  readonly Bell = Bell;
  readonly Search = Search;
  readonly UserIcon = UserIcon;
  readonly LogOut = LogOut;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Palette = Palette;
  readonly ChevronRight = ChevronRight;
  readonly Check = Check;
  readonly Trash = Trash2;
  readonly X = X;

  // Signals — required for OnPush to detect changes
  showUserMenu = signal(false);
  showThemeMenu = signal(false);
  showNotifPanel = signal(false);

  // Breadcrumb — reactive to route changes
  currentPage = signal('Dashboard');

  private readonly routeLabels: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/projects':  'Projects',
    '/bugs':      'Issues',
    '/labels':    'Labels',
    '/members':   'Team',
    '/settings':  'Settings',
    '/admin':     'Admin',
  };

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((e: NavigationEnd) => {
        const url: string = e.urlAfterRedirects;
        const match = Object.keys(this.routeLabels).find(k => url.startsWith(k));
        this.currentPage.set(match ? this.routeLabels[match] : 'BugTrackr');
      });
  }

  // Correct theme swatch colors — match actual theme backgrounds
  readonly themes: { id: Theme; label: string; color: string }[] = [
    { id: 'dark',   label: 'Midnight Dark', color: '#030712' },
    { id: 'light',  label: 'Classic Light', color: '#f8fafc' },
    { id: 'rose',   label: 'Rose Garden',   color: '#1a0d12' },
    { id: 'ocean',  label: 'Deep Ocean',    color: '#071828' },
    { id: 'forest', label: 'Deep Forest',   color: '#071a0a' },
  ];

  get user() { return this.authStore.user(); }

  toggleUserMenu(): void {
    const next = !this.showUserMenu();
    this.showUserMenu.set(next);
    if (next) { this.showThemeMenu.set(false); this.showNotifPanel.set(false); }
  }

  toggleThemeMenu(): void {
    const next = !this.showThemeMenu();
    this.showThemeMenu.set(next);
    if (next) { this.showUserMenu.set(false); this.showNotifPanel.set(false); }
  }

  toggleNotifPanel(): void {
    const next = !this.showNotifPanel();
    this.showNotifPanel.set(next);
    if (next) { this.showUserMenu.set(false); this.showThemeMenu.set(false); }
  }

  onNotificationClick(notif: AppNotification): void {
    this.notifService.markRead(notif.id);
    if (notif.link) {
      this.router.navigateByUrl(notif.link);
      this.showNotifPanel.set(false);
    }
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.showThemeMenu.set(false);
  }

  logout(): void {
    this.authStore.logout();
  }
}
