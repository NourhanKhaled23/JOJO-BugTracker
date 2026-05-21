import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStore } from '../../auth/store/auth.store';
import { Drawer } from '../../../shared/components/drawer/drawer';
import { BugsStore } from '../store/bugs.store';
import { Bug, BugStatus, BugPriority } from '../../../core/models/bug.model';
import { ProjectsStore } from '../../projects/store/projects.store';
import { ActivityService } from '../../../core/services/activity.service';
import { UserLookupService } from '../../../core/services/user-lookup.service';

@Component({
  selector: 'app-bug-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, Drawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<app-drawer [isOpen]="isOpen" title="Edit Issue" (closed)="onClose()">
  @if (bugForm) {
    <form [formGroup]="bugForm" (ngSubmit)="onSubmit()" class="space-y-5">

    <div>
      <label for="edit-bug-title" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Issue Title *</label>
      <input id="edit-bug-title" type="text" formControlName="title" placeholder="Short, descriptive title"
        class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-sm"
        [class.border-error]="bugForm.get('title')?.invalid && bugForm.get('title')?.touched">
    </div>

    <div>
      <label for="edit-bug-project" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Project *</label>
      <select id="edit-bug-project" formControlName="projectId"
        class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-sm appearance-none cursor-pointer">
        <option value="" disabled>Select a project</option>
        @for (project of projectStore.projects(); track project.id) {
          <option [value]="project.id">{{ project.name }}</option>
        }
      </select>
    @if (bugForm.get('projectId')?.touched && bugForm.get('projectId')?.hasError('required')) {
      <p class="mt-1 text-xs" style="color: var(--error);">Project is required</p>
    }
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="edit-bug-priority" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Priority</label>
        <select id="edit-bug-priority" formControlName="priority"
          class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-sm appearance-none cursor-pointer capitalize">
          @for (p of priorities; track p) {
            <option [value]="p">{{ p }}</option>
          }
        </select>
      </div>
      <div>
        <label for="edit-bug-status" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Status</label>
        <select id="edit-bug-status" formControlName="status"
          class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-sm appearance-none cursor-pointer capitalize">
          @for (s of statuses; track s) {
            <option [value]="s">{{ s.replace('-', ' ') }}</option>
          }
        </select>
      </div>
    </div>

    <div>
      <label for="edit-bug-due-date" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Due Date (optional)</label>
      <input id="edit-bug-due-date" type="date" formControlName="dueDate"
        class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-sm">
    </div>

    <div>
      <label for="edit-bug-assignee" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Assignee (optional)</label>
      <select id="edit-bug-assignee" formControlName="assigneeId"
        class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-accent transition-colors text-sm appearance-none cursor-pointer">
        <option [ngValue]="null">Unassigned</option>
        @for (member of userLookup.members(); track member.id) {
          <option [value]="member.id">{{ member.name }}</option>
        }
      </select>
    </div>

    <div>
      <span id="edit-bug-labels" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Labels</span>
      <div role="group" aria-labelledby="edit-bug-labels" class="flex flex-wrap gap-2">
        @for (label of store.labels(); track label.id) {
          <button type="button" (click)="toggleLabel(label.id)"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
            [style.border-color]="selectedLabelIds().includes(label.id) ? label.color : 'transparent'"
            [style.background-color]="selectedLabelIds().includes(label.id) ? label.color + '20' : 'var(--bg-elevated)'"
            [style.color]="selectedLabelIds().includes(label.id) ? label.color : 'var(--text-muted)'">
            <span class="w-2 h-2 rounded-full" [style.background-color]="label.color"></span>
            {{ label.name }}
          </button>
        }
      </div>
    </div>

    <div>
      <label for="edit-bug-description" class="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Description *</label>
      <textarea id="edit-bug-description" formControlName="description"
        placeholder="Steps to reproduce, expected vs actual behavior..."
        rows="6"
        class="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-accent transition-colors resize-none text-sm"
        [class.border-error]="bugForm.get('description')?.invalid && bugForm.get('description')?.touched"></textarea>
    @if (bugForm.get('description')?.touched && bugForm.get('description')?.hasError('required')) {
      <p class="mt-1 text-xs" style="color: var(--error);">Description is required</p>
    }
    </div>

    <div footer class="flex justify-end gap-3 w-full">
      <button type="button" (click)="onClose()"
        class="px-6 py-2.5 rounded-xl font-semibold text-text-secondary hover:bg-bg-hover transition-colors">
        Cancel
      </button>
      <button type="submit"
        class="px-8 py-2.5 rounded-xl font-bold bg-accent text-white hover:bg-accent-bright transition-all shadow-lg shadow-accent/20">
        Save Changes
      </button>
    </div>
  </form>
  }
</app-drawer>
  `
})
export class BugEdit implements OnChanges {
  private readonly fb = inject(FormBuilder);
  readonly store = inject(BugsStore);
  readonly projectStore = inject(ProjectsStore);
  private readonly toast = inject(ToastService);
  private readonly authStore = inject(AuthStore);
  private readonly activity = inject(ActivityService);
  readonly userLookup = inject(UserLookupService);

  @Input() isOpen = false;
  @Input() bug: Bug | null = null;
  @Output() closed = new EventEmitter<void>();

  bugForm!: FormGroup;
  selectedLabelIds = signal<string[]>([]);

  readonly priorities: BugPriority[] = ['low', 'medium', 'high', 'critical'];
  readonly statuses: BugStatus[] = ['open', 'in-progress', 'testing', 'closed', 'blocked'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bug'] && this.bug) {
      this.selectedLabelIds.set([...this.bug.labelIds]);
      this.bugForm = this.fb.group({
        title:       [this.bug.title,       [Validators.required, Validators.minLength(5)]],
        description: [this.bug.description, [Validators.required]],
        projectId:   [this.bug.projectId,   [Validators.required]],
        status:      [this.bug.status,      [Validators.required]],
        priority:    [this.bug.priority,    [Validators.required]],
        assigneeId:  [this.bug.assigneeId],
        dueDate:     [this.bug.dueDate]
      });
    }
  }

  toggleLabel(labelId: string): void {
    this.selectedLabelIds.update(ids =>
      ids.includes(labelId) ? ids.filter(id => id !== labelId) : [...ids, labelId]
    );
  }

  onSubmit(): void {
    if (!this.bug || !this.bugForm.valid) {
      this.bugForm.markAllAsTouched();
      this.toast.show('Please fill in all required fields', 'error');
      return;
    }
    const user = this.authStore.user();
    const updated: Bug = {
      ...this.bug,
      ...this.bugForm.value,
      labelIds: this.selectedLabelIds(),
      dueDate: this.bugForm.value.dueDate || null,
      updatedAt: new Date().toISOString()
    };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
    this.activity.log({
      type: 'bug_updated', entityId: updated.id, entityTitle: updated.title,
      userId: user?.id || 'me', userName: user?.fullName || 'You',
      description: `Updated issue "${updated.title}"`
    });
    this.toast.show('Issue updated', 'success');
    this.onClose();
  }

  onClose(): void {
    if (this.bugForm) {
      this.bugForm.reset();
    }
    this.selectedLabelIds.set([]);
    this.closed.emit();
  }
}
