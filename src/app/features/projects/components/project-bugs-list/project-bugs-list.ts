import { Component, inject, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectsStore } from '../../store/projects.store';
import { BugsStore } from '../../../bugs/store/bugs.store';
import { RbacService } from '../../../../core/services/rbac.service';
import { UserLookupService } from '../../../../core/services/user-lookup.service';
import { LucideAngularModule, Search, Plus } from 'lucide-angular';
import { Bug as BugModel } from '../../../../core/models/bug.model';

@Component({
  selector: 'app-project-bugs-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-6 animate-in slide-up duration-500">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold text-text-primary">Project Issues</h2>
        <div class="flex items-center gap-3">
          <div class="relative">
            <lucide-icon [name]="Search" [size]="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"></lucide-icon>
            <input type="text" placeholder="Search bugs..." class="pl-9 pr-4 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs focus:outline-none focus:border-accent w-48">
          </div>
          @if (rbac.can('bug:create')) {
          <button (click)="createBug.emit()" class="btn-primary py-1.5 px-3 text-xs flex items-center gap-2">
            <lucide-icon [name]="Plus" [size]="14"></lucide-icon>
            <span>New Bug</span>
          </button>
          }
        </div>
      </div>

      <div class="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-border bg-bg-elevated/50">
              <th class="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Issue</th>
              <th class="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Status</th>
              <th class="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Priority</th>
              <th class="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">Assignee</th>
              <th class="px-6 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Created</th>
            </tr>
          </thead>
          <tbody>
            @for (bug of projectBugs(); track bug.id) {
              <tr [routerLink]="['/bugs', bug.id]" class="border-b border-border/50 hover:bg-bg-hover transition-colors cursor-pointer group">
                <td class="px-6 py-4">
                  <div class="font-bold text-text-primary group-hover:text-accent transition-colors">{{ bug.title }}</div>
                  <div class="text-[10px] font-mono text-text-muted mt-0.5">#BT-{{ bug.id.toUpperCase() }}</div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/10 text-accent uppercase">{{ bug.status }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold border capitalize" [ngClass]="getPriorityColor(bug.priority)">
                    {{ bug.priority }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white"
                      [style.background-color]="userLookup.getColor(bug.assigneeId)">
                      {{ userLookup.getInitials(bug.assigneeId) }}
                    </div>
                    <span class="text-xs text-text-secondary">{{ userLookup.getName(bug.assigneeId) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-right text-[10px] text-text-muted font-bold">
                  {{ bug.createdAt | date:'MMM d' }}
                </td>
              </tr>
            }
            @if (projectBugs().length === 0) {
              <tr>
                <td colspan="5" class="px-6 py-12 text-center text-text-muted font-medium">
                  No bugs reported for this project yet.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectBugsList {
  readonly store = inject(ProjectsStore);
  readonly bugStore = inject(BugsStore);
  readonly rbac = inject(RbacService);
  readonly userLookup = inject(UserLookupService);

  readonly Search = Search;
  readonly Plus = Plus;

  readonly createBug = output<void>();

  readonly projectBugs = computed(() => {
    const project = this.store.selectedProject();
    if (!project) return [];
    return this.bugStore.bugs().filter((b: BugModel) => b.projectId === project.id);
  });

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'critical': return 'text-error bg-error/10';
      case 'high': return 'text-warning bg-warning/10';
      case 'medium': return 'text-info bg-info/10';
      default: return 'text-success bg-success/10';
    }
  }

  getBugStatusColor(status: string): string {
    switch (status) {
      case 'open': return 'text-error bg-error/10';
      case 'in-progress': return 'text-warning bg-warning/10';
      case 'testing': return 'text-info bg-info/10';
      case 'closed': return 'text-success bg-success/10';
      default: return 'text-text-muted bg-bg-elevated';
    }
  }
}
