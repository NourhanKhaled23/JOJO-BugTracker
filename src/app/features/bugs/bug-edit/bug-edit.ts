import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStore } from '../../../core/stores/auth.store';
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
  templateUrl: './bug-edit.html',
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
