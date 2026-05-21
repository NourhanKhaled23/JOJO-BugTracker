import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Params } from '@angular/router';
import { BugsStore } from '../store/bugs.store';
import { LucideAngularModule, LucideIconData, ChevronLeft, ChevronDown, Edit2, Bug, AlertCircle, CheckCircle2, ShieldAlert, Trash2, Clock } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RbacService } from '../../../core/services/rbac.service';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthStore } from '../../../core/stores/auth.store';
import { BugStatus, BugPriority } from '../../../core/models/bug.model';
import { BugEdit } from '../bug-edit/bug-edit';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { CommentSection } from '../components/comment-section/comment-section';
import { LabelManager } from '../components/label-manager/label-manager';
import { AttachmentList } from '../components/attachment-list/attachment-list';
import { BugMetadata } from '../components/bug-metadata/bug-metadata';

@Component({
  selector: 'app-bug-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, BugEdit, ConfirmDialog, CommentSection, LabelManager, AttachmentList, BugMetadata],
  templateUrl: './bug-detail.html',
  styleUrl: './bug-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BugDetail implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(BugsStore);
  private readonly toast = inject(ToastService);
  readonly rbac = inject(RbacService);
  private readonly activity = inject(ActivityService);
  private readonly authStore = inject(AuthStore);

  isEditDrawerOpen = signal(false);
  showDeleteConfirm = signal(false);

  readonly ChevronLeft = ChevronLeft;
  readonly ChevronDown = ChevronDown;
  readonly Clock = Clock;
  readonly Edit2 = Edit2;
  readonly BugIcon = Bug;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle2;
  readonly ShieldAlert = ShieldAlert;
  readonly Trash = Trash2;

  readonly statuses: BugStatus[] = ['open', 'in-progress', 'testing', 'closed', 'blocked'];
  readonly priorities: BugPriority[] = ['low', 'medium', 'high', 'critical'];

  editingStatus = signal(false);
  editingPriority = signal(false);
  activeTab = signal<'description' | 'comments' | 'activity' | 'attachments'>('description');

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: Params) => {
        const id = params['id'];
        if (id) this.loadBug(id);
      });
  }

  bugNotFound = signal(false);

  loadBug(id: string): void {
    const bug = this.store.bugs().find(b => b.id === id);
    if (bug) {
      this.store.setSelectedBug(bug);
      this.bugNotFound.set(false);
    } else {
      this.bugNotFound.set(true);
    }
  }

  activityEntries = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.activity.getForEntity(bug.id);
  });

  setStatus(status: BugStatus): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const updated = { ...bug, status, updatedAt: new Date().toISOString() };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
    this.activity.log({
      type: 'bug_status_changed', entityId: bug.id, entityTitle: bug.title,
      userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
      description: `Status changed to ${status}`
    });
    this.editingStatus.set(false);
    this.toast.show(`Status updated to ${status}`, 'success');
  }

  setPriority(priority: BugPriority): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const updated = { ...bug, priority, updatedAt: new Date().toISOString() };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
    this.editingPriority.set(false);
    this.toast.show(`Priority updated to ${priority}`, 'success');
  }

  onDelete(): void {
    if (!this.rbac.can('bug:delete')) {
      this.toast.show('You do not have permission to delete bugs', 'error');
      return;
    }
    this.showDeleteConfirm.set(true);
  }

  confirmDeleteBug(): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    this.store.deleteBug(bug.id);
    this.activity.log({
      type: 'bug_deleted', entityId: bug.id, entityTitle: bug.title,
      userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
      description: 'Deleted the issue'
    });
    this.showDeleteConfirm.set(false);
    this.toast.show('Issue deleted', 'error');
    this.router.navigate(['/bugs']);
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'low': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-info bg-info/10 border-info/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'critical': return 'text-error bg-error/10 border-error/20';
      default: return 'text-text-muted bg-bg-elevated border-border';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'text-error bg-error/10 border-error/20';
      case 'in-progress': return 'text-warning bg-warning/10 border-warning/20';
      case 'testing': return 'text-info bg-info/10 border-info/20';
      case 'closed': return 'text-success bg-success/10 border-success/20';
      case 'blocked': return 'text-text-muted bg-bg-elevated border-border';
      default: return 'text-text-muted bg-bg-elevated border-border';
    }
  }

  getStatusIcon(status: string): LucideIconData {
    switch (status) {
      case 'open': return this.AlertCircle;
      case 'in-progress': return this.Clock;
      case 'testing': return this.ShieldAlert;
      case 'closed': return this.CheckCircle;
      default: return this.BugIcon;
    }
  }


}
