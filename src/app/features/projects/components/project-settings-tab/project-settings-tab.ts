import { Component, inject, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsStore } from '../../store/projects.store';
import { RbacService } from '../../../../core/services/rbac.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ActivityService } from '../../../../core/services/activity.service';
import { AuthStore } from '../../../auth/store/auth.store';
import { Project } from '../../../../core/models/project.model';

@Component({
  selector: 'app-project-settings-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl animate-in slide-up duration-500">
      <div class="bg-bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-border bg-bg-elevated/30">
          <h2 class="text-lg font-bold text-text-primary">Project Settings</h2>
        </div>
        <div class="p-6 space-y-8">
          <div class="space-y-2">
            <label for="settings-project-name" class="text-xs font-bold text-text-muted uppercase tracking-widest">Project Name</label>
            <input id="settings-project-name" type="text" [value]="editName()" (input)="editName.set($any($event.target).value)"
              class="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
          </div>

          <div class="space-y-2">
            <label for="settings-project-desc" class="text-xs font-bold text-text-muted uppercase tracking-widest">Description</label>
            <textarea id="settings-project-desc" rows="4" [value]="editDescription()" (input)="editDescription.set($any($event.target).value)"
              class="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="settings-project-type" class="text-xs font-bold text-text-muted uppercase tracking-widest">Project Type</label>
              <select id="settings-project-type" [value]="editType()" (change)="editType.set($any($event.target).value)"
                class="w-full bg-bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent">
                <option value="web">Web Application</option>
                <option value="mobile">Mobile App</option>
                <option value="grad">Backend Service</option>
                <option value="team">Team Project</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="space-y-2">
              <label for="settings-project-color" class="text-xs font-bold text-text-muted uppercase tracking-widest">Project Color</label>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl border-4 border-bg-elevated" [style.backgroundColor]="editColor()"></div>
                <input id="settings-project-color" type="text" [value]="editColor()" (input)="editColor.set($any($event.target).value)"
                  class="flex-1 bg-bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm font-mono">
              </div>
            </div>
          </div>

          <div class="pt-6 border-t border-border flex items-center justify-between">
            <div class="text-xs text-text-muted font-medium">Last updated {{ project.lastActivity | date:'shortTime' }} today</div>
            <div class="flex gap-3">
              <button (click)="discardChanges()" class="px-6 py-2.5 rounded-xl border border-border font-bold text-sm hover:bg-bg-hover transition-colors">Discard</button>
              <button (click)="saveProjectSettings()" class="px-6 py-2.5 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:bg-accent-bright transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-error/5 border border-error/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 class="text-error font-bold">Archive Project</h3>
          <p class="text-xs text-text-muted mt-1">This will hide the project and all its issues from active views.</p>
        </div>
        <button (click)="toggleArchive()" class="px-6 py-2.5 border border-error/20 text-error hover:bg-error hover:text-white rounded-xl font-bold text-sm transition-all">
          {{ project.isArchived ? 'Restore' : 'Archive' }}
        </button>
      </div>

      @if (rbac.can('project:delete')) {
      <div class="mt-4 bg-error/5 border border-error/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 class="text-error font-bold">Delete Project</h3>
          <p class="text-xs text-text-muted mt-1">Permanently delete this project and all its data. This cannot be undone.</p>
        </div>
        <button (click)="deleteProject()" class="px-6 py-2.5 bg-error text-white rounded-xl font-bold text-sm transition-all hover:opacity-90">Delete</button>
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectSettingsTab {
  readonly store = inject(ProjectsStore);
  readonly rbac = inject(RbacService);
  private readonly toast = inject(ToastService);
  private readonly activity = inject(ActivityService);
  private readonly authStore = inject(AuthStore);
  readonly deleted = output<void>();
  readonly settingsSaved = output<void>();

  editName = signal('');
  editDescription = signal('');
  editType = signal<string>('web');
  editColor = signal('');

  get project(): Project {
    return this.store.selectedProject()!;
  }

  constructor() {
    const project = this.store.selectedProject();
    if (project) {
      this.editName.set(project.name);
      this.editDescription.set(project.description);
      this.editType.set(project.type);
      this.editColor.set(project.color);
    }
  }

  discardChanges(): void {
    const project = this.store.selectedProject();
    if (!project) return;
    this.editName.set(project.name);
    this.editDescription.set(project.description);
    this.editType.set(project.type);
    this.editColor.set(project.color);
  }

  saveProjectSettings(): void {
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
    this.settingsSaved.emit();
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

  private archiveProject(): void {
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

  private unarchiveProject(): void {
    const project = this.store.selectedProject();
    if (!project) return;
    this.store.unarchiveProject(project.id);
    this.toast.show('Project restored', 'success');
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
    this.toast.show('Project deleted', 'error');
    this.deleted.emit();
  }
}
