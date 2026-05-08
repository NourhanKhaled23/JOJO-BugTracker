import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../features/auth/store/auth.store';
import { LucideAngularModule, Menu, Bell, Search, User as UserIcon, LogOut } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss'
})
export class Topbar {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  private authStore = inject(AuthStore);
  private router = inject(Router);

  readonly Menu = Menu;
  readonly Bell = Bell;
  readonly Search = Search;
  readonly UserIcon = UserIcon;
  readonly LogOut = LogOut;

  showUserMenu = false;

  get user() {
    return this.authStore.user();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    this.authStore.logout();
  }
}
