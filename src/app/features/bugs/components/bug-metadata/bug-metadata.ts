import { Component, inject, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User, Calendar, Clock } from 'lucide-angular';
import { Bug } from '../../../../core/models/bug.model';
import { UserLookupService } from '../../../../core/services/user-lookup.service';

@Component({
  selector: 'app-bug-metadata',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm">
  <h3 class="text-xs font-bold text-text-muted uppercase tracking-[0.2em] mb-4">Details</h3>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-text-muted">
        <lucide-icon [name]="User" [size]="16"></lucide-icon>
        <span class="text-xs font-medium">Assignee</span>
      </div>
      <div class="flex items-center gap-2">
        @if (bug.assigneeId) {
        <div class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
          [style.background-color]="userLookup.getColor(bug.assigneeId)">
          {{ userLookup.getInitials(bug.assigneeId) }}
        </div>
        }
        <span class="text-xs font-bold text-text-primary">{{ userLookup.getName(bug.assigneeId) }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-text-muted">
        <lucide-icon [name]="User" [size]="16"></lucide-icon>
        <span class="text-xs font-medium">Reporter</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
          [style.background-color]="userLookup.getColor(bug.reporterId)">
          {{ userLookup.getInitials(bug.reporterId) }}
        </div>
        <span class="text-xs font-bold text-text-primary">{{ userLookup.getName(bug.reporterId) }}</span>
      </div>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-text-muted">
        <lucide-icon [name]="Calendar" [size]="16"></lucide-icon>
        <span class="text-xs font-medium">Created</span>
      </div>
      <span class="text-xs font-bold text-text-primary">{{ bug.createdAt | date:'MMM d, yyyy' }}</span>
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-text-muted">
        <lucide-icon [name]="Clock" [size]="16"></lucide-icon>
        <span class="text-xs font-medium">Updated</span>
      </div>
      <span class="text-xs font-bold text-text-primary">{{ bug.updatedAt | date:'MMM d, h:mm a' }}</span>
    </div>
    @if (bug.dueDate) {
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-text-muted">
        <lucide-icon [name]="Calendar" [size]="16"></lucide-icon>
        <span class="text-xs font-medium">Due Date</span>
      </div>
      <span class="text-xs font-bold" [class.text-error]="bug.dueDate < today" [class.text-text-primary]="bug.dueDate >= today">
        {{ bug.dueDate | date:'MMM d, yyyy' }}
      </span>
    </div>
    }
  </div>
</section>
  `
})
export class BugMetadata {
  readonly userLookup = inject(UserLookupService);

  readonly User = User;
  readonly Calendar = Calendar;
  readonly Clock = Clock;

  @Input({ required: true }) bug!: Bug;

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }
}
