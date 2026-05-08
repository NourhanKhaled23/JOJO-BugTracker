import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../store/auth.store';
import { LucideAngularModule, Eye, EyeOff, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  
  // Lucide Icons
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Loader2 = Loader2;

  showPassword = false;
  hasErrorShake = false;

  loginForm = this.fb.nonNullable.group({
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authStore.setLoading(true);

    // Mock API call
    setTimeout(() => {
      const { email, password } = this.loginForm.getRawValue();
      
      if (email === 'test@test.com' && password === 'password') {
        const mockUser = {
          id: '1',
          fullName: 'Test User',
          email: 'test@test.com',
          avatarUrl: null,
          role: 'admin' as const,
          createdAt: new Date().toISOString()
        };
        this.authStore.login('mock-jwt-token-12345', mockUser);
      } else {
        this.authStore.setError('Invalid email or password');
        this.triggerShakeAnimation();
      }
    }, 1000);
  }

  private triggerShakeAnimation() {
    this.hasErrorShake = true;
    setTimeout(() => this.hasErrorShake = false, 500); // Remove class after animation
  }
}
