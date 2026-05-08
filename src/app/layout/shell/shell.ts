import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';
import { AuthStore } from '../../features/auth/store/auth.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, Topbar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  private authStore = inject(AuthStore);
  
  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
