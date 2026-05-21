import { Component, EventEmitter, Input, Output, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertTriangle, Trash2, Archive } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdrop', [
      transition(':enter', [style({ opacity: 0 }), animate('150ms ease', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease', style({ opacity: 0 }))]),
    ]),
    trigger('dialog', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(8px)' }),
        animate('200ms cubic-bezier(0.34,1.56,0.64,1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
  template: `
@if (isOpen) {
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
    <div [@backdrop] class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="onCancel()" tabindex="0" (keydown.enter)="onCancel()" (keydown.space)="onCancel()"></div>
    <div [@dialog] class="relative bg-bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm p-8 z-10">

      <!-- Icon -->
      <div class="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
        [class.bg-error/10]="variant === 'danger'"
        [class.bg-warning/10]="variant === 'warning'"
        [class.bg-info/10]="variant === 'info'">
        <lucide-icon [name]="variant === 'danger' ? Trash : AlertTriangle" [size]="28"
          [class.text-error]="variant === 'danger'"
          [class.text-warning]="variant === 'warning'"
          [class.text-info]="variant === 'info'">
        </lucide-icon>
      </div>

      <!-- Content -->
      <div class="text-center mb-8">
        <h2 class="text-xl font-bold text-text-primary mb-2">{{ title }}</h2>
        <p class="text-sm text-text-secondary leading-relaxed">{{ message }}</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button (click)="onCancel()"
          class="flex-1 py-3 rounded-xl border border-border font-bold text-sm text-text-secondary hover:bg-bg-hover transition-colors">
          {{ cancelLabel }}
        </button>
        <button (click)="onConfirm()"
          class="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all"
          [class.bg-error]="variant === 'danger'"
          [class.hover:opacity-90]="variant === 'danger'"
          [class.bg-warning]="variant === 'warning'"
          [class.bg-info]="variant === 'info'">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
}
  `
})
export class ConfirmDialog {
  @Input() isOpen = false;
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'info' = 'danger';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  readonly Trash = Trash2;
  readonly AlertTriangle = AlertTriangle;
  readonly Archive = Archive;

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.cancelled.emit();
    }
  }

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}
