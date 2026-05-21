import { signalStore, withState, withMethods, patchState, withComputed, withHooks } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Bug, BugStatus, BugPriority, BugLabel } from '../../../core/models/bug.model';
import { BugCommentDisplay } from '../../../core/models/comment.model';
import { BugsApiService } from '../../../core/services/bugs-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, mergeMap, tap, forkJoin } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export interface BugsState {
  bugs: Bug[];
  selectedBug: Bug | null;
  isLoading: boolean;
  error: string | null;
  filter: {
    status: BugStatus | 'all';
    priority: BugPriority | 'all';
    search: string;
    projectId: string | 'all';
    labelId: string | 'all';
    assigneeId: string | 'all';
    dueDateFrom: string | null;
    dueDateTo: string | null;
  };
  comments: Record<string, BugCommentDisplay[]>;
  labels: BugLabel[];
  selectedIds: string[];
}

const initialState: BugsState = {
  bugs: [],
  selectedBug: null,
  isLoading: false,
  error: null,
  filter: {
    status: 'all',
    priority: 'all',
    search: '',
    projectId: 'all',
    labelId: 'all',
    assigneeId: 'all',
    dueDateFrom: null,
    dueDateTo: null
  },
  comments: {},
  labels: [],
  selectedIds: []
};

export const BugsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredBugs: computed(() => {
      const bugs = store.bugs();
      const { status, priority, search, projectId, labelId, assigneeId, dueDateFrom, dueDateTo } = store.filter();

      return bugs.filter(bug => {
        if (status !== 'all' && bug.status !== status) return false;
        if (priority !== 'all' && bug.priority !== priority) return false;
        if (projectId !== 'all' && bug.projectId !== projectId) return false;
        if (labelId !== 'all' && !bug.labelIds.includes(labelId)) return false;
        if (assigneeId !== 'all' && bug.assigneeId !== assigneeId) return false;
        if (dueDateFrom && bug.dueDate && bug.dueDate < dueDateFrom) return false;
        if (dueDateTo && bug.dueDate && bug.dueDate > dueDateTo) return false;
        if (search) {
          const q = search.toLowerCase();
          return bug.title.toLowerCase().includes(q) || bug.description.toLowerCase().includes(q);
        }
        return true;
      });
    }),
    openBugsCount: computed(() => store.bugs().filter(b => b.status === 'open').length),
    inProgressCount: computed(() => store.bugs().filter(b => b.status === 'in-progress').length),
    bugCount: computed(() => store.bugs().length),
    hasActiveFilters: computed(() => {
      const f = store.filter();
      return f.status !== 'all' || f.priority !== 'all' || f.search !== '' ||
        f.projectId !== 'all' || f.labelId !== 'all' || f.assigneeId !== 'all' ||
        !!f.dueDateFrom || !!f.dueDateTo;
    })
  })),
  withMethods((store, bugsApi = inject(BugsApiService), toast = inject(ToastService)) => ({
    setSelectedBug(bug: Bug | null): void {
      patchState(store, { selectedBug: bug });
    },
    setFilter(filter: Partial<BugsState['filter']>): void {
      patchState(store, (state) => ({ filter: { ...state.filter, ...filter } }));
    },
    resetFilters(): void {
      patchState(store, {
        filter: {
          status: 'all', priority: 'all', search: '', projectId: 'all',
          labelId: 'all', assigneeId: 'all', dueDateFrom: null, dueDateTo: null
        }
      });
    },
    toggleSelect(id: string): void {
      patchState(store, (state) => {
        const selectedIds = state.selectedIds.includes(id)
          ? state.selectedIds.filter(sid => sid !== id)
          : [...state.selectedIds, id];
        return { selectedIds };
      });
    },
    selectAll(ids: string[]): void {
      patchState(store, { selectedIds: ids });
    },
    clearSelection(): void {
      patchState(store, { selectedIds: [] });
    },

    loadBugs: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => 
          bugsApi.getBugs().pipe(
            tapResponse({
              next: (bugs: Bug[]) => patchState(store, { bugs, isLoading: false }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    loadLabels: rxMethod<void>(
      pipe(
        switchMap(() => 
          bugsApi.getLabels().pipe(
            tapResponse({
              next: (labels: BugLabel[]) => patchState(store, { labels }),
              error: (err: Error) => patchState(store, { error: err.message })
            })
          )
        )
      )
    ),

    addBug: rxMethod<Partial<Bug>>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((bugDto) => 
          bugsApi.createBug(bugDto).pipe(
            tapResponse({
              next: (bug: Bug) => patchState(store, { 
                bugs: [...store.bugs(), bug],
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    updateBug: rxMethod<Bug>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((bug) => 
          bugsApi.updateBug(bug.id, bug).pipe(
            tapResponse({
              next: (updated: Bug) => patchState(store, { 
                bugs: store.bugs().map(b => b.id === updated.id ? updated : b),
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    deleteBug: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((id) => 
          bugsApi.deleteBug(id).pipe(
            tapResponse({
              next: () => patchState(store, { 
                bugs: store.bugs().filter(b => b.id !== id),
                selectedIds: store.selectedIds().filter(sid => sid !== id),
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    // Bulk operations
    bulkUpdateStatus: rxMethod<{ids: string[], status: BugStatus}>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap(({ids, status}) => 
          forkJoin(ids.map(id => bugsApi.updateBug(id, { status }))).pipe(
            tapResponse({
              next: (updatedBugs: Bug[]) => patchState(store, (state) => ({ 
                bugs: state.bugs.map(b => {
                   const upd = updatedBugs.find(u => u?.id === b.id);
                   return upd ? upd : b;
                }),
                selectedIds: [],
                isLoading: false 
              })),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    // Comments
    loadComments: rxMethod<string>(
      pipe(
        switchMap((bugId) => 
          bugsApi.getComments(bugId).pipe(
            tapResponse({
              next: (comments: BugCommentDisplay[]) => patchState(store, (state) => ({ 
                comments: { ...state.comments, [bugId]: comments } 
              })),
              error: (err: Error) => patchState(store, { error: err.message })
            })
          )
        )
      )
    ),

    addComment: rxMethod<{bugId: string, text: string}>(
      pipe(
        switchMap(({bugId, text}) => 
          bugsApi.addComment(bugId, text).pipe(
            tapResponse({
              next: (comment: BugCommentDisplay) => patchState(store, (state) => ({ 
                comments: { 
                  ...state.comments, 
                  [bugId]: [...(state.comments[bugId] || []), comment] 
                } 
              })),
              error: (err: Error) => patchState(store, { error: err.message })
            })
          )
        )
      )
    ),

    updateComment(bugId: string, commentId: string, text: string): void {
      bugsApi.updateComment(commentId, text).subscribe({
        next: () => patchState(store, (state) => {
          const bugComments = state.comments[bugId] || [];
          return {
            comments: {
              ...state.comments,
              [bugId]: bugComments.map(c => c.id === commentId ? { ...c, text, edited: true } : c)
            }
          };
        }),
        error: (err: Error) => patchState(store, { error: err.message })
      });
    },

    deleteComment(bugId: string, commentId: string): void {
      bugsApi.deleteComment(commentId).subscribe({
        next: () => patchState(store, (state) => {
          const bugComments = state.comments[bugId] || [];
          return {
            comments: {
              ...state.comments,
              [bugId]: bugComments.filter(c => c.id !== commentId)
            }
          };
        }),
        error: (err: Error) => patchState(store, { error: err.message })
      });
    },

    bulkUpdatePriority(ids: string[], priority: BugPriority): void {
      patchState(store, { isLoading: true });
      forkJoin(ids.map(id => bugsApi.updateBug(id, { priority }))).subscribe({
        next: (updatedBugs: Bug[]) => patchState(store, (state) => ({
          bugs: state.bugs.map(b => {
            const upd = updatedBugs.find(u => u?.id === b.id);
            return upd ? upd : b;
          }),
          selectedIds: [],
          isLoading: false
        })),
        error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
      });
    },

    bulkDelete(ids: string[]): void {
      patchState(store, { isLoading: true });
      forkJoin(ids.map(id => bugsApi.deleteBug(id))).subscribe({
        next: () => patchState(store, (state) => ({
          bugs: state.bugs.filter(b => !ids.includes(b.id)),
          selectedIds: [],
          isLoading: false
        })),
        error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
      });
    },

    addLabel(label: BugLabel): void {
      bugsApi.addLabel(label).subscribe({
        next: (saved) => {
          patchState(store, (state) => ({ labels: [...state.labels, saved] }));
          toast.show('Label created', 'success');
        },
        error: (err: Error) => {
          patchState(store, { error: err.message });
          toast.show('Failed to create label', 'error');
        }
      });
    },

    updateLabel(label: BugLabel): void {
      bugsApi.updateLabel(label.id, label).subscribe({
        next: (saved) => {
          patchState(store, (state) => ({
            labels: state.labels.map(l => l.id === saved.id ? saved : l)
          }));
          toast.show('Label updated', 'success');
        },
        error: (err: Error) => {
          patchState(store, { error: err.message });
          toast.show('Failed to update label', 'error');
        }
      });
    },

    deleteLabel(id: string): void {
      bugsApi.deleteLabel(id).subscribe({
        next: () => {
          patchState(store, (state) => ({
            labels: state.labels.filter(l => l.id !== id)
          }));
          toast.show('Label deleted', 'info');
        },
        error: (err: Error) => {
          patchState(store, { error: err.message });
          toast.show('Failed to delete label', 'error');
        }
      });
    },

    setBugs(bugs: Bug[]): void {
      patchState(store, { bugs });
    }
  })),
  withHooks({
    onInit(store) {
      store.loadBugs();
      store.loadLabels();
    }
  })
);

