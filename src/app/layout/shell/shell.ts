import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { AuthStore } from '../../core/stores/auth.store';
import { ProjectsStore } from '../../features/projects/store/projects.store';
import { LucideAngularModule, LayoutDashboard, FolderKanban, Bug, Settings, CheckCircle2, AlertCircle, Info, AlertTriangle, Users } from 'lucide-angular';
import { PerformanceOverlay } from '../../shared/components/performance-overlay/performance-overlay';
import { CommandPalette } from '../../shared/components/command-palette/command-palette';
import { fadeAnimation, listAnimation } from '../../core/animations/ui.animations';
import { ToastService } from '../../core/services/toast.service';


@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar, RouterLink, RouterLinkActive, LucideAngularModule, PerformanceOverlay, CommandPalette],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  animations: [fadeAnimation, listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Shell {
  private readonly authStore = inject(AuthStore);
  readonly store = inject(ProjectsStore);
  readonly toastService = inject(ToastService);

  
  isSidebarCollapsed = false;

  
  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderKanban = FolderKanban;
  readonly Bug = Bug;
  readonly Settings = Settings;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly Info = Info;
  readonly AlertTriangle = AlertTriangle;
  readonly Users = Users;

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
