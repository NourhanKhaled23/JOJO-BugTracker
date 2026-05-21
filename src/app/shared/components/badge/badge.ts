import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Badge {
  @Input() variant: 'success' | 'error' | 'warning' | 'info' | 'default' = 'default';
  @Input() size: 'sm' | 'md' = 'md';

  get variantClasses(): string {
    const base = 'inline-flex items-center rounded-full font-bold uppercase border ';
    const sizeClass = this.size === 'sm' ? 'px-2 py-0.5 text-[10px] ' : 'px-2.5 py-1 text-[11px] ';
    
    switch (this.variant) {
      case 'success':
        return base + sizeClass + 'bg-success/10 text-success border-success/20';
      case 'error':
        return base + sizeClass + 'bg-error/10 text-error border-error/20';
      case 'warning':
        return base + sizeClass + 'bg-warning/10 text-warning border-warning/20';
      case 'info':
        return base + sizeClass + 'bg-info/10 text-info border-info/20';
      default:
        return base + sizeClass + 'bg-bg-elevated text-text-secondary border-border';
    }
  }
}
