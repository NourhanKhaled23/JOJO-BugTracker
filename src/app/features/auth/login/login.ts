import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../store/auth.store';
import { AuthService } from '../../../core/auth/auth.service';
import { LucideAngularModule, Eye, EyeOff, Loader2, Info, ArrowRight, Bug, AlertCircle } from 'lucide-angular';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  
  // Lucide Icons
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Loader2 = Loader2;
  readonly Info = Info;
  readonly ArrowRight = ArrowRight;
  readonly BugIcon = Bug;
  readonly AlertCircle = AlertCircle;

  showPassword = false;
  hasErrorShake = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  get isLoading() {
    return this.authStore.isLoading();
  }

  get error() {
    return this.authStore.error();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authStore.setLoading(true);

    const { email } = this.loginForm.getRawValue();
    const password = this.loginForm.get('password')?.value || '';

    const { user, error } = this.authService.loginWithCredentials(email, password);

    if (user) {
      this.authStore.login('mock-jwt-token-' + user.id, user);
      const params = new URLSearchParams(window.location.search);
      const returnUrl = params.get('returnUrl');
      if (returnUrl) {
        setTimeout(() => this.router.navigateByUrl(returnUrl), 0);
      }
    } else {
      this.authStore.setLoading(false);
      this.authStore.setError(error!);
      this.triggerShakeAnimation();
    }
  }

  private triggerShakeAnimation(): void {
    this.hasErrorShake.set(true);
    setTimeout(() => this.hasErrorShake.set(false), 500); // Remove class after animation
  }
}
