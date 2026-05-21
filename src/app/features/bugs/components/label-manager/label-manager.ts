import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Tag, X } from 'lucide-angular';
import { BugsStore } from '../../store/bugs.store';
import { RbacService } from '../../../../core/services/rbac.service';

@Component({
  selector: 'app-label-manager',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="bg-bg-surface border border-border rounded-2xl p-6 shadow-sm">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">Labels</h3>
    @if (rbac.can('bug:edit')) {
    <button (click)="showLabelPicker.set(!showLabelPicker())"
      class="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-accent transition-colors">
      <lucide-icon [name]="Tag" [size]="16"></lucide-icon>
    </button>
    }
  </div>

  <div class="flex flex-wrap gap-2 mb-3">
    @for (label of bugLabels(); track label.id) {
    <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
      [style.background-color]="label.color">
      {{ label.name }}
      @if (rbac.can('bug:edit')) {
      <button (click)="removeLabel(label.id)" class="hover:opacity-70 transition-opacity">
        <lucide-icon [name]="X" [size]="12"></lucide-icon>
      </button>
      }
    </span>
    }
    @if (bugLabels().length === 0) {
    <span class="text-xs text-text-muted">No labels</span>
    }
  </div>

  @if (showLabelPicker() && availableLabels().length > 0) {
  <div class="border border-border rounded-xl overflow-hidden">
    @for (label of availableLabels(); track label.id) {
    <button (click)="addLabel(label.id)"
      class="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-hover transition-colors text-sm">
      <span class="w-3 h-3 rounded-full flex-shrink-0" [style.background-color]="label.color"></span>
      {{ label.name }}
    </button>
    }
  </div>
  }
</section>
  `
})
export class LabelManager {
  readonly store = inject(BugsStore);
  readonly rbac = inject(RbacService);

  readonly Tag = Tag;
  readonly X = X;

  showLabelPicker = signal(false);

  bugLabels = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.store.labels().filter(l => bug.labelIds.includes(l.id));
  });

  availableLabels = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return this.store.labels();
    return this.store.labels().filter(l => !bug.labelIds.includes(l.id));
  });

  addLabel(labelId: string): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const updated = { ...bug, labelIds: [...bug.labelIds, labelId] };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
    this.showLabelPicker.set(false);
  }

  removeLabel(labelId: string): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const updated = { ...bug, labelIds: bug.labelIds.filter(id => id !== labelId) };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
  }
}
