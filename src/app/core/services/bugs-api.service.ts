import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Bug, BugLabel } from '../models/bug.model';
import { BugCommentDisplay } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class BugsApiService {
  private readonly api = inject(ApiService);
  private readonly path = '/bugs';

  getBugs(params?: Record<string, string | number | boolean | readonly (string | number | boolean)[]>): Observable<Bug[]> {
    return this.api.get<Bug[]>(this.path, { params });
  }

  getBug(id: string): Observable<Bug> {
    return this.api.get<Bug>(`${this.path}/${id}`);
  }

  createBug(bug: Partial<Bug>): Observable<Bug> {
    return this.api.post<Bug>(this.path, bug);
  }

  updateBug(id: string, bug: Partial<Bug>): Observable<Bug> {
    return this.api.patch<Bug>(`${this.path}/${id}`, bug);
  }

  deleteBug(id: string): Observable<void> {
    return this.api.delete<void>(`${this.path}/${id}`);
  }

  // Comments
  getComments(bugId: string): Observable<BugCommentDisplay[]> {
    return this.api.get<BugCommentDisplay[]>(`${this.path}/${bugId}/comments`);
  }

  addComment(bugId: string, text: string): Observable<BugCommentDisplay> {
    return this.api.post<BugCommentDisplay>(`${this.path}/${bugId}/comments`, { text });
  }

  updateComment(commentId: string, text: string): Observable<BugCommentDisplay> {
    return this.api.patch<BugCommentDisplay>(`/comments/${commentId}`, { text });
  }

  deleteComment(commentId: string): Observable<void> {
    return this.api.delete<void>(`/comments/${commentId}`);
  }

  // Labels
  getLabels(): Observable<BugLabel[]> {
    return this.api.get<BugLabel[]>('/labels');
  }

  addLabel(label: Partial<BugLabel>): Observable<BugLabel> {
    return this.api.post<BugLabel>('/labels', label);
  }

  updateLabel(id: string, label: Partial<BugLabel>): Observable<BugLabel> {
    return this.api.patch<BugLabel>(`/labels/${id}`, label);
  }

  deleteLabel(id: string): Observable<void> {
    return this.api.delete<void>(`/labels/${id}`);
  }
}
