import { Component, inject, OnInit, signal, ChangeDetectionStrategy, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BugsStore } from '../store/bugs.store';
import { LucideAngularModule, LucideIconData, ChevronLeft, ChevronDown, Calendar, User, Clock, MessageSquare, Paperclip, Edit2, Bug, AlertCircle, CheckCircle2, ShieldAlert, Trash2, Tag, X, Check, Pencil, Download } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RbacService } from '../../../core/services/rbac.service';
import { ActivityService } from '../../../core/services/activity.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthStore } from '../../auth/store/auth.store';
import { BugStatus, BugPriority } from '../../../core/models/bug.model';
import { BugCommentDisplay } from '../../../core/models/comment.model';
import { UserLookupService } from '../../../core/services/user-lookup.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { BugEdit } from '../bug-edit/bug-edit';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-bug-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, FormsModule, BugEdit, ConfirmDialog],
  templateUrl: './bug-detail.html',
  styleUrl: './bug-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BugDetail implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(BugsStore);
  private readonly toast = inject(ToastService);
  readonly rbac = inject(RbacService);
  private readonly activity = inject(ActivityService);
  private readonly notifications = inject(NotificationService);
  private readonly authStore = inject(AuthStore);
  public readonly userLookup = inject(UserLookupService);
  readonly attachmentService = inject(AttachmentService);

  isUploadingAttachment = signal(false);
  isEditDrawerOpen = signal(false);
  showDeleteConfirm = signal(false);
  showDeleteCommentId = signal<string | null>(null);

  currentUser = computed(() => this.authStore.user());

  bugAttachments = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.attachmentService.getForBug(bug.id);
  });

  // Icons
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronDown = ChevronDown;
  readonly Calendar = Calendar;
  readonly User = User;
  readonly Clock = Clock;
  readonly MessageSquare = MessageSquare;
  readonly Paperclip = Paperclip;
  readonly Edit2 = Edit2;
  readonly BugIcon = Bug;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle2;
  readonly ShieldAlert = ShieldAlert;
  readonly Trash = Trash2;
  readonly Tag = Tag;
  readonly X = X;
  readonly Check = Check;
  readonly Pencil = Pencil;
  readonly Download = Download;

  readonly statuses: BugStatus[] = ['open', 'in-progress', 'testing', 'closed', 'blocked'];
  readonly priorities: BugPriority[] = ['low', 'medium', 'high', 'critical'];

  editingStatus = signal(false);
  editingPriority = signal(false);
  editingCommentId = signal<string | null>(null);
  editingCommentText = signal('');
  newComment = signal('');
  showLabelPicker = signal(false);
  activeTab = signal<'description' | 'comments' | 'activity' | 'attachments'>('description');

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: Params) => {
        const id = params['id'];
        if (id) this.loadBug(id);
      });
  }

  loadBug(id: string): void {
    const bug = this.store.bugs().find(b => b.id === id);
    if (bug) {
      this.store.setSelectedBug(bug);
    } else {
      this.store.setSelectedBug({
        id, projectId: 'p1', title: 'Issue ' + id,
        description: 'Auto-recovered issue data.',
        status: 'open', priority: 'high', assigneeId: 'u1', reporterId: 'u2',
        labelIds: [], attachmentIds: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), dueDate: null
      });
    }
  }

  comments = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.store.comments()[bug.id] || [];
  });

  activityEntries = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.activity.getForEntity(bug.id);
  });

  bugLabels = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.store.labels().filter(l => bug.labelIds.includes(l.id));
  });

  availableLabels = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return this.store.labels();
    return this.store.labels().filter(l => !bug.labelIds.includes(l.id));
  });

  addComment(): void {
    const bug = this.store.selectedBug();
    if (!bug || !this.newComment().trim()) return;
    const user = this.authStore.user();
    this.store.addComment({bugId: bug.id, text: this.newComment()});
    this.activity.log({
      type: 'comment_added', entityId: bug.id, entityTitle: bug.title,
      userId: user?.id || 'me', userName: user?.fullName || 'You',
      description: 'Added a comment'
    });
    this.newComment.set('');
    this.toast.show('Comment posted', 'success');
  }

  startEditComment(id: string, text: string): void {
    this.editingCommentId.set(id);
    this.editingCommentText.set(text);
  }

  saveEditComment(): void {
    const bug = this.store.selectedBug();
    const id = this.editingCommentId();
    if (!bug || !id || !this.editingCommentText().trim()) return;
    this.store.updateComment(bug.id, id, this.editingCommentText());
    this.editingCommentId.set(null);
    this.toast.show('Comment updated', 'success');
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
  }

  deleteComment(commentId: string): void {
    this.showDeleteCommentId.set(commentId);
  }

  confirmDeleteComment(): void {
    const bug = this.store.selectedBug();
    const id = this.showDeleteCommentId();
    if (!bug || !id) return;
    this.store.deleteComment(bug.id, id);
    this.showDeleteCommentId.set(null);
    this.toast.show('Comment deleted', 'info');
  }

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

  addLabel(labelId: string): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const updated = { ...bug, labelIds: [...bug.labelIds, labelId] };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
    this.showLabelPicker.set(false);
  }

  removeLabel(labelId: string): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const updated = { ...bug, labelIds: bug.labelIds.filter(id => id !== labelId) };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
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

  isOwnComment(comment: BugCommentDisplay): boolean {
    const user = this.authStore.user();
    return comment.userId === user?.id || comment.userId === 'me';
  }

  async onAttachFile(event: Event): Promise<void> {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploadingAttachment.set(true);
    const user = this.authStore.user();
    const { attachment, error } = await this.attachmentService.addFile(bug.id, file, user?.fullName || 'You');

    if (error) {
      this.toast.show(error, 'error');
    } else if (attachment) {
      // Update bug's attachmentIds
      const updated = { ...bug, attachmentIds: [...bug.attachmentIds, attachment.id], updatedAt: new Date().toISOString() };
      this.store.updateBug(updated);
      this.store.setSelectedBug(updated);
      this.activity.log({
        type: 'attachment_added', entityId: bug.id, entityTitle: bug.title,
        userId: user?.id || 'me', userName: user?.fullName || 'You',
        description: `Attached file "${attachment.fileName}"`
      });
      this.toast.show(`"${attachment.fileName}" attached`, 'success');
    }
    this.isUploadingAttachment.set(false);
    // Reset input
    (event.target as HTMLInputElement).value = '';
  }

  removeAttachment(attachmentId: string): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    this.attachmentService.remove(attachmentId);
    const updated = { ...bug, attachmentIds: bug.attachmentIds.filter(id => id !== attachmentId) };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
    this.toast.show('Attachment removed', 'info');
  }

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
