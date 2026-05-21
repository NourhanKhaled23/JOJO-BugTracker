import { Injectable, inject } from '@angular/core';
import { BugsStore } from '../../features/bugs/store/bugs.store';
import { ProjectsStore } from '../stores/projects.store';
import { Bug } from '../models/bug.model';
import { Project } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly bugsStore = inject(BugsStore);
  private readonly projectsStore = inject(ProjectsStore);

  exportJSON(): void {
    const data = {
      exportedAt: new Date().toISOString(),
      bugs: this.bugsStore.bugs(),
      projects: this.projectsStore.projects()
    };
    this.downloadFile(JSON.stringify(data, null, 2), 'bugtrackr-export.json', 'application/json');
  }

  exportBugsCSV(): void {
    const bugs = this.bugsStore.bugs();
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Project', 'Assignee', 'Reporter', 'Created', 'Updated'];
    const rows = bugs.map(b => [
      b.id, `"${b.title.replace(/"/g, '""')}"`, b.status, b.priority,
      b.projectId, b.assigneeId ?? '', b.reporterId,
      b.createdAt, b.updatedAt
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    this.downloadFile(csv, 'bugs-export.csv', 'text/csv');
  }

  importJSON(jsonString: string): { bugs: number; projects: number } {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format');
    }

    if (typeof data !== 'object' || data === null) {
      throw new Error('Invalid JSON: expected an object');
    }

    let bugs = 0, projects = 0;

    if (Array.isArray(data['bugs'])) {
      const rawBugs = data['bugs'] as Record<string, unknown>[];
      const validBugs = rawBugs.filter((b) =>
        typeof b['id'] === 'string' && typeof b['title'] === 'string'
      );
      this.bugsStore.setBugs(validBugs as Partial<Bug>[] as Bug[]);
      bugs = validBugs.length;
    }
    if (Array.isArray(data['projects'])) {
      const rawProjects = data['projects'] as Record<string, unknown>[];
      const validProjects = rawProjects.filter((p) =>
        typeof p['id'] === 'string' && typeof p['name'] === 'string'
      );
      this.projectsStore.setProjects(validProjects as Partial<Project>[] as Project[]);
      projects = validProjects.length;
    }
    return { bugs, projects };
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
