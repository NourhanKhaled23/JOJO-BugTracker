import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.html',
  styleUrl: './avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Avatar {
  @Input() src?: string;
  @Input() alt = '';
  @Input() initials?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color?: string;

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm': return 'w-8 h-8 text-xs';
      case 'lg': return 'w-16 h-16 text-xl';
      default: return 'w-10 h-10 text-sm';
    }
  }
}
