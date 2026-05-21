import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Tag, Plus, Trash2, Edit2, Check, X } from 'lucide-angular';
import { BugsStore } from '../bugs/store/bugs.store';
import { ToastService } from '../../core/services/toast.service';
import { RbacService } from '../../core/services/rbac.service';
import { BugLabel } from '../../core/models/bug.model';
import { listAnimation, slideInAnimation } from '../../core/animations/ui.animations';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

const PRESET_COLORS = ['#7C3AED','#10B981','#F59E0B','#EF4444','#EC4899','#6366F1','#0EA5E9','#14B8A6','#F97316','#84CC16'];

@Component({
  selector: 'app-labels',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmDialog],
  templateUrl: './labels.html',
  animations: [listAnimation, slideInAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Labels {
  readonly store = inject(BugsStore);
  readonly toast = inject(ToastService);
  readonly rbac = inject(RbacService);

  readonly Plus = Plus;
  readonly Trash = Trash2;
  readonly Edit2 = Edit2;
  readonly Check = Check;
  readonly X = X;
  readonly Tag = Tag;

  readonly presetColors = PRESET_COLORS;

  showCreate = signal(false);
  newName = signal('');
  newColor = signal(PRESET_COLORS[0]);
  editingId = signal<string | null>(null);
  editName = signal('');
  editColor = signal('');
  deletingLabelId = signal<string | null>(null);

  getBugCount(labelId: string): number {
    return this.store.bugs().filter(b => b.labelIds.includes(labelId)).length;
  }

  createLabel(): void {
    if (!this.newName().trim()) return;
    const label: BugLabel = {
      id: crypto.randomUUID(),
      name: this.newName().trim().toLowerCase(),
      color: this.newColor()
    };
    this.store.addLabel(label);
    this.newName.set('');
    this.showCreate.set(false);
    this.toast.show('Label created', 'success');
  }

  startEdit(label: BugLabel): void {
    this.editingId.set(label.id);
    this.editName.set(label.name);
    this.editColor.set(label.color);
  }

  saveEdit(id: string): void {
    if (!this.editName().trim()) return;
    this.store.updateLabel({ id, name: this.editName().trim(), color: this.editColor() });
    this.editingId.set(null);
    this.toast.show('Label updated', 'success');
  }

  deleteLabel(id: string): void {
    this.deletingLabelId.set(id);
  }

  confirmDeleteLabel(): void {
    const id = this.deletingLabelId();
    if (!id) return;
    this.store.deleteLabel(id);
    this.deletingLabelId.set(null);
    this.toast.show('Label deleted', 'info');
  }
}
