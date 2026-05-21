import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldAlert, Home, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="min-h-screen flex items-center justify-center bg-bg-base p-8">
  <div class="max-w-md text-center">
    <div class="w-20 h-20 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto mb-8">
      <lucide-icon [name]="ShieldAlert" [size]="40"></lucide-icon>
    </div>
    <h1 class="text-6xl font-black tracking-tighter text-text-primary mb-4">403</h1>
    <h2 class="text-2xl font-bold text-text-primary mb-2">Access Denied</h2>
    <p class="text-text-secondary mb-8">You don't have permission to access this page.</p>
    <div class="flex items-center justify-center gap-4">
      <a routerLink="/dashboard"
        class="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-bright transition-all">
        <lucide-icon [name]="Home" [size]="18"></lucide-icon>
        Dashboard
      </a>
      <a routerLink="/auth/login"
        class="flex items-center gap-2 px-6 py-3 border border-border rounded-xl font-bold text-text-primary hover:bg-bg-hover transition-all">
        <lucide-icon [name]="ArrowLeft" [size]="18"></lucide-icon>
        Sign In
      </a>
    </div>
  </div>
</div>
  `
})
export class Unauthorized {
  readonly ShieldAlert = ShieldAlert;
  readonly Home = Home;
  readonly ArrowLeft = ArrowLeft;
}
