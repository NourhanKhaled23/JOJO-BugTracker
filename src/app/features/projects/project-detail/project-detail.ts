import { Component, inject, signal, ChangeDetectionStrategy, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router, Params } from '@angular/router';
import { ProjectsStore } from '../store/projects.store';
import { BugsStore } from '../../bugs/store/bugs.store';
import { LucideAngularModule, ChevronLeft, Calendar, Users, Bug, Settings, BarChart3, Clock, CheckCircle, User, Plus, Lock, ExternalLink, Mail, Shield, ShieldCheck, MoreVertical, Trash, Edit2, Search, Archive, ArchiveRestore, Smartphone, Server, Folder } from 'lucide-angular';
import { fadeAnimation, slideInAnimation, listAnimation } from '../../../core/animations/ui.animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/services/toast.service';
import { RbacService } from '../../../core/services/rbac.service';
import { ActivityService } from '../../../core/services/activity.service';
import { AuthStore } from '../../auth/store/auth.store';
import { UserLookupService } from '../../../core/services/user-lookup.service';
import { BugCreate } from '../../bugs/bug-create/bug-create';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { Bug as BugModel } from '../../../core/models/bug.model';
import { Project } from '../../../core/models/project.model';
import { LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, BugCreate, ConfirmDialog],
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
  readonly bugStore = inject(BugsStore);
  private readonly toast = inject(ToastService);
  readonly rbac = inject(RbacService);
  private readonly activity = inject(ActivityService);
  private readonly authStore = inject(AuthStore);
  readonly userLookup = inject(UserLookupService);

  isCreateBugOpen = false;
  showDeleteProjectConfirm = signal(false);

  openCreateBug(): void { this.isCreateBugOpen = true; }
  closeCreateBug(): void { this.isCreateBugOpen = false; }
  
  activeTab = signal<'overview' | 'bugs' | 'members' | 'settings'>('overview');

  editName = signal('');
  editDescription = signal('');
  editType = signal<string>('web');
  editColor = signal('');

  readonly ChevronLeft = ChevronLeft;
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly Bug = Bug;
  readonly Settings = Settings;
  readonly BarChart3 = BarChart3;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly User = User;
  readonly Plus = Plus;
  readonly Lock = Lock;
  readonly ExternalLink = ExternalLink;
  readonly Mail = Mail;
  readonly Shield = Shield;
  readonly ShieldCheck = ShieldCheck;
  readonly MoreVertical = MoreVertical;
  readonly Trash = Trash;
  readonly Edit2 = Edit2;
  readonly Search = Search;
  readonly Archive = Archive;
  readonly ArchiveRestore = ArchiveRestore;

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

  projectBugs = computed(() => {
    const project = this.store.selectedProject();
    if (!project) return [];
    return this.bugStore.bugs().filter((b: BugModel) => b.projectId === project.id);
  });

  projectClosedBugs = computed(() => this.projectBugs().filter(b => b.status === 'closed').length);
  projectOpenBugs = computed(() => this.projectBugs().filter(b => b.status === 'open').length);

  projectActivity = computed(() => {
    const project = this.store.selectedProject();
    if (!project) return [];
    return this.activity.getForEntity(project.id);
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
            this.editName.set(project.name);
            this.editDescription.set(project.description);
            this.editType.set(project.type);
            this.editColor.set(project.color);
          }
        }
      });
  }

  setTab(tab: 'overview' | 'bugs' | 'members' | 'settings'): void {
    this.activeTab.set(tab);
  }

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

  archiveProject(): void {
    const project = this.store.selectedProject();
    if (!project) return;
    this.store.archiveProject(project.id);
    this.activity.log({
      type: 'project_archived',
      entityId: project.id,
      entityTitle: project.name,
      userId: this.authStore.user()?.id || 'me',
      userName: this.authStore.user()?.fullName || 'You',
      description: `Archived project "${project.name}"`
    });
    this.toast.show('Project archived', 'info');
  }

  unarchiveProject(): void {
    const project = this.store.selectedProject();
    if (!project) return;
    this.store.unarchiveProject(project.id);
    this.toast.show('Project restored', 'success');
  }

  confirmDeleteProject(): void {
    this.showDeleteProjectConfirm.set(true);
  }

  confirmDelete(): void {
    this.showDeleteProjectConfirm.set(true);
  }

  deleteProject(): void {
    const project = this.store.selectedProject();
    if (!project) return;
    this.store.deleteProject(project.id);
    this.activity.log({
      type: 'project_deleted',
      entityId: project.id,
      entityTitle: project.name,
      userId: this.authStore.user()?.id || 'me',
      userName: this.authStore.user()?.fullName || 'You',
      description: `Deleted project "${project.name}"`
    });
    this.showDeleteProjectConfirm.set(false);
    this.toast.show('Project deleted', 'error');
    this.router.navigate(['/projects']);
  }

  loadProject(id: string): void {
    const project = this.store.projects().find(p => p.id === id);
    if (project) {
      this.store.setSelectedProject(project);
      this.editName.set(project.name);
      this.editDescription.set(project.description);
      this.editType.set(project.type);
      this.editColor.set(project.color);
    }
  }

  saveProjectSettings(): void {
    this.saveChanges();
  }

  toggleArchive(): void {
    const project = this.store.selectedProject();
    if (!project) return;
    if (project.isArchived) {
      this.unarchiveProject();
    } else {
      this.archiveProject();
    }
  }

  saveChanges(): void {
    const project = this.store.selectedProject();
    if (!project) return;
    this.store.updateProject({
      ...project,
      name: this.editName(),
      description: this.editDescription(),
      type: this.editType() as Project['type'],
      color: this.editColor()
    });
    this.toast.show('Project updated', 'success');
    this.activeTab.set('overview');
  }
}
