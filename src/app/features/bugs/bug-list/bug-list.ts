import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BugsStore } from '../store/bugs.store';
import { LucideAngularModule, LucideIconData, Plus, Search, Filter, MoreVertical, Bug, Clock, CheckCircle2, AlertCircle, ShieldAlert, LayoutGrid, List, X, Tag, Trash2, ChevronDown } from 'lucide-angular';
import { ProjectsStore } from '../../projects/store/projects.store';
import { BugCreate } from '../bug-create/bug-create';
import { BugKanban } from '../bug-kanban/bug-kanban';
import { listAnimation, slideInAnimation, fadeAnimation } from '../../../core/animations/ui.animations';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { BugStatus, BugPriority } from '../../../core/models/bug.model';
import { UserLookupService } from '../../../core/services/user-lookup.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-bug-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, BugCreate, BugKanban, ConfirmDialog],
  templateUrl: './bug-list.html',
  styleUrl: './bug-list.scss',
  animations: [listAnimation, slideInAnimation, fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BugList {
  readonly store = inject(BugsStore);
  readonly projectStore = inject(ProjectsStore);
  readonly rbac = inject(RbacService);
  readonly userLookup = inject(UserLookupService);
  private readonly toast = inject(ToastService);

  isCreateDrawerOpen = false;
  viewMode: 'table' | 'kanban' = 'table';
  showFilterPanel = signal(false);
  showBulkMenu = signal(false);
  showBulkPriorityMenu = signal(false);
  showBulkDeleteConfirm = signal(false);

  // Icons
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Filter = Filter;
  readonly MoreVertical = MoreVertical;
  readonly BugIcon = Bug;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly ShieldAlert = ShieldAlert;
  readonly LayoutGrid = LayoutGrid;
  readonly List = List;
  readonly X = X;
  readonly Tag = Tag;
  readonly Trash = Trash2;
  readonly ChevronDown = ChevronDown;

  readonly statuses: (BugStatus | 'all')[] = ['all', 'open', 'in-progress', 'testing', 'closed', 'blocked'];
  readonly priorities: (BugPriority | 'all')[] = ['all', 'low', 'medium', 'high', 'critical'];

  allSelected = computed(() => {
    const filtered = this.store.filteredBugs();
    const selected = this.store.selectedIds();
    return filtered.length > 0 && filtered.every(b => selected.includes(b.id));
  });

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

  getProjectName(projectId: string): string {
    const project = this.projectStore.projects().find(p => p.id === projectId);
    return project ? project.name : 'Unknown';
  }

  getLabelName(labelId: string): string {
    const label = this.store.labels().find(l => l.id === labelId);
    return label ? label.name : labelId;
  }

  getLabelColor(labelId: string): string {
    const label = this.store.labels().find(l => l.id === labelId);
    return label ? label.color : '#888';
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.store.setFilter({ search: target.value });
  }

  onStatusFilter(status: BugStatus | 'all'): void {
    this.store.setFilter({ status });
  }

  onPriorityFilter(priority: BugPriority | 'all'): void {
    this.store.setFilter({ priority });
  }

  onProjectFilter(projectId: string): void {
    this.store.setFilter({ projectId });
  }

  onLabelFilter(labelId: string): void {
    this.store.setFilter({ labelId });
  }

  resetFilters(): void {
    this.store.resetFilters();
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'kanban' : 'table';
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.store.clearSelection();
    } else {
      this.store.selectAll(this.store.filteredBugs().map(b => b.id));
    }
  }

  toggleSelect(id: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.store.toggleSelect(id);
  }

  bulkSetStatus(status: BugStatus): void {
    const ids = this.store.selectedIds();
    if (!ids.length) return;
    this.store.bulkUpdateStatus({ids, status});
    this.showBulkMenu.set(false);
    this.toast.show(`Updated ${ids.length} issues to ${status}`, 'success');
  }

  bulkSetPriority(priority: BugPriority): void {
    const ids = this.store.selectedIds();
    if (!ids.length) return;
    this.store.bulkUpdatePriority(ids, priority);
    this.showBulkPriorityMenu.set(false);
    this.toast.show(`Updated priority for ${ids.length} issues`, 'success');
  }

  bulkDelete(): void {
    const ids = this.store.selectedIds();
    if (!ids.length) return;
    if (!this.rbac.can('bug:delete')) {
      this.toast.show('No permission to delete', 'error');
      return;
    }
    this.showBulkDeleteConfirm.set(true);
  }

  confirmBulkDelete(): void {
    const ids = this.store.selectedIds();
    this.store.bulkDelete(ids);
    this.showBulkDeleteConfirm.set(false);
    this.toast.show(`Deleted ${ids.length} issues`, 'error');
  }

  openCreateDrawer(): void { this.isCreateDrawerOpen = true; }
  closeCreateDrawer(): void { this.isCreateDrawerOpen = false; }
}
