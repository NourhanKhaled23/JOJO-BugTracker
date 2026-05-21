import { Component, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Plus, MoreHorizontal, User, Mail, Shield, ShieldAlert, CheckCircle2, X, Trash2, Edit2, Check } from 'lucide-angular';
import { listAnimation, slideInAnimation } from '../../core/animations/ui.animations';
import { ToastService } from '../../core/services/toast.service';
import { RbacService } from '../../core/services/rbac.service';
import { ActivityService } from '../../core/services/activity.service';
import { AuthStore } from '../../core/stores/auth.store';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';

import { MembersStore } from './store/members.store';
import { Member } from '../../core/services/members-api.service';

const ROLES = ['Admin', 'Developer', 'Designer', 'Project Manager', 'Viewer'];

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ConfirmDialog],
  templateUrl: './members.html',
  styleUrl: './members.scss',
  animations: [listAnimation, slideInAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Members {
  private readonly toast = inject(ToastService);
  readonly rbac = inject(RbacService);
  private readonly activity = inject(ActivityService);
  private readonly authStore = inject(AuthStore);
  private readonly notifService = inject(NotificationService);
  readonly store = inject(MembersStore);

  readonly Search = Search;
  readonly Plus = Plus;
  readonly MoreHorizontal = MoreHorizontal;
  readonly User = User;
  readonly Mail = Mail;
  readonly Shield = Shield;
  readonly ShieldAlert = ShieldAlert;
  readonly CheckCircle2 = CheckCircle2;
  readonly X = X;
  readonly Trash = Trash2;
  readonly Edit2 = Edit2;
  readonly Check = Check;

  readonly roles = ROLES;

  searchQuery = signal('');
  showInviteModal = signal(false);
  editingMemberId = signal<string | null>(null);
  openMenuId = signal<string | null>(null);
  removingMemberId = signal<string | null>(null);

  removingMemberName = computed(() => {
    const id = this.removingMemberId();
    const member = this.store.members().find((m: Member) => m.id === id);
    return member ? `Remove "${member.name}" from the team? This cannot be undone.` : 'Remove this member?';
  });

  // Invite form
  inviteName = signal('');
  inviteEmail = signal('');
  inviteRole = signal('Developer');

  filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.store.members().filter((m: Member) =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.role.toLowerCase().includes(query)
    );
  });

  activeCount = computed(() => this.store.members().filter((m: Member) => m.status === 'Active').length);
  pendingCount = computed(() => this.store.members().filter((m: Member) => m.status === 'Pending').length);

  openInviteModal(): void {
    this.inviteName.set('');
    this.inviteEmail.set('');
    this.inviteRole.set('Developer');
    this.showInviteModal.set(true);
  }

  inviteMember(): void {
    const email = this.inviteEmail().trim();
    const name = this.inviteName().trim();
    if (!email || !name) {
      this.toast.show('Name and email are required', 'error'); return;
    }
    if (this.store.members().some((m: Member) => m.email === email)) {
      this.toast.show('A member with this email already exists', 'error'); return;
    }
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--info)', 'var(--error)'];
    const newMember: Member = {
      id: crypto.randomUUID(),
      name,
      email,
      role: this.inviteRole(),
      status: 'Pending',
      initials,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    this.store.inviteMember(newMember);

    this.activity.log({
      type: 'member_invited', entityId: newMember.id, entityTitle: name,
      userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
      description: `Invited ${name} as ${this.inviteRole()}`
    });
    this.notifService.push({ title: 'Member Invited', message: `${name} has been invited as ${this.inviteRole()}`, type: 'success' });
    this.showInviteModal.set(false);
  }

  changeRole(memberId: string, role: string): void {
    this.store.updateRole({id: memberId, role});
    this.editingMemberId.set(null);
    this.openMenuId.set(null);
  }

  removeMember(memberId: string): void {
    this.removingMemberId.set(memberId);
    this.openMenuId.set(null);
  }

  confirmRemoveMember(): void {
    const memberId = this.removingMemberId();
    const member = this.store.members().find((m: Member) => m.id === memberId);
    if (!member || !memberId) return;
    
    this.store.removeMember(memberId);

    this.activity.log({
      type: 'member_removed', entityId: memberId, entityTitle: member.name,
      userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
      description: `Removed ${member.name} from the team`
    });
    this.removingMemberId.set(null);
    this.toast.show(`${member.name} removed`, 'info');
  }

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
    this.editingMemberId.set(null);
  }

  startEditRole(id: string): void {
    this.editingMemberId.set(id);
    this.openMenuId.set(null);
  }
}
