import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../../../core/stores/auth.store';
import { LucideAngularModule, Eye, EyeOff, Loader2, Upload, Check, ChevronRight, ChevronLeft, Bug } from 'lucide-angular';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/enums/role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  
  // Icons
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Loader2 = Loader2;
  readonly Upload = Upload;
  readonly Check = Check;
  readonly ChevronRight = ChevronRight;
  readonly ChevronLeft = ChevronLeft;
  readonly BugIcon = Bug;

  currentStep = 1;
  showPassword = false;
  passwordStrength = 0; // 0-4

  readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: (control) => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;
      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordsMismatch: true };
      }
      return null;
    }
  });

  get isLoading(): boolean {
    return this.authStore.isLoading();
  }

  get error(): string | null {
    return this.authStore.error();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      if (this.registerForm.get('fullName')?.invalid || this.registerForm.get('email')?.invalid) {
        this.registerForm.get('fullName')?.markAsTouched();
        this.registerForm.get('email')?.markAsTouched();
        return;
      }
      this.currentStep = 2;
    }
  }

  prevStep(): void {
    this.currentStep = 1;
  }

  checkPasswordStrength(): void {
    const pwd = this.registerForm.get('password')?.value || '';
    let strength = 0;
    if (pwd.length > 7) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    this.passwordStrength = strength;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.registerForm.get('password')?.value !== this.registerForm.get('confirmPassword')?.value) {
      this.authStore.setError('Passwords do not match');
      return;
    }

    this.authStore.setLoading(true);

    // Mock API
    setTimeout(() => {
      const { email, fullName } = this.registerForm.getRawValue();
      const mockUser: User = {
        id: 'usr-' + Date.now().toString(),
        fullName,
        email,
        avatarUrl: null,
        role: Role.Developer,
        createdAt: new Date().toISOString()
      };

      // Check registered users (but do NOT store passwords)
      try {
        const usersRaw = localStorage.getItem('bugtrackr_users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];

        if (users.some((u: { email: string }) => u.email === email)) {
          this.authStore.setError('Email already exists');
          this.authStore.setLoading(false);
          return;
        }

        users.push({ id: mockUser.id, fullName, email, role: Role.Developer });
        localStorage.setItem('bugtrackr_users', JSON.stringify(users));
      } catch {
        // Ignore parsing errors
      }

      // Sync to team members
      try {
        const membersRaw = localStorage.getItem('bugtrackr_members');
        const members = membersRaw ? JSON.parse(membersRaw) : [];
        if (!members.some((m: { id: string }) => m.id === mockUser.id)) {
          const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          const colors = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--info)', 'var(--error)'];
          members.push({
            id: mockUser.id, name: fullName, email, role: Role.Developer,
            status: 'Pending', initials,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
          localStorage.setItem('bugtrackr_members', JSON.stringify(members));
        }
      } catch {
        // Storage unavailable
      }

      this.authStore.login('mock-jwt-token-new', mockUser);
    }, 1500);
  }
}
