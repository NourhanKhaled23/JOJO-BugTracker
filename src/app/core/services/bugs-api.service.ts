import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Bug, BugLabel } from '../models/bug.model';
import { BugCommentDisplay } from '../models/comment.model';

const BUGS_KEY = 'bugtrackr_bugs';
const LABELS_KEY = 'bugtrackr_labels';
const COMMENTS_KEY = 'bugtrackr_comments';

const DEFAULT_LABELS: BugLabel[] = [
  { id: 'lbl-1', name: 'Bug', color: '#EF4444' },
  { id: 'lbl-2', name: 'Feature', color: '#3B82F6' },
  { id: 'lbl-3', name: 'Enhancement', color: '#10B981' },
  { id: 'lbl-4', name: 'Documentation', color: '#F59E0B' },
  { id: 'lbl-5', name: 'Urgent', color: '#DC2626' },
  { id: 'lbl-6', name: 'Question', color: '#8B5CF6' },
];

const DEFAULT_BUGS: Bug[] = [];

@Injectable({ providedIn: 'root' })
export class BugsApiService {
  // -- Bugs --
  getBugs(): Observable<Bug[]> {
    return of(this.loadBugs()).pipe(delay(300));
  }

  getBug(id: string): Observable<Bug> {
    const bug = this.loadBugs().find(b => b.id === id) || null;
    return of(bug as Bug).pipe(delay(200));
  }

  createBug(dto: Partial<Bug>): Observable<Bug> {
    const bug: Bug = {
      id: 'bug-' + crypto.randomUUID().slice(0, 8),
      projectId: dto.projectId || '',
      title: dto.title || '',
      description: dto.description || '',
      status: dto.status || 'open',
      priority: dto.priority || 'medium',
      assigneeId: dto.assigneeId || null,
      reporterId: dto.reporterId || '1',
      labelIds: dto.labelIds || [],
      attachmentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dto.dueDate || null,
    };
    const list = this.loadBugs();
    list.push(bug);
    this.saveBugs(list);
    return of(bug).pipe(delay(300));
  }

  updateBug(id: string, updates: Partial<Bug>): Observable<Bug> {
    const list = this.loadBugs();
    const index = list.findIndex(b => b.id === id);
    if (index === -1) return of(null as unknown as Bug);
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveBugs(list);
    return of(list[index]).pipe(delay(200));
  }

  deleteBug(id: string): Observable<void> {
    const list = this.loadBugs();
    this.saveBugs(list.filter(b => b.id !== id));
    return of(void 0).pipe(delay(200));
  }

  // -- Comments --
  getComments(bugId: string): Observable<BugCommentDisplay[]> {
    const all = this.loadComments();
    return of(all[bugId] || []).pipe(delay(200));
  }

  addComment(bugId: string, text: string): Observable<BugCommentDisplay> {
    const comment: BugCommentDisplay = {
      id: 'cmt-' + crypto.randomUUID().slice(0, 8),
      user: 'Demo Admin',
      avatar: '',
      text,
      time: new Date().toISOString(),
      userId: '1',
      edited: false,
    };
    const all = this.loadComments();
    all[bugId] = [...(all[bugId] || []), comment];
    this.saveComments(all);
    return of(comment).pipe(delay(200));
  }

  updateComment(commentId: string, text: string): Observable<BugCommentDisplay> {
    const all = this.loadComments();
    for (const bugId of Object.keys(all)) {
      const idx = all[bugId].findIndex((c: BugCommentDisplay) => c.id === commentId);
      if (idx !== -1) {
        all[bugId][idx] = { ...all[bugId][idx], text, edited: true };
        this.saveComments(all);
        return of(all[bugId][idx]).pipe(delay(200));
      }
    }
    return of(null as unknown as BugCommentDisplay);
  }

  deleteComment(commentId: string): Observable<void> {
    const all = this.loadComments();
    for (const bugId of Object.keys(all)) {
      const idx = all[bugId].findIndex((c: BugCommentDisplay) => c.id === commentId);
      if (idx !== -1) {
        all[bugId].splice(idx, 1);
        this.saveComments(all);
        break;
      }
    }
    return of(void 0).pipe(delay(200));
  }

  // -- Labels --
  getLabels(): Observable<BugLabel[]> {
    return of(this.loadLabels()).pipe(delay(200));
  }

  addLabel(dto: Partial<BugLabel>): Observable<BugLabel> {
    const label: BugLabel = {
      id: 'lbl-' + crypto.randomUUID().slice(0, 8),
      name: dto.name || '',
      color: dto.color || '#3B82F6',
    };
    const list = this.loadLabels();
    list.push(label);
    this.saveLabels(list);
    return of(label).pipe(delay(200));
  }

  updateLabel(id: string, updates: Partial<BugLabel>): Observable<BugLabel> {
    const list = this.loadLabels();
    const index = list.findIndex(l => l.id === id);
    if (index === -1) return of(null as unknown as BugLabel);
    list[index] = { ...list[index], ...updates };
    this.saveLabels(list);
    return of(list[index]).pipe(delay(200));
  }

  deleteLabel(id: string): Observable<void> {
    const list = this.loadLabels();
    this.saveLabels(list.filter(l => l.id !== id));
    return of(void 0).pipe(delay(200));
  }

  // -- Storage helpers --
  private loadBugs(): Bug[] {
    try {
      const raw = localStorage.getItem(BUGS_KEY);
      if (!raw) {
        this.saveBugs(DEFAULT_BUGS);
        return [...DEFAULT_BUGS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_BUGS];
    }
  }

  private saveBugs(data: Bug[]): void {
    try { localStorage.setItem(BUGS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }

  private loadLabels(): BugLabel[] {
    try {
      const raw = localStorage.getItem(LABELS_KEY);
      if (!raw) {
        this.saveLabels(DEFAULT_LABELS);
        return [...DEFAULT_LABELS];
      }
      return JSON.parse(raw);
    } catch {
      return [...DEFAULT_LABELS];
    }
  }

  private saveLabels(data: BugLabel[]): void {
    try { localStorage.setItem(LABELS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }

  private loadComments(): Record<string, BugCommentDisplay[]> {
    try {
      const raw = localStorage.getItem(COMMENTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveComments(data: Record<string, BugCommentDisplay[]>): void {
    try { localStorage.setItem(COMMENTS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }
}
