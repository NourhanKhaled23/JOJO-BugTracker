import { Component, inject, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { BugsStore } from '../bugs/store/bugs.store';
import { ProjectsStore } from '../projects/store/projects.store';
import { LucideAngularModule, TrendingUp, TrendingDown, Bug as BugIcon, FolderKanban, Clock, CheckCircle2, Users, ChevronRight, Rocket, Settings } from 'lucide-angular';
import { RbacService } from '../../core/services/rbac.service';
import { UserLookupService } from '../../core/services/user-lookup.service';
import { ActivityService } from '../../core/services/activity.service';
import { ToastService } from '../../core/services/toast.service';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  readonly bugStore = inject(BugsStore);
  readonly projectStore = inject(ProjectsStore);
  readonly rbac = inject(RbacService);
  readonly userLookup = inject(UserLookupService);
  readonly activity = inject(ActivityService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly Bug = BugIcon;
  readonly FolderKanban = FolderKanban;
  readonly Clock = Clock;
  readonly CheckCircle2 = CheckCircle2;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Users = Users;
  readonly ChevronRight = ChevronRight;
  readonly Rocket = Rocket;
  readonly Settings = Settings;

  readonly version = signal('2.1.0');

  readonly systemLoad = computed(() => {
    const total = this.bugStore.bugs().length;
    return Math.min(Math.round((total / 50) * 100), 100);
  });

  readonly priorityLevels: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];

  readonly priorityCounts = computed(() => {
    const bugs = this.bugStore.bugs();
    return {
      critical: bugs.filter(b => b.priority === 'critical').length,
      high: bugs.filter(b => b.priority === 'high').length,
      medium: bugs.filter(b => b.priority === 'medium').length,
      low: bugs.filter(b => b.priority === 'low').length,
    };
  });

  readonly recentActivity = computed(() => {
    return this.activity.getRecent(5);
  });

  generateReport(): void {
    const bugs = this.bugStore.bugs();
    const projects = this.projectStore.projects();
    const now = new Date().toISOString().slice(0, 10);

    const rows: string[] = ['"Bug ID","Title","Status","Priority","Project","Assignee","Created","Updated"'];
    for (const bug of bugs) {
      const project = projects.find(p => p.id === bug.projectId);
      rows.push(`"${bug.id}","${bug.title.replace(/"/g, '""')}","${bug.status}","${bug.priority}","${project?.name || 'Unknown'}","${bug.assigneeId || ''}","${bug.createdAt}","${bug.updatedAt}"`);
    }
    rows.push('');
    rows.push(`"Report generated",${now}`);
    rows.push(`"Total Bugs",${bugs.length}`);
    rows.push(`"Open Bugs",${bugs.filter(b => b.status === 'open').length}`);
    rows.push(`"Closed Bugs",${bugs.filter(b => b.status === 'closed').length}`);
    rows.push(`"Total Projects",${projects.length}`);

    const csv = rows.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bugtrackr-report-${now}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show('Report downloaded', 'success');
  }

  navigateToBug(bugId: string): void {
    this.router.navigate(['/bugs', bugId]);
  }

  totalBugs = computed(() => this.bugStore.bugs().length);
  openBugs = computed(() => this.bugStore.openBugsCount());
  inProgressBugs = computed(() => this.bugStore.inProgressCount());
  totalProjects = computed(() => this.projectStore.projectCount());

  public doughnutChartData = computed<ChartData<'doughnut'>>(() => {
    const counts = this.priorityCounts();
    return {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [counts.critical, counts.high, counts.medium, counts.low],
        backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
        hoverBackgroundColor: ['#DC2626', '#D97706', '#2563EB', '#059669'],
        borderWidth: 0,
        weight: 10
      }]
    };
  });

  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    cutout: '70%'
  };

  public lineChartData = computed<ChartData<'line'>>(() => {
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Bugs Created',
        data: [2, 5, 3, 7, 4, 6, 8],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  });

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };

  public barChartData = computed<ChartData<'bar'>>(() => {
    const bugs = this.bugStore.bugs();
    return {
      labels: ['Open', 'In Progress', 'Testing', 'Closed'],
      datasets: [{
        label: 'Bugs by Status',
        data: [
          this.bugStore.openBugsCount(),
          this.bugStore.inProgressCount(),
          bugs.filter(b => b.status === 'testing').length,
          bugs.filter(b => b.status === 'closed').length
        ],
        backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'],
        borderRadius: 8
      }]
    };
  });

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };
}
