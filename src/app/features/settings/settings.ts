import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, LucideIconData, User, Settings as SettingsIcon, Bell, Shield, Paintbrush, Moon, Sun, Camera, Download, Upload, Trash2, Check, X } from 'lucide-angular';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { fadeAnimation, slideInAnimation } from '../../core/animations/ui.animations';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { AuthStore } from '../../core/stores/auth.store';
import { ToastService } from '../../core/services/toast.service';
import { ExportService } from '../../core/services/export.service';
import { NotificationService } from '../../core/services/notification.service';
import { RbacService } from '../../core/services/rbac.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule, ConfirmDialog],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  animations: [fadeAnimation, slideInAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {
  readonly themeService = inject(ThemeService);
  readonly authStore = inject(AuthStore);
  readonly toast = inject(ToastService);
  readonly exportService = inject(ExportService);
  readonly notifService = inject(NotificationService);
  readonly rbac = inject(RbacService);
  private readonly fb = inject(FormBuilder);

  activeTab = signal('profile');
  showDeleteConfirm = signal(false);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: [this.authStore.user()?.fullName?.split(' ')[0] ?? 'Jane', Validators.required],
    lastName: [this.authStore.user()?.fullName?.split(' ').slice(1).join(' ') ?? 'Doe', Validators.required],
    email: [this.authStore.user()?.email ?? 'jane.doe@bugtrackr.com', [Validators.required, Validators.email]],
    bio: ['']
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  // Notification prefs (signals are fine for simple booleans)
  notifBugAssigned = signal(true);
  notifCommentAdded = signal(true);
  notifStatusChanged = signal(false);
  notifWeeklyDigest = signal(true);

  // Icons
  readonly User = User;
  readonly SettingsIcon = SettingsIcon;
  readonly Bell = Bell;
  readonly Shield = Shield;
  readonly Paintbrush = Paintbrush;
  readonly Moon = Moon;
  readonly Sun = Sun;
  readonly Camera = Camera;
  readonly Download = Download;
  readonly Upload = Upload;
  readonly Trash = Trash2;
  readonly Check = Check;
  readonly X = X;

  readonly themes: { id: Theme; label: string; desc: string; icon: LucideIconData }[] = [
    { id: 'dark', label: 'Midnight Dark', desc: 'High-contrast, eye-friendly', icon: Moon },
    { id: 'light', label: 'Classic Light', desc: 'Clean and bright', icon: Sun },
    { id: 'rose', label: 'Rose Garden', desc: 'Warm pink tones', icon: Moon },
    { id: 'ocean', label: 'Deep Ocean', desc: 'Cool blue palette', icon: Moon },
    { id: 'forest', label: 'Deep Forest', desc: 'Natural green tones', icon: Moon }
  ];

  setTab(tab: string): void { this.activeTab.set(tab); }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    const user = this.authStore.user();
    if (user) {
      const { firstName, lastName, email } = this.profileForm.getRawValue();
      const updatedUser = {
        ...user,
        fullName: `${firstName} ${lastName}`.trim(),
        email
      };
      this.authStore.login(localStorage.getItem('token') || '', updatedUser);
    }
    this.toast.show('Profile updated successfully', 'success');
    this.notifService.push({
      title: 'Profile Updated',
      message: 'Your profile information has been saved.',
      type: 'success'
    });
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.toast.show('Passwords do not match', 'error');
      return;
    }
    this.passwordForm.reset();
    this.toast.show('Password updated successfully', 'success');
  }

  exportJSON(): void {
    this.exportService.exportJSON();
    this.toast.show('Data exported as JSON', 'success');
  }

  exportCSV(): void {
    this.exportService.exportBugsCSV();
    this.toast.show('Bugs exported as CSV', 'success');
  }

  importData(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = this.exportService.importJSON(e.target?.result as string);
        this.toast.show(`Imported ${result.bugs} bugs and ${result.projects} projects`, 'success');
      } catch {
        this.toast.show('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    this.toast.show(`Theme changed to ${theme}`, 'success');
  }

  saveNotifications(): void {
    this.toast.show('Notification preferences saved', 'success');
  }

  confirmDeleteAccount(): void {
    this.showDeleteConfirm.set(true);
  }

  deleteAccount(): void {
    this.showDeleteConfirm.set(false);
    this.toast.show('Account deleted', 'error');
    this.authStore.logout();
  }
}
