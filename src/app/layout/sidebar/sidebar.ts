import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, FolderKanban, Bug, Users, Settings, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  @Input() isCollapsed = false;

  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderKanban = FolderKanban;
  readonly Bug = Bug;
  readonly Users = Users;
  readonly Settings = Settings;
  readonly ChevronRight = ChevronRight;

  navItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard', exact: true },
    { label: 'Projects', icon: 'folder-kanban', route: '/projects', exact: false },
    { label: 'Issues', icon: 'bug', route: '/bugs', exact: false },
    { label: 'Members', icon: 'users', route: '/members', exact: false },
  ];
}
