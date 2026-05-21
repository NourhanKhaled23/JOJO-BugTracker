import { Component, inject, computed, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, Users, Bug, FolderKanban, Trash2, Database, Activity, AlertTriangle, CheckCircle2, Settings } from 'lucide-angular';
import { BugsStore } from '../bugs/store/bugs.store';
import { ProjectsStore } from '../projects/store/projects.store';
import { ActivityService } from '../../core/services/activity.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthStore } from '../auth/store/auth.store';
import { slideInAnimation, listAnimation } from '../../core/animations/ui.animations';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmDialog],
  animations: [slideInAnimation, listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<div class="h-full flex flex-col bg-bg-base page-enter">
  <header class="bg-bg-surface border-b border-border px-6 py-6 sticky top-0 z-20">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
          <lucide-icon [name]="Shield" [size]="24"></lucide-icon>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-text-primary">Admin Panel</h1>
          <p class="text-text-secondary mt-0.5">System management and oversight</p>
        </div>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-error/10 border border-error/20 text-error text-xs font-bold uppercase tracking-widest">
        <lucide-icon [name]="Shield" [size]="12"></lucide-icon>
        Admin Access
      </div>
    </div>
  </header>

  <main class="flex-1 overflow-y-auto p-6 lg:p-8">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6" [@slideInAnimation]>
        <div class="glass border border-border rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center">
              <lucide-icon [name]="Bug" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-bold text-text-muted uppercase">Total</span>
          </div>
          <div class="text-3xl font-black text-text-primary">{{ bugStore.bugCount() }}</div>
          <div class="text-sm text-text-muted mt-1">Bugs Tracked</div>
        </div>

        <div class="glass border border-border rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <lucide-icon [name]="FolderKanban" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-bold text-text-muted uppercase">Active</span>
          </div>
          <div class="text-3xl font-black text-text-primary">{{ projectStore.activeProjects().length }}</div>
          <div class="text-sm text-text-muted mt-1">Projects</div>
        </div>

        <div class="glass border border-border rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <lucide-icon [name]="CheckCircle2" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-bold text-text-muted uppercase">Closed</span>
          </div>
          <div class="text-3xl font-black text-text-primary">{{ closedBugsCount() }}</div>
          <div class="text-sm text-text-muted mt-1">Resolved</div>
        </div>

        <div class="glass border border-border rounded-2xl p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <lucide-icon [name]="Activity" [size]="20"></lucide-icon>
            </div>
            <span class="text-xs font-bold text-text-muted uppercase">Logged</span>
          </div>
          <div class="text-3xl font-black text-text-primary">{{ activityService.entries().length }}</div>
          <div class="text-sm text-text-muted mt-1">Activity Events</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Data Management -->
        <div class="lg:col-span-2 space-y-6">
          <section class="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-border bg-bg-elevated/30 flex items-center gap-3">
              <lucide-icon [name]="Database" [size]="18" class="text-accent"></lucide-icon>
              <h2 class="text-lg font-bold text-text-primary">Data Overview</h2>
            </div>
            <div class="divide-y divide-border">
              <div class="px-6 py-4 flex items-center justify-between hover:bg-bg-hover transition-colors">
                <div class="flex items-center gap-3">
                  <lucide-icon [name]="Bug" [size]="16" class="text-text-muted"></lucide-icon>
                  <span class="text-sm font-medium text-text-primary">Bugs</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm font-bold text-text-primary">{{ bugStore.bugCount() }} records</span>
                  <button (click)="clearBugs()"
                    class="px-3 py-1 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-all">
                    Clear
                  </button>
                </div>
              </div>
              <div class="px-6 py-4 flex items-center justify-between hover:bg-bg-hover transition-colors">
                <div class="flex items-center gap-3">
                  <lucide-icon [name]="FolderKanban" [size]="16" class="text-text-muted"></lucide-icon>
                  <span class="text-sm font-medium text-text-primary">Projects</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm font-bold text-text-primary">{{ projectStore.projectCount() }} records</span>
                  <button (click)="clearProjects()"
                    class="px-3 py-1 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-all">
                    Clear
                  </button>
                </div>
              </div>
              <div class="px-6 py-4 flex items-center justify-between hover:bg-bg-hover transition-colors">
                <div class="flex items-center gap-3">
                  <lucide-icon [name]="Activity" [size]="16" class="text-text-muted"></lucide-icon>
                  <span class="text-sm font-medium text-text-primary">Activity Log</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm font-bold text-text-primary">{{ activityService.entries().length }} events</span>
                  <button (click)="clearActivity()"
                    class="px-3 py-1 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-all">
                    Clear
                  </button>
                </div>
              </div>
              <div class="px-6 py-4 flex items-center justify-between hover:bg-bg-hover transition-colors">
                <div class="flex items-center gap-3">
                  <lucide-icon [name]="AlertTriangle" [size]="16" class="text-text-muted"></lucide-icon>
                  <span class="text-sm font-medium text-text-primary">Notifications</span>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-sm font-bold text-text-primary">{{ notifService.notifications().length }} items</span>
                  <button (click)="notifService.clearAll()"
                    class="px-3 py-1 text-xs font-bold text-error border border-error/20 rounded-lg hover:bg-error hover:text-white transition-all">
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Recent Activity -->
          <section class="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-border bg-bg-elevated/30 flex items-center gap-3">
              <lucide-icon [name]="Activity" [size]="18" class="text-accent"></lucide-icon>
              <h2 class="text-lg font-bold text-text-primary">Recent Activity</h2>
            </div>
            <div class="divide-y divide-border/50 max-h-72 overflow-y-auto">
              @for (entry of activityService.getRecent(10); track entry.id) {
                <div class="px-6 py-3 flex items-start gap-3 hover:bg-bg-hover transition-colors">
                  <div class="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {{ entry.userName.substring(0,2).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-text-primary truncate">
                      <span class="font-bold">{{ entry.userName }}</span> {{ entry.description }}
                    </p>
                    <p class="text-[10px] text-text-muted mt-0.5">{{ entry.timestamp | date:'MMM d, h:mm a' }}</p>
                  </div>
                </div>
              }
              @if (activityService.entries().length === 0) {
                <div class="px-6 py-10 text-center text-text-muted text-sm">No activity recorded yet.</div>
              }
            </div>
          </section>
        </div>

        <!-- Quick Actions -->
        <div class="space-y-6">
          <section class="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-border bg-bg-elevated/30">
              <h2 class="text-lg font-bold text-text-primary">Quick Actions</h2>
            </div>
            <div class="p-4 space-y-3">
              <a routerLink="/bugs" class="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors group">
                <div class="w-9 h-9 rounded-lg bg-error/10 text-error flex items-center justify-center group-hover:bg-error group-hover:text-white transition-all">
                  <lucide-icon [name]="Bug" [size]="16"></lucide-icon>
                </div>
                <span class="text-sm font-medium text-text-primary">View All Bugs</span>
              </a>
              <a routerLink="/projects" class="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors group">
                <div class="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                  <lucide-icon [name]="FolderKanban" [size]="16"></lucide-icon>
                </div>
                <span class="text-sm font-medium text-text-primary">Manage Projects</span>
              </a>
              <a routerLink="/members" class="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors group">
                <div class="w-9 h-9 rounded-lg bg-success/10 text-success flex items-center justify-center group-hover:bg-success group-hover:text-white transition-all">
                  <lucide-icon [name]="Users" [size]="16"></lucide-icon>
                </div>
                <span class="text-sm font-medium text-text-primary">Team Members</span>
              </a>
              <a routerLink="/settings" class="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-hover transition-colors group">
                <div class="w-9 h-9 rounded-lg bg-warning/10 text-warning flex items-center justify-center group-hover:bg-warning group-hover:text-white transition-all">
                  <lucide-icon [name]="Settings" [size]="16"></lucide-icon>
                </div>
                <span class="text-sm font-medium text-text-primary">System Settings</span>
              </a>
            </div>
          </section>

          <!-- Danger Zone -->
          <section class="bg-error/5 border border-error/20 rounded-2xl overflow-hidden shadow-sm">
            <div class="px-6 py-4 border-b border-error/20">
              <h2 class="text-lg font-bold text-error">Danger Zone</h2>
            </div>
            <div class="p-4 space-y-3">
              <button (click)="resetAllData()"
                class="w-full flex items-center gap-3 p-3 rounded-xl border border-error/20 text-error hover:bg-error hover:text-white transition-all group">
                <lucide-icon [name]="Trash" [size]="16"></lucide-icon>
                <span class="text-sm font-bold">Reset All Data</span>
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  </main>
</div>

<app-confirm-dialog
  [isOpen]="confirmAction() !== null"
  [title]="confirmTitle"
  [message]="confirmMessage"
  confirmLabel="Yes, Delete"
  cancelLabel="Cancel"
  variant="danger"
  (confirmed)="onConfirmed()"
  (cancelled)="confirmAction.set(null)">
</app-confirm-dialog>
  `
})
export class AdminComponent {
  readonly bugStore = inject(BugsStore);
  readonly projectStore = inject(ProjectsStore);
  readonly activityService = inject(ActivityService);
  readonly notifService = inject(NotificationService);
  private readonly toast = inject(ToastService);
  private readonly authStore = inject(AuthStore);

  readonly Shield = Shield;
  readonly Users = Users;
  readonly Bug = Bug;
  readonly FolderKanban = FolderKanban;
  readonly Trash = Trash2;
  readonly Database = Database;
  readonly Activity = Activity;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle2 = CheckCircle2;
  readonly Settings = Settings;

  closedBugsCount = computed(() => this.bugStore.bugs().filter(b => b.status === 'closed').length);

  // Confirm dialog state
  confirmAction = signal<'bugs' | 'projects' | 'all' | null>(null);

  clearBugs(): void { this.confirmAction.set('bugs'); }
  clearProjects(): void { this.confirmAction.set('projects'); }
  resetAllData(): void { this.confirmAction.set('all'); }

  onConfirmed(): void {
    const action = this.confirmAction();
    if (action === 'bugs') {
      this.bugStore.setBugs([]);
      this.toast.show('All bugs cleared', 'info');
    } else if (action === 'projects') {
      this.projectStore.setProjects([]);
      this.toast.show('All projects cleared', 'info');
    } else if (action === 'all') {
      this.bugStore.setBugs([]);
      this.projectStore.setProjects([]);
      this.activityService.clear();
      this.notifService.clearAll();
      localStorage.removeItem('bugtrackr_members');
      localStorage.removeItem('bugtrackr_comments');
      localStorage.removeItem('bugtrackr_labels');
      this.toast.show('All data has been reset', 'error');
    }
    this.confirmAction.set(null);
  }

  clearActivity(): void {
    this.activityService.clear();
    this.toast.show('Activity log cleared', 'info');
  }

  get confirmTitle(): string {
    const a = this.confirmAction();
    if (a === 'bugs') return 'Clear All Bugs';
    if (a === 'projects') return 'Clear All Projects';
    return 'Reset All Data';
  }

  get confirmMessage(): string {
    const a = this.confirmAction();
    if (a === 'bugs') return 'This will permanently delete all bug records. Cannot be undone.';
    if (a === 'projects') return 'This will permanently delete all projects. Cannot be undone.';
    return 'This will clear bugs, projects, activity, notifications and labels. Cannot be undone.';
  }
}
