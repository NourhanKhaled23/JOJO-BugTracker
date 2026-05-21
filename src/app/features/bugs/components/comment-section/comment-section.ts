import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule, MessageSquare, Pencil, Trash2 } from 'lucide-angular';
import { BugsStore } from '../../store/bugs.store';
import { AuthStore } from '../../../auth/store/auth.store';
import { ToastService } from '../../../../core/services/toast.service';
import { RbacService } from '../../../../core/services/rbac.service';
import { ActivityService } from '../../../../core/services/activity.service';
import { BugCommentDisplay } from '../../../../core/models/comment.model';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule, ConfirmDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="space-y-4">
  @if (rbac.can('comment:create')) {
  <div class="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm">
    <div class="flex gap-4">
      <div class="w-10 h-10 rounded-xl bg-accent flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
        {{ (currentUser()?.fullName || 'Y').substring(0,2).toUpperCase() }}
      </div>
      <div class="flex-1" [formGroup]="commentForm">
        <textarea formControlName="text" placeholder="Add a comment..." rows="3"
          class="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors resize-none"
          [class.border-error]="commentForm.get('text')?.touched && commentForm.get('text')?.invalid"></textarea>
        <div class="flex justify-end mt-3">
          <button (click)="addComment()" [disabled]="commentForm.invalid"
            class="px-5 py-2 bg-accent text-white rounded-xl text-sm font-bold hover:bg-accent-bright transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Post Comment
          </button>
        </div>
      </div>
    </div>
  </div>
  }

  @if (comments().length === 0) {
  <div class="text-center py-12 text-text-muted">
    <lucide-icon [name]="MessageSquare" [size]="40" class="mx-auto mb-3 opacity-30"></lucide-icon>
    <p class="text-sm">No comments yet. Be the first to comment.</p>
  </div>
  }

  @for (comment of comments().slice().reverse(); track comment.id) {
    <div class="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm">
    <div class="flex gap-4">
      <div class="w-10 h-10 rounded-xl bg-bg-elevated border border-border flex-shrink-0 flex items-center justify-center text-text-primary font-bold text-sm">
        {{ comment.avatar }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-bold text-text-primary">{{ comment.user }}</h4>
            @if (comment.edited) {
            <span class="text-[10px] text-text-muted">(edited)</span>
            }
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {{ comment.time === 'Just now' ? 'Just now' : (comment.time | date:'MMM d, h:mm a') }}
            </span>
            @if (isOwnComment(comment) || rbac.can('comment:delete-any')) {
              @if (editingCommentId() !== comment.id && rbac.canAny('comment:edit-own')) {
              <button (click)="startEditComment(comment.id, comment.text)"
                class="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-accent transition-colors">
                <lucide-icon [name]="Pencil" [size]="14"></lucide-icon>
              </button>
              }
              <button (click)="deleteComment(comment.id)"
                class="p-1 rounded hover:bg-bg-hover text-text-muted hover:text-error transition-colors">
                <lucide-icon [name]="Trash" [size]="14"></lucide-icon>
              </button>
            }
          </div>
        </div>

        @if (editingCommentId() === comment.id) {
        <div>
          <textarea [(ngModel)]="editingCommentText" rows="3"
            class="w-full bg-bg-elevated border border-accent rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"></textarea>
          <div class="flex gap-2 mt-2">
            <button (click)="saveEditComment()" class="px-4 py-1.5 bg-accent text-white rounded-lg text-xs font-bold hover:bg-accent-bright transition-all">Save</button>
            <button (click)="cancelEditComment()" class="px-4 py-1.5 bg-bg-elevated text-text-muted rounded-lg text-xs font-bold hover:bg-bg-hover transition-all">Cancel</button>
          </div>
        </div>
        }
        @if (editingCommentId() !== comment.id) {
        <p class="text-sm text-text-secondary leading-relaxed">{{ comment.text }}</p>
        }
      </div>
    </div>
  </div>
  }
</section>

<app-confirm-dialog
  [isOpen]="showDeleteCommentId() !== null"
  title="Delete Comment"
  message="Are you sure you want to delete this comment?"
  confirmLabel="Delete"
  cancelLabel="Cancel"
  variant="danger"
  (confirmed)="confirmDeleteComment()"
  (cancelled)="showDeleteCommentId.set(null)">
</app-confirm-dialog>
  `
})
export class CommentSection {
  readonly store = inject(BugsStore);
  readonly authStore = inject(AuthStore);
  readonly toast = inject(ToastService);
  readonly rbac = inject(RbacService);
  readonly activity = inject(ActivityService);
  private readonly fb = inject(FormBuilder);

  readonly MessageSquare = MessageSquare;
  readonly Pencil = Pencil;
  readonly Trash = Trash2;

  editingCommentId = signal<string | null>(null);
  editingCommentText = signal('');
  showDeleteCommentId = signal<string | null>(null);

  readonly commentForm = this.fb.nonNullable.group({
    text: ['', Validators.required]
  });

  currentUser = computed(() => this.authStore.user());

  comments = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.store.comments()[bug.id] || [];
  });

  addComment(): void {
    const bug = this.store.selectedBug();
    const text = this.commentForm.getRawValue().text.trim();
    if (!bug || !text) return;
    const user = this.authStore.user();
    this.store.addComment({bugId: bug.id, text});
    this.activity.log({
      type: 'comment_added', entityId: bug.id, entityTitle: bug.title,
      userId: user?.id || 'me', userName: user?.fullName || 'You',
      description: 'Added a comment'
    });
    this.commentForm.reset();
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

  isOwnComment(comment: BugCommentDisplay): boolean {
    const user = this.authStore.user();
    return comment.userId === user?.id || comment.userId === 'me';
  }
}
