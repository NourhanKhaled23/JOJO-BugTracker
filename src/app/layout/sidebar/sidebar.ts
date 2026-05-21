import { Component, Input, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, FolderKanban, Bug, Users, Settings, ChevronRight, Tag, ShieldAlert } from 'lucide-angular';
import { listAnimation } from '../../core/animations/ui.animations';
import { AuthStore } from '../../features/auth/store/auth.store';
import { ProjectsStore } from '../../features/projects/store/projects.store';
import { Role } from '../../core/enums/role';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  animations: [listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar {
  @Input() isCollapsed = false;

  readonly authStore = inject(AuthStore);
  private readonly projectsStore = inject(ProjectsStore);

  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderKanban = FolderKanban;
  readonly Bug = Bug;
  readonly Users = Users;
  readonly Settings = Settings;
  readonly ChevronRight = ChevronRight;
  readonly Tag = Tag;
  readonly ShieldAlert = ShieldAlert;

  navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard', exact: true },
    { label: 'Projects',  icon: FolderKanban,    route: '/projects',  exact: false },
    { label: 'Issues',    icon: Bug,             route: '/bugs',      exact: false },
    { label: 'Labels',    icon: Tag,             route: '/labels',    exact: false },
    { label: 'Members',   icon: Users,           route: '/members',   exact: false },
    { label: 'Settings',  icon: Settings,        route: '/settings',  exact: false },
  ];

  // Show up to 3 active projects in the pinned section
  pinnedProjects = computed(() =>
    this.projectsStore.activeProjects().slice(0, 3)
  );

  get isAdmin(): boolean {
    const role = this.authStore.user()?.role;
    return role === Role.Admin || role === Role.Owner;
  }
}
