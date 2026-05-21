import { signalStore, withState, withMethods, patchState, withComputed, withHooks } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Project, CreateProjectDto } from '../../../core/models/project.model';
import { ProjectsApiService } from '../../../core/services/projects-api.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, mergeMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  error: string | null;
  viewMode: 'grid' | 'list';
  search: string;
}

const initialState: ProjectsState = {
  projects: [],
  selectedProject: null,
  isLoading: false,
  error: null,
  viewMode: 'grid',
  search: ''
};

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    activeProjects: computed(() => {
      const search = store.search().toLowerCase();
      return store.projects().filter((p: Project) =>
        !p.isArchived && (
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
        )
      );
    }),
    archivedProjects: computed(() => store.projects().filter((p: Project) => p.isArchived)),
    projectCount: computed(() => store.projects().length)
  })),
  withMethods((store, projectsApi = inject(ProjectsApiService)) => ({
    setSearch(search: string): void {
      patchState(store, { search });
    },
    setViewMode(viewMode: 'grid' | 'list'): void {
      patchState(store, { viewMode });
    },
    setSelectedProject(project: Project | null): void {
      patchState(store, { selectedProject: project });
    },

    loadProjects: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => 
          projectsApi.getProjects().pipe(
            tapResponse({
              next: (projects: Project[]) => patchState(store, { projects, isLoading: false }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    addProject: rxMethod<CreateProjectDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((projectDto) => 
          projectsApi.createProject(projectDto).pipe(
            tapResponse({
              next: (project: Project) => patchState(store, { 
                projects: [...store.projects(), project],
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    updateProject: rxMethod<Project>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((project) => 
          projectsApi.updateProject(project.id, project).pipe(
            tapResponse({
              next: (updated: Project) => patchState(store, { 
                projects: store.projects().map(p => p.id === updated.id ? updated : p),
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    deleteProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((id) => 
          projectsApi.deleteProject(id).pipe(
            tapResponse({
              next: () => patchState(store, { 
                projects: store.projects().filter(p => p.id !== id),
                selectedProject: store.selectedProject()?.id === id ? null : store.selectedProject(),
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    archiveProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((id) => 
          projectsApi.archiveProject(id).pipe(
            tapResponse({
              next: (updated: Project) => patchState(store, { 
                projects: store.projects().map(p => p.id === updated.id ? updated : p),
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    unarchiveProject: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        mergeMap((id) => 
          projectsApi.unarchiveProject(id).pipe(
            tapResponse({
              next: (updated: Project) => patchState(store, { 
                projects: store.projects().map(p => p.id === updated.id ? updated : p),
                isLoading: false 
              }),
              error: (err: Error) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    setProjects(projects: Project[]): void {
      patchState(store, { projects });
    }
  })),
  withHooks({
    onInit(store) {
      store.loadProjects();
    }
  })
);

