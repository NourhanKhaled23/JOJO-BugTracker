import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectsStore } from '../store/projects.store';
import { BugsStore } from '../../bugs/store/bugs.store';
import { LucideAngularModule, LucideIconData, Plus, LayoutGrid, List, Search, Filter, MoreVertical, ExternalLink, Folder, Smartphone, Bug, Server } from 'lucide-angular';
import { ProjectCreate } from '../project-create/project-create';
import { listAnimation, slideInAnimation } from '../../../core/animations/ui.animations';
import { RbacService } from '../../../core/services/rbac.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ProjectCreate],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss',
  animations: [listAnimation, slideInAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProjectList {
  readonly store = inject(ProjectsStore);
  readonly bugStore = inject(BugsStore);
  readonly rbac = inject(RbacService);

  isCreateModalOpen = false;
  
  // Icons
  readonly Plus = Plus;
  readonly LayoutGrid = LayoutGrid;
  readonly List = List;
  readonly Search = Search;
  readonly Filter = Filter;
  readonly MoreVertical = MoreVertical;
  readonly ExternalLink = ExternalLink;
  readonly FolderOff = Folder;

  iconMap: Record<string, LucideIconData> = {
    'smartphone': Smartphone,
    'server': Server,
    'folder': Folder,
    'bug': Bug
  };

  getBugCount(projectId: string): number {
    return this.bugStore.bugs().filter(b => b.projectId === projectId).length;
  }

  toggleViewMode(): void {
    const current = this.store.viewMode();
    this.store.setViewMode(current === 'grid' ? 'list' : 'grid');
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }
}
