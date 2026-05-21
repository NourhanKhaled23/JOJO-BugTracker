import { Injectable, computed, inject } from '@angular/core';
import { MembersStore } from '../../features/members/store/members.store';
import { Member } from './members-api.service';

@Injectable({ providedIn: 'root' })
export class UserLookupService {
  private readonly store = inject(MembersStore);

  private readonly memberMap = computed(() => {
    const map = new Map<string, Member>();
    for (const m of this.store.members()) {
      map.set(m.id, m);
    }
    return map;
  });

  readonly members = computed(() => this.store.members());

  getName(id: string | null | undefined): string {
    if (!id) return 'Unassigned';
    const member = this.memberMap().get(id);
    return member?.name ?? id;
  }

  getInitials(id: string | null | undefined): string {
    if (!id) return '?';
    const member = this.memberMap().get(id);
    return member?.initials ?? (id.substring(0, 2).toUpperCase());
  }

  getColor(id: string | null | undefined): string {
    if (!id) return 'var(--text-muted)';
    const member = this.memberMap().get(id);
    return member?.color ?? 'var(--bg-elevated)';
  }

  getMember(id: string | null | undefined): Member | undefined {
    if (!id) return undefined;
    return this.memberMap().get(id);
  }
}
