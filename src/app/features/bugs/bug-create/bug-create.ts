import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';
import { AuthStore } from '../../auth/store/auth.store';

import { Drawer } from '../../../shared/components/drawer/drawer';
import { BugsStore } from '../store/bugs.store';
import { BugStatus, BugPriority } from '../../../core/models/bug.model';
import { ProjectsStore } from '../../projects/store/projects.store';
import { ActivityService } from '../../../core/services/activity.service';
import { UserLookupService } from '../../../core/services/user-lookup.service';

@Component({
  selector: 'app-bug-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, Drawer],
  templateUrl: './bug-create.html',
  styleUrl: './bug-create.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BugCreate {
  private readonly fb = inject(FormBuilder);
  public readonly store = inject(BugsStore);
  public readonly projectStore = inject(ProjectsStore);
  private readonly toast = inject(ToastService);
  private readonly authStore = inject(AuthStore);
  private readonly activity = inject(ActivityService);
  readonly userLookup = inject(UserLookupService);

  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  selectedLabelIds = signal<string[]>([]);

  bugForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required]],
    projectId: ['', [Validators.required]],
    status: ['open' as BugStatus, [Validators.required]],
    priority: ['medium' as BugPriority, [Validators.required]],
    assigneeId: [null],
    dueDate: [null]
  });

  readonly priorities: BugPriority[] = ['low', 'medium', 'high', 'critical'];
  readonly statuses: BugStatus[] = ['open', 'in-progress', 'testing', 'closed', 'blocked'];

  toggleLabel(labelId: string): void {
    this.selectedLabelIds.update(ids =>
      ids.includes(labelId) ? ids.filter(id => id !== labelId) : [...ids, labelId]
    );
  }

  onSubmit(): void {
    if (this.bugForm.valid) {
      const user = this.authStore.user();
      const newBug = {
        ...this.bugForm.value,
        id: crypto.randomUUID().substring(0, 8),
        reporterId: user?.id || 'anonymous',
        labelIds: this.selectedLabelIds(),
        attachmentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dueDate: this.bugForm.value.dueDate || null
      };

      this.store.addBug(newBug);
      this.activity.log({
        type: 'bug_created', entityId: newBug.id, entityTitle: newBug.title,
        userId: user?.id || 'me', userName: user?.fullName || 'You',
        description: `Created bug "${newBug.title}"`
      });
      this.store.setFilter({ status: 'all', priority: 'all', projectId: 'all', labelId: 'all' });
      this.toast.show('Bug report submitted successfully!', 'success');
      this.onClose();
      this.bugForm.reset({ status: 'open', priority: 'medium' });
      this.selectedLabelIds.set([]);
    } else {
      this.bugForm.markAllAsTouched();
      this.toast.show('Please fill in all required fields', 'error');
    }
  }

  onClose(): void {
    this.closed.emit();
  }
}
