import { Component, inject, signal, ChangeDetectionStrategy, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router, Params } from '@angular/router';
import { ProjectsStore } from '../store/projects.store';
import { RbacService } from '../../../core/services/rbac.service';
import { UserLookupService } from '../../../core/services/user-lookup.service';
import { LucideAngularModule, ChevronLeft, Users, Bug, Smartphone, Server, Folder, Shield } from 'lucide-angular';
import { LucideIconData } from 'lucide-angular';
import { fadeAnimation, slideInAnimation, listAnimation } from '../../../core/animations/ui.animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BugCreate } from '../../bugs/bug-create/bug-create';
import { ProjectOverview } from '../components/project-overview/project-overview';
import { ProjectBugsList } from '../components/project-bugs-list/project-bugs-list';
import { ProjectSettingsTab } from '../components/project-settings-tab/project-settings-tab';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, BugCreate, ProjectOverview, ProjectBugsList, ProjectSettingsTab],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss',
  animations: [fadeAnimation, slideInAnimation, listAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly store = inject(ProjectsStore);
  readonly rbac = inject(RbacService);
  readonly userLookup = inject(UserLookupService);

  isCreateBugOpen = false;

  activeTab = signal<'overview' | 'bugs' | 'members' | 'settings'>('overview');

  readonly ChevronLeft = ChevronLeft;
  readonly Users = Users;
  readonly Bug = Bug;
  readonly Shield = Shield;

  iconMap: Record<string, LucideIconData> = {
    'smartphone': Smartphone,
    'server': Server,
    'folder': Folder,
    'bug': Bug
  };

  projectMembers = computed(() => {
    const project = this.store.selectedProject();
    if (!project) return this.userLookup.members();
    return this.userLookup.members().filter(m => project.memberIds.includes(m.id));
  });

  constructor() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params: Params) => {
        const id = params['id'];
        if (id) {
          const project = this.store.projects().find(p => p.id === id);
          if (project) {
            this.store.setSelectedProject(project);
          }
        }
      });
  }

  setTab(tab: 'overview' | 'bugs' | 'members' | 'settings'): void {
    this.activeTab.set(tab);
  }

  openCreateBug(): void { this.isCreateBugOpen = true; }
  closeCreateBug(): void { this.isCreateBugOpen = false; }

  onProjectDeleted(): void {
    this.router.navigate(['/projects']);
  }
}
