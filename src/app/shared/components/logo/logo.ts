import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" [attr.width]="width" [attr.height]="height" viewBox="0 0 240 60" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--accent)"/>
          <stop offset="100%" stop-color="var(--accent-bright)"/>
        </linearGradient>
      </defs>
      <!-- Hexagon backdrop -->
      <rect x="4" y="4" width="48" height="48" rx="14" fill="url(#bg)" opacity="0.15"/>
      <rect x="4" y="4" width="48" height="48" rx="14" stroke="url(#bg)" stroke-width="1.5"/>
      <!-- Bug icon -->
      <g transform="translate(28, 28)">
        <ellipse cx="0" cy="0" rx="12" ry="10" fill="url(#bg)"/>
        <circle cx="0" cy="-10" r="5" fill="url(#bg)"/>
        <line x1="-3" y1="-14" x2="-8" y2="-20" stroke="url(#bg)" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="3" y1="-14" x2="8" y2="-20" stroke="url(#bg)" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="-8" cy="-20" r="1.5" fill="url(#bg)"/>
        <circle cx="8" cy="-20" r="1.5" fill="url(#bg)"/>
        <line x1="0" y1="-5" x2="0" y2="10" stroke="white" stroke-width="0.8" opacity="0.6"/>
        <circle cx="-4" cy="-2" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="4" cy="-2" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="-3" cy="5" r="1" fill="white" opacity="0.8"/>
        <circle cx="3" cy="5" r="1" fill="white" opacity="0.8"/>
      </g>
      <!-- Text -->
      <text x="66" y="36" font-family="'Inter','DM Sans',system-ui,sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5" fill="var(--text-primary)">BugTrackr</text>
      <text x="66" y="50" font-family="'Inter',system-ui,sans-serif" font-size="10" font-weight="700" letter-spacing="3" fill="url(#bg)">BUG TRACKING SYSTEM</text>
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Logo {
  @Input() width = '180';
  @Input() height = '45';
}
