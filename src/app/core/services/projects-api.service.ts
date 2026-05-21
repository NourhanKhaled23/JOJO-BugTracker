import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Project, CreateProjectDto } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsApiService {
  private readonly api = inject(ApiService);
  private readonly path = '/projects';

  getProjects(): Observable<Project[]> {
    return this.api.get<Project[]>(this.path);
  }

  getProject(id: string): Observable<Project> {
    return this.api.get<Project>(`${this.path}/${id}`);
  }

  createProject(project: CreateProjectDto): Observable<Project> {
    return this.api.post<Project>(this.path, project);
  }

  updateProject(id: string, project: Partial<Project>): Observable<Project> {
    return this.api.patch<Project>(`${this.path}/${id}`, project);
  }

  deleteProject(id: string): Observable<void> {
    return this.api.delete<void>(`${this.path}/${id}`);
  }

  archiveProject(id: string): Observable<Project> {
    return this.api.patch<Project>(`${this.path}/${id}/archive`, {});
  }

  unarchiveProject(id: string): Observable<Project> {
    return this.api.patch<Project>(`${this.path}/${id}/unarchive`, {});
  }
}
