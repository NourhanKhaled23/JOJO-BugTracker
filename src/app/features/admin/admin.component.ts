import { Component, inject, computed, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Shield, Users, Bug, FolderKanban, Trash2, Database, Activity, AlertTriangle, CheckCircle2, Settings } from 'lucide-angular';
import { BugsStore } from '../bugs/store/bugs.store';
import { ProjectsStore } from '../projects/store/projects.store';
import { ActivityService } from '../../core/services/activity.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthStore } from '../../core/stores/auth.store';
import { slideInAnimation, listAnimation } from '../../core/animations/ui.animations';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ConfirmDialog],
  animations: [slideInAnimation, listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
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
