import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Paperclip, Download, Trash2 } from 'lucide-angular';
import { BugsStore } from '../../store/bugs.store';
import { AuthStore } from '../../../../core/stores/auth.store';
import { ToastService } from '../../../../core/services/toast.service';
import { RbacService } from '../../../../core/services/rbac.service';
import { ActivityService } from '../../../../core/services/activity.service';
import { AttachmentService } from '../../../../core/services/attachment.service';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
<section class="bg-bg-surface border border-border rounded-2xl p-8 shadow-sm">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">
      Attachments
      @if (bugAttachments().length > 0) {
      <span class="ml-2 text-accent">{{ bugAttachments().length }}</span>
      }
    </h3>
    @if (rbac.can('bug:edit')) {
    <label for="attachment-upload"
      class="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-xl text-sm font-bold hover:bg-accent hover:text-white transition-all cursor-pointer"
      [class.opacity-50]="isUploadingAttachment()"
      [class.pointer-events-none]="isUploadingAttachment()">
      <lucide-icon [name]="Paperclip" [size]="16"></lucide-icon>
      {{ isUploadingAttachment() ? 'Uploading...' : 'Attach File' }}
      <input id="attachment-upload" type="file" class="hidden" accept="image/*,.pdf,.zip,.txt" (change)="onAttachFile($event)">
    </label>
    }
  </div>

  @if (bugAttachments().length === 0) {
  <div class="text-center py-12 text-text-muted">
    <lucide-icon [name]="Paperclip" [size]="40" class="mx-auto mb-3 opacity-30"></lucide-icon>
    <p class="text-sm font-medium">No attachments yet.</p>
    <p class="text-xs mt-1">Attach images, PDFs, ZIPs or text files (max 5MB each).</p>
  </div>
  }

  @if (bugAttachments().length > 0) {
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    @for (att of bugAttachments(); track att.id) {
      <div class="flex items-center gap-3 p-4 bg-bg-elevated border border-border rounded-xl group hover:border-accent/40 transition-all">

      <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-bg-hover flex items-center justify-center">
        @if (attachmentService.isImage(att.fileType)) {
        <img [src]="att.dataUrl" [alt]="att.fileName" class="w-full h-full object-cover">
        } @else {
        <lucide-icon [name]="Paperclip" [size]="22" class="text-text-muted"></lucide-icon>
        }
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-bold text-text-primary truncate">{{ att.fileName }}</p>
        <p class="text-xs text-text-muted mt-0.5">
          {{ attachmentService.formatSize(att.fileSize) }} · {{ att.uploadedAt | date:'MMM d' }}
        </p>
      </div>

      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button (click)="attachmentService.download(att)"
          class="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-accent transition-colors" title="Download">
          <lucide-icon [name]="Download" [size]="14"></lucide-icon>
        </button>
        @if (rbac.can('bug:edit')) {
        <button (click)="removeAttachment(att.id)"
          class="p-1.5 rounded-lg hover:bg-bg-hover text-text-muted hover:text-error transition-colors" title="Remove">
          <lucide-icon [name]="Trash" [size]="14"></lucide-icon>
        </button>
        }
      </div>
    </div>
    }
  </div>
  }
</section>
  `
})
export class AttachmentList {
  readonly store = inject(BugsStore);
  readonly authStore = inject(AuthStore);
  readonly toast = inject(ToastService);
  readonly rbac = inject(RbacService);
  readonly activity = inject(ActivityService);
  readonly attachmentService = inject(AttachmentService);

  readonly Paperclip = Paperclip;
  readonly Download = Download;
  readonly Trash = Trash2;

  isUploadingAttachment = signal(false);

  bugAttachments = computed(() => {
    const bug = this.store.selectedBug();
    if (!bug) return [];
    return this.attachmentService.getForBug(bug.id);
  });

  async onAttachFile(event: Event): Promise<void> {
    const bug = this.store.selectedBug();
    if (!bug) return;
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.isUploadingAttachment.set(true);
    const user = this.authStore.user();
    const { attachment, error } = await this.attachmentService.addFile(bug.id, file, user?.fullName || 'You');

    if (error) {
      this.toast.show(error, 'error');
    } else if (attachment) {
      const updated = { ...bug, attachmentIds: [...bug.attachmentIds, attachment.id], updatedAt: new Date().toISOString() };
      this.store.updateBug(updated);
      this.store.setSelectedBug(updated);
      this.activity.log({
        type: 'attachment_added', entityId: bug.id, entityTitle: bug.title,
        userId: user?.id || 'me', userName: user?.fullName || 'You',
        description: `Attached file "${attachment.fileName}"`
      });
      this.toast.show(`"${attachment.fileName}" attached`, 'success');
    }
    this.isUploadingAttachment.set(false);
    (event.target as HTMLInputElement).value = '';
  }

  removeAttachment(attachmentId: string): void {
    const bug = this.store.selectedBug();
    if (!bug) return;
    this.attachmentService.remove(attachmentId);
    const updated = { ...bug, attachmentIds: bug.attachmentIds.filter(id => id !== attachmentId) };
    this.store.updateBug(updated);
    this.store.setSelectedBug(updated);
    this.toast.show('Attachment removed', 'info');
  }
}
