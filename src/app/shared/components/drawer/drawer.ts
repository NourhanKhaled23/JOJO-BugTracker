import { Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[100] overflow-hidden">
        <div 
          [@backdrop]
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          (click)="onClose()"
          tabindex="0"
          (keydown.enter)="onClose()"
          (keydown.space)="onClose()"
        ></div>
        
        <div 
          [@drawer]
          class="absolute inset-y-0 right-0 max-w-full flex"
        >
          <div 
            class="relative w-screen max-w-md bg-bg-surface border-l border-border shadow-2xl flex flex-col"
          >
            <!-- Header -->
            <div class="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-elevated/30">
              <h3 class="text-xl font-bold text-text-primary">{{ title }}</h3>
              <button 
                (click)="onClose()"
                class="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              >
                <lucide-icon [name]="X" [size]="20"></lucide-icon>
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-border bg-bg-elevated/10">
              <ng-content select="[footer]"></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
    trigger('drawer', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class Drawer {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closed = new EventEmitter<void>();

  readonly X = X;

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onClose(): void {
    this.closed.emit();
  }
}
