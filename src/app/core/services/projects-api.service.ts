import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Project, CreateProjectDto } from '../models/project.model';

const STORAGE_KEY = 'bugtrackr_projects';

const DEFAULT_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'BugTrackr Frontend', description: 'Main Angular application for bug tracking and project management.', type: 'web', color: 'var(--accent)', icon: 'Bug', ownerId: '1', memberIds: ['1', 'u1', 'u2', 'u3'], bugCount: 24, lastActivity: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), isArchived: false },
  { id: 'proj-2', name: 'API Gateway', description: 'RESTful API backend service for the BugTrackr ecosystem.', type: 'grad', color: 'var(--success)', icon: 'Server', ownerId: '1', memberIds: ['1', 'u2', 'u4'], bugCount: 12, lastActivity: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), isArchived: false },
  { id: 'proj-3', name: 'Mobile App', description: 'React Native mobile client for BugTrackr.', type: 'mobile', color: 'var(--warning)', icon: 'Smartphone', ownerId: '1', memberIds: ['1', 'u5'], bugCount: 8, lastActivity: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), isArchived: false },
  { id: 'proj-4', name: 'Design System', description: 'Shared UI component library and design tokens.', type: 'team', color: 'var(--info)', icon: 'Palette', ownerId: '1', memberIds: ['1', 'u1', 'u3', 'u5'], bugCount: 5, lastActivity: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 45).toISOString(), isArchived: false },
  { id: 'proj-5', name: 'Legacy Portal', description: 'Old monolith application scheduled for migration.', type: 'other', color: 'var(--text-muted)', icon: 'Archive', ownerId: '1', memberIds: ['1'], bugCount: 0, lastActivity: new Date().toISOString(), createdAt: new Date(Date.now() - 86400000 * 365).toISOString(), isArchived: true },
];

@Injectable({ providedIn: 'root' })
export class ProjectsApiService {
  getProjects(): Observable<Project[]> {
    return of(this.load()).pipe(delay(300));
  }

  getProject(id: string): Observable<Project> {
    const project = this.load().find(p => p.id === id) || null;
    return of(project as Project).pipe(delay(200));
  }

  createProject(dto: CreateProjectDto): Observable<Project> {
    const project: Project = {
      ...dto,
      id: 'proj-' + crypto.randomUUID().slice(0, 8),
      ownerId: '1',
      memberIds: [],
      bugCount: 0,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isArchived: false,
    };
    const list = this.load();
    list.push(project);
    this.save(list);
    return of(project).pipe(delay(300));
  }

  updateProject(id: string, updates: Partial<Project>): Observable<Project> {
    const list = this.load();
    const index = list.findIndex(p => p.id === id);
    if (index === -1) return of(null as unknown as Project);
    list[index] = { ...list[index], ...updates, lastActivity: new Date().toISOString() };
    this.save(list);
    return of(list[index]).pipe(delay(200));
  }

  deleteProject(id: string): Observable<void> {
    const list = this.load();
    this.save(list.filter(p => p.id !== id));
    return of(void 0).pipe(delay(200));
  }

  archiveProject(id: string): Observable<Project> {
    return this.updateProject(id, { isArchived: true });
  }

  unarchiveProject(id: string): Observable<Project> {
    return this.updateProject(id, { isArchived: false });
  }

  private load(): Project[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.save(DEFAULT_PROJECTS);
        return [...DEFAULT_PROJECTS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_PROJECTS];
    }
  }

  private save(data: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage unavailable
    }
  }
}
