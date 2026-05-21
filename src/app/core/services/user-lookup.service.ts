import { Injectable, computed, inject } from '@angular/core';
import { MembersStore } from '../../features/members/store/members.store';
import { Member } from './members-api.service';

@Injectable({ providedIn: 'root' })
export class UserLookupService {
  private readonly store = inject(MembersStore);
  private memberMap = new Map<string, Member>();

  readonly members = computed(() => {
    const list = this.store.members();
    this.memberMap.clear();
    for (const m of list) {
      this.memberMap.set(m.id, m);
    }
    return list;
  });

  getName(id: string | null | undefined): string {
    if (!id) return 'Unassigned';
    const member = this.memberMap.get(id);
    return member?.name ?? id;
  }

  getInitials(id: string | null | undefined): string {
    if (!id) return '?';
    const member = this.memberMap.get(id);
    return member?.initials ?? (id.substring(0, 2).toUpperCase());
  }

  getColor(id: string | null | undefined): string {
    if (!id) return 'var(--text-muted)';
    const member = this.memberMap.get(id);
    return member?.color ?? 'var(--bg-elevated)';
  }

  getMember(id: string | null | undefined): Member | undefined {
    if (!id) return undefined;
    return this.memberMap.get(id);
  }
}
