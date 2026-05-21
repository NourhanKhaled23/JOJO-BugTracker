import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectsStore } from '../../store/projects.store';
import { ActivityService } from '../../../../core/services/activity.service';
import { LucideAngularModule, Clock } from 'lucide-angular';

@Component({
  selector: 'app-project-activity',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <section class="glass rounded-2xl p-6">
      <h2 class="text-xl font-display font-black text-text-primary mb-6 tracking-tight">Recent Activity</h2>
      <div class="space-y-4">
        @if (activityEntries().length > 0) {
          @for (entry of activityEntries(); track entry.id) {
            <div class="flex gap-4 group">
              <div class="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                {{ entry.userName.substring(0,2).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-text-primary leading-tight">
                  <span class="font-bold">{{ entry.userName }}</span>
                  <span class="text-text-secondary"> {{ entry.description }}</span>
                </p>
                <p class="text-[10px] text-text-muted mt-1 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <lucide-icon [name]="Clock" [size]="10"></lucide-icon>
                  {{ entry.timestamp | date:'MMM d, h:mm a' }}
                </p>
              </div>
            </div>
          }
        } @else {
          <p class="text-sm text-text-muted text-center py-6">No activity yet for this project.</p>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectActivity {
  private readonly store = inject(ProjectsStore);
  private readonly activityService = inject(ActivityService);

  readonly Clock = Clock;

  readonly activityEntries = computed(() => {
    const project = this.store.selectedProject();
    if (!project) return [];
    return this.activityService.getForEntity(project.id);
  });
}
