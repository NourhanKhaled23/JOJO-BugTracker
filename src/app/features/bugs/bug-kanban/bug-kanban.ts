import { Component, inject, computed, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BugsStore } from '../store/bugs.store';
import { Bug, BugStatus } from '../../../core/models/bug.model';
import { LucideAngularModule, MoreHorizontal, Plus, User, Calendar } from 'lucide-angular';
import { ToastService } from '../../../core/services/toast.service';
import { UserLookupService } from '../../../core/services/user-lookup.service';
import { RbacService } from '../../../core/services/rbac.service';

@Component({
  selector: 'app-bug-kanban',
  standalone: true,
  imports: [CommonModule, RouterLink, DragDropModule, LucideAngularModule],
  templateUrl: './bug-kanban.html',
  styleUrl: './bug-kanban.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BugKanban {
  readonly store = inject(BugsStore);
  readonly userLookup = inject(UserLookupService);
  readonly rbac = inject(RbacService);
  @Output() addIssue = new EventEmitter<void>();

  readonly columns: { id: BugStatus, label: string, color: string }[] = [
    { id: 'open', label: 'Open', color: '#EF4444' },
    { id: 'in-progress', label: 'In Progress', color: '#3B82F6' },
    { id: 'testing', label: 'Testing', color: '#F59E0B' },
    { id: 'blocked', label: 'Blocked', color: '#6B7280' },
    { id: 'closed', label: 'Closed', color: '#10B981' }
  ];

  // Icons
  readonly Plus = Plus;
  readonly MoreHorizontal = MoreHorizontal;
  readonly User = User;
  readonly Calendar = Calendar;

  // Computed signals for each column — respect active filters
  openBugs = computed(() => this.store.filteredBugs().filter(b => b.status === 'open'));
  inProgressBugs = computed(() => this.store.filteredBugs().filter(b => b.status === 'in-progress'));
  testingBugs = computed(() => this.store.filteredBugs().filter(b => b.status === 'testing'));
  blockedBugs = computed(() => this.store.filteredBugs().filter(b => b.status === 'blocked'));
  closedBugs = computed(() => this.store.filteredBugs().filter(b => b.status === 'closed'));

  getBugsForColumn(status: BugStatus): Bug[] {
    switch (status) {
      case 'open': return this.openBugs();
      case 'in-progress': return this.inProgressBugs();
      case 'testing': return this.testingBugs();
      case 'blocked': return this.blockedBugs();
      case 'closed': return this.closedBugs();
      default: return [];
    }
  }

  private readonly toast = inject(ToastService);

  // ... (existing code)

  drop(event: CdkDragDrop<Bug[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within the same column
    } else {
      const bug = event.item.data as Bug;
      const newStatus = event.container.id as BugStatus;
      
      this.store.updateBug({
        ...bug,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      this.toast.show(`Issue #${bug.id.toUpperCase()} moved to ${newStatus.replace('-', ' ')}`, 'info');
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'critical': return 'bg-error/20 text-error';
      case 'high': return 'bg-warning/20 text-warning';
      case 'medium': return 'bg-info/20 text-info';
      default: return 'bg-success/20 text-success';
    }
  }
}

