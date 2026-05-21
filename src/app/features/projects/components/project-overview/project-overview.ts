import { Component, inject, computed, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsStore } from '../../store/projects.store';
import { BugsStore } from '../../../bugs/store/bugs.store';
import { LucideAngularModule, Bug, CheckCircle, Clock, Users, Settings, Lock, ExternalLink } from 'lucide-angular';
import { ProjectActivity } from '../project-activity/project-activity';
import { Bug as BugModel } from '../../../../core/models/bug.model';

@Component({
  selector: 'app-project-overview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ProjectActivity],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="glass rounded-2xl p-6 hover:lift animate-scale" style="animation-delay: 100ms">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center shadow-inner">
              <lucide-icon [name]="Bug" [size]="24"></lucide-icon>
            </div>
            <span class="px-2 py-1 rounded-full text-[10px] font-black bg-error/10 text-error uppercase tracking-wider">Open</span>
          </div>
          <div class="text-4xl font-display font-black text-text-primary tracking-tighter">{{ projectOpenBugs() }}</div>
          <div class="text-sm font-bold text-text-muted mt-1">Open Issues</div>
        </div>

        <div class="glass rounded-2xl p-6 hover:lift animate-scale" style="animation-delay: 150ms">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center shadow-inner">
              <lucide-icon [name]="CheckCircle" [size]="24"></lucide-icon>
            </div>
            <span class="px-2 py-1 rounded-full text-[10px] font-black bg-success/10 text-success uppercase tracking-wider">Closed</span>
          </div>
          <div class="text-4xl font-display font-black text-text-primary tracking-tighter">{{ projectClosedBugs() }}</div>
          <div class="text-sm font-bold text-text-muted mt-1">Resolved</div>
        </div>

        <div class="glass rounded-2xl p-6 hover:lift animate-scale" style="animation-delay: 200ms">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-info/10 text-info flex items-center justify-center shadow-inner">
              <lucide-icon [name]="Clock" [size]="24"></lucide-icon>
            </div>
            <span class="px-2 py-1 rounded-full text-[10px] font-black bg-info/10 text-info uppercase tracking-wider">Total</span>
          </div>
          <div class="text-4xl font-display font-black text-text-primary tracking-tighter">{{ projectAllBugs().length }}</div>
          <div class="text-sm font-bold text-text-muted mt-1">All Issues</div>
        </div>

        <div class="glass rounded-2xl p-6 hover:lift animate-scale" style="animation-delay: 250ms">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-inner">
              <lucide-icon [name]="Users" [size]="24"></lucide-icon>
            </div>
            <span class="px-2 py-1 rounded-full text-[10px] font-black bg-accent/10 text-accent uppercase tracking-wider">Team</span>
          </div>
          <div class="text-4xl font-display font-black text-text-primary tracking-tighter">{{ project().memberIds.length }}</div>
          <div class="text-sm font-bold text-text-muted mt-1">Members</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <section class="bg-bg-surface border border-border rounded-2xl p-6">
            <h2 class="text-lg font-bold text-text-primary mb-4">Project Description</h2>
            <p class="text-text-secondary leading-relaxed">
              {{ project().description }}
            </p>
          </section>

          <app-project-activity />
        </div>

        <div class="space-y-8">
          <section class="bg-bg-surface border border-border rounded-2xl p-6">
            <h2 class="text-lg font-bold text-text-primary mb-4">Quick Info</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-muted">Owner</span>
                <span class="text-text-primary font-medium">Admin User</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-muted">Visibility</span>
                <span class="flex items-center gap-1.5 text-text-primary font-medium">
                  <lucide-icon [name]="Lock" [size]="14"></lucide-icon>
                  Private
                </span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-text-muted">Repository</span>
                <a href="#" class="text-accent hover:underline flex items-center gap-1.5 font-medium">
                  GitHub
                  <lucide-icon [name]="ExternalLink" [size]="14"></lucide-icon>
                </a>
              </div>
            </div>
          </section>

          <section class="bg-bg-surface border border-border rounded-2xl p-6 text-center">
            <div class="w-16 h-16 rounded-full bg-bg-elevated mx-auto mb-4 flex items-center justify-center text-text-muted">
              <lucide-icon [name]="Settings" [size]="32"></lucide-icon>
            </div>
            <h3 class="font-bold text-text-primary">Project Settings</h3>
            <p class="text-xs text-text-muted mt-1 mb-4">Manage members, notifications and archive project.</p>
            <button (click)="goToSettings()" class="w-full py-2 bg-bg-elevated hover:bg-bg-hover text-text-primary rounded-lg text-xs font-bold transition-colors">
              Configure
            </button>
          </section>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectOverview {
  private readonly store = inject(ProjectsStore);
  private readonly bugStore = inject(BugsStore);

  readonly Bug = Bug;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly Users = Users;
  readonly Settings = Settings;
  readonly Lock = Lock;
  readonly ExternalLink = ExternalLink;

  readonly navigateSettings = output<void>();

  readonly project = computed(() => this.store.selectedProject()!);

  readonly projectBugs = computed(() => {
    const project = this.store.selectedProject();
    if (!project) return [];
    return this.bugStore.bugs().filter((b: BugModel) => b.projectId === project.id);
  });

  readonly projectAllBugs = computed(() => this.projectBugs());
  readonly projectClosedBugs = computed(() => this.projectBugs().filter(b => b.status === 'closed').length);
  readonly projectOpenBugs = computed(() => this.projectBugs().filter(b => b.status === 'open').length);

  goToSettings(): void {
    this.navigateSettings.emit();
  }
}
