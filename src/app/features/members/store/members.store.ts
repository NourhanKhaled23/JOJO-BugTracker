import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { MembersApiService, Member } from '../../../core/services/members-api.service';
import { ToastService } from '../../../core/services/toast.service';

export interface MembersState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MembersState = {
  members: [],
  isLoading: false,
  error: null
};

export const MembersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (store, api = inject(MembersApiService), toast = inject(ToastService)) => ({
      loadMembers: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => api.getMembers().pipe(
            tapResponse({
              next: (members) => patchState(store, { members, isLoading: false }),
              error: (err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Failed to load members';
                patchState(store, { isLoading: false, error: msg });
                toast.show('Failed to load members', 'error');
              }
            })
          ))
        )
      ),
      inviteMember: rxMethod<Member>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((member) => api.inviteMember(member).pipe(
            tapResponse({
              next: (newMember) => {
                patchState(store, { members: [...store.members(), newMember], isLoading: false });
                toast.show(`Invite sent to ${newMember.email}`, 'success');
              },
              error: (err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Failed to invite member';
                patchState(store, { isLoading: false, error: msg });
                toast.show('Failed to invite member', 'error');
              }
            })
          ))
        )
      ),
      updateRole: rxMethod<{id: string, role: string}>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({id, role}) => api.updateRole(id, role).pipe(
            tapResponse({
              next: () => {
                patchState(store, {
                  members: store.members().map(m => m.id === id ? { ...m, role } : m),
                  isLoading: false
                });
                toast.show('Role updated successfully', 'success');
              },
              error: (err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Failed to update role';
                patchState(store, { isLoading: false, error: msg });
                toast.show('Failed to update role', 'error');
              }
            })
          ))
        )
      ),
      removeMember: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) => api.deleteMember(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, {
                  members: store.members().filter(m => m.id !== id),
                  isLoading: false
                });
              },
              error: (err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Failed to remove member';
                patchState(store, { isLoading: false, error: msg });
                toast.show('Failed to remove member', 'error');
              }
            })
          ))
        )
      )
    })
  ),
  withHooks({
    onInit(store) {
      store.loadMembers();
    }
  })
);
