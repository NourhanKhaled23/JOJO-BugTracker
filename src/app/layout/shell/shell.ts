import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { AuthStore } from '../../features/auth/store/auth.store';
import { LucideAngularModule, LayoutDashboard, FolderKanban, Bug, Settings } from 'lucide-angular';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  private authStore = inject(AuthStore);
  
  isSidebarCollapsed = false;
  
  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderKanban = FolderKanban;
  readonly Bug = Bug;
  readonly Settings = Settings;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
