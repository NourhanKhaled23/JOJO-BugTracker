import { Component, Input, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, FolderKanban, Bug, Users, Settings, ChevronRight, Tag, ShieldAlert, LogOut } from 'lucide-angular';
import { listAnimation } from '../../core/animations/ui.animations';
import { AuthStore } from '../../core/stores/auth.store';
import { ProjectsStore } from '../../features/projects/store/projects.store';
import { RbacService } from '../../core/services/rbac.service';
import { Role } from '../../core/enums/role';
import { Logo } from '../../shared/components/logo/logo';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, Logo],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  animations: [listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  @Input() isCollapsed = false;

  readonly authStore = inject(AuthStore);
  private readonly projectsStore = inject(ProjectsStore);
  readonly rbac = inject(RbacService);

  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderKanban = FolderKanban;
  readonly Bug = Bug;
  readonly Users = Users;
  readonly Settings = Settings;
  readonly ChevronRight = ChevronRight;
  readonly Tag = Tag;
  readonly ShieldAlert = ShieldAlert;
  readonly LogOut = LogOut;

  readonly navItems = computed(() => [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', exact: true, show: true },
    { label: 'Projects',  icon: FolderKanban,    route: '/projects',  exact: false, show: true },
    { label: 'Issues',    icon: Bug,             route: '/bugs',      exact: false, show: true },
    { label: 'Labels',    icon: Tag,             route: '/labels',    exact: false, show: true },
    { label: 'Members',   icon: Users,           route: '/members',   exact: false, show: this.rbac.can('member:invite') },
    { label: 'Settings',  icon: Settings,        route: '/settings',  exact: false, show: this.rbac.can('settings:edit') },
  ]);

  readonly pinnedProjects = computed(() =>
    this.projectsStore.activeProjects().slice(0, 3)
  );

  get isAdmin(): boolean {
    return this.authStore.user()?.role === Role.Admin || this.authStore.user()?.role === Role.Owner;
  }

  get userLabel(): string {
    return this.authStore.user()?.fullName || 'User';
  }

  get userRole(): string {
    return this.authStore.user()?.role || 'viewer';
  }

  get userInitial(): string {
    return this.authStore.user()?.fullName?.charAt(0) || 'U';
  }

  logout(): void {
    this.authStore.logout();
  }
}
