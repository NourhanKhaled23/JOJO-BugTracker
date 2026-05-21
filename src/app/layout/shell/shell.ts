import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Topbar } from '../topbar/topbar';
import { ProjectsStore } from '../../features/projects/store/projects.store';
import { LucideAngularModule, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-angular';
import { PerformanceOverlay } from '../../shared/components/performance-overlay/performance-overlay';
import { CommandPalette } from '../../shared/components/command-palette/command-palette';
import { ToastService } from '../../core/services/toast.service';


@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Topbar, LucideAngularModule, PerformanceOverlay, CommandPalette],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Shell {
  readonly store = inject(ProjectsStore);
  readonly toastService = inject(ToastService);

  readonly CheckCircle2 = CheckCircle2;
  readonly AlertCircle = AlertCircle;
  readonly Info = Info;
  readonly AlertTriangle = AlertTriangle;
}
