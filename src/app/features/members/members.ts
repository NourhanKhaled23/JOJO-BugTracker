import { Component, signal, computed, ChangeDetectionStrategy, inject, HostListener } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { LucideAngularModule, Search, Plus, MoreHorizontal, User, Mail, Shield, ShieldAlert, CheckCircle2, X, Trash2, Edit2, Check, Bug, Loader2 } from 'lucide-angular';
import { listAnimation, slideInAnimation } from '../../core/animations/ui.animations';
import { ToastService } from '../../core/services/toast.service';
import { RbacService } from '../../core/services/rbac.service';
import { ActivityService } from '../../core/services/activity.service';
import { AuthStore } from '../../core/stores/auth.store';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { EmailService } from '../../core/services/email.service';

import { MembersStore } from './store/members.store';
import { Member } from '../../core/services/members-api.service';
import { BugsStore } from '../bugs/store/bugs.store';
import { Role } from '../../core/enums/role';

const ROLES: Role[] = [Role.Admin, Role.Developer, Role.Viewer];

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ConfirmDialog, TitleCasePipe],
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
  private readonly emailService = inject(EmailService);
  readonly store = inject(MembersStore);
  readonly bugStore = inject(BugsStore);

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
  readonly Bug = Bug;
  readonly Loader2 = Loader2;

  readonly roles = ROLES;

  searchQuery = signal('');
  showInviteModal = signal(false);
  editingMemberId = signal<string | null>(null);
  openMenuId = signal<string | null>(null);
  removingMemberId = signal<string | null>(null);
  showAssignModal = signal<string | null>(null);
  isSendingInvite = signal(false);

  assignableBugs = computed(() =>
    this.bugStore.bugs().filter(b => b.status !== 'closed')
  );

  assignedBugCount = computed(() => {
    const bugs = this.bugStore.bugs();
    const counts = new Map<string, number>();
    for (const b of bugs) {
      if (b.assigneeId) {
        counts.set(b.assigneeId, (counts.get(b.assigneeId) || 0) + 1);
      }
    }
    return counts;
  });

  removingMemberName = computed(() => {
    const id = this.removingMemberId();
    const member = this.store.members().find((m: Member) => m.id === id);
    return member ? `Remove "${member.name}" from the team? This cannot be undone.` : 'Remove this member?';
  });

  // Invite form
  inviteName = signal('');
  inviteEmail = signal('');
  inviteRole = signal<Role>(Role.Developer);

  filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.store.members().filter((m: Member) =>
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.role.includes(query)
    );
  });

  activeCount = computed(() => this.store.members().filter((m: Member) => m.status === 'Active').length);
  pendingCount = computed(() => this.store.members().filter((m: Member) => m.status === 'Pending').length);

  openInviteModal(): void {
    this.inviteName.set('');
    this.inviteEmail.set('');
    this.inviteRole.set(Role.Developer);
    this.showInviteModal.set(true);
  }

  inviteMember(): void {
    const email = this.inviteEmail().trim();
    const name = this.inviteName().trim();
    if (!email || !name) {
      this.toast.show('Name and email are required', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.toast.show('Please enter a valid email address', 'error'); return;
    }
    if (this.store.members().some((m: Member) => m.email.toLowerCase() === email.toLowerCase())) {
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

    this.isSendingInvite.set(true);

    const inviteLink = `${window.location.origin}/auth/register?email=${encodeURIComponent(email)}&team=bugtrackr`;
    const fromName = this.authStore.user()?.fullName || 'A team member';

    this.emailService.sendInvite({
      to_name: name,
      to_email: email,
      from_name: fromName,
      invite_link: inviteLink,
      role: this.inviteRole()
    }).then(() => {
      this.store.inviteMember(newMember);
      this.activity.log({
        type: 'member_invited', entityId: newMember.id, entityTitle: name,
        userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
        description: `Invited ${name} as ${this.inviteRole()}`
      });
      this.notifService.push({ title: 'Member Invited', message: `${name} has been invited as ${this.inviteRole()}`, type: 'success' });
      this.toast.show(`Invitation sent to ${email}`, 'success');
      this.showInviteModal.set(false);
    }).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Failed to send invitation email';
      if (!this.emailService.isConfigured) {
        this.toast.show('Email service not configured. See environment.ts to set up EmailJS.', 'warning');
      } else {
        this.toast.show(msg, 'error');
      }
      this.store.inviteMember(newMember);
      this.activity.log({
        type: 'member_invited', entityId: newMember.id, entityTitle: name,
        userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
        description: `Invited ${name} as ${this.inviteRole()}`
      });
      this.notifService.push({ title: 'Member Invited (email failed)', message: `${name} was added but the email could not be sent.`, type: 'warning' });
      this.showInviteModal.set(false);
    }).finally(() => {
      this.isSendingInvite.set(false);
    });
  }

  @HostListener('document:keydown.escape')
  closeModals(): void {
    this.showInviteModal.set(false);
    this.openMenuId.set(null);
    this.editingMemberId.set(null);
    this.showAssignModal.set(null);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.openMenuId() !== null) {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-menu]')) {
        this.openMenuId.set(null);
        this.editingMemberId.set(null);
      }
    }
  }

  openAssignModal(memberId: string): void {
    this.showAssignModal.set(memberId);
    this.openMenuId.set(null);
  }

  assignToBug(memberId: string, bugId: string): void {
    const bug = this.bugStore.bugs().find(b => b.id === bugId);
    if (!bug) return;
    const member = this.store.members().find(m => m.id === memberId);
    if (!member) return;
    if (bug.assigneeId === memberId) {
      this.toast.show(`${member.name} is already assigned to "${bug.title}"`, 'warning');
      this.showAssignModal.set(null);
      return;
    }
    this.bugStore.updateBug({ ...bug, assigneeId: memberId, updatedAt: new Date().toISOString() });
    this.toast.show(`Assigned ${member.name} to "${bug.title}"`, 'success');
    this.activity.log({
      type: 'bug_updated', entityId: bugId, entityTitle: bug.title,
      userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
      description: `Assigned ${member.name} to bug "${bug.title}"`
    });
    this.showAssignModal.set(null);
  }

  changeRole(memberId: string, role: string): void {
    if (!ROLES.includes(role as Role)) {
      this.toast.show('Invalid role selected', 'error');
      return;
    }
    this.store.updateRole({id: memberId, role: role as Role});
    this.editingMemberId.set(null);
    this.openMenuId.set(null);
  }

  removeMember(memberId: string): void {
    if (this.authStore.user()?.id === memberId) {
      this.toast.show('You cannot remove yourself from the team', 'error');
      return;
    }
    this.removingMemberId.set(memberId);
    this.openMenuId.set(null);
  }

  confirmRemoveMember(): void {
    const memberId = this.removingMemberId();
    const member = this.store.members().find((m: Member) => m.id === memberId);
    if (!member || !memberId) return;
    
    this.store.removeMember({ id: memberId, name: member.name });

    const bugsToUnassign = this.bugStore.bugs().filter(b => b.assigneeId === memberId);
    for (const bug of bugsToUnassign) {
      this.bugStore.updateBug({ ...bug, assigneeId: null, updatedAt: new Date().toISOString() });
    }

    this.activity.log({
      type: 'member_removed', entityId: memberId, entityTitle: member.name,
      userId: this.authStore.user()?.id || 'me', userName: this.authStore.user()?.fullName || 'You',
      description: `Removed ${member.name} from the team`
    });
    this.removingMemberId.set(null);
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
