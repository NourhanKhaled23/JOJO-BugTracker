import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '../store/auth.store';
import { LucideAngularModule, Eye, EyeOff, Loader2, Upload, Check, ChevronRight, ChevronLeft } from 'lucide-angular';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = inject(FormBuilder);
  private authStore = inject(AuthStore);
  
  // Icons
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly Loader2 = Loader2;
  readonly Upload = Upload;
  readonly Check = Check;
  readonly ChevronRight = ChevronRight;
  readonly ChevronLeft = ChevronLeft;

  currentStep = 1;
  showPassword = false;
  passwordStrength = 0; // 0-4

  registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
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

  nextStep() {
    if (this.currentStep === 1) {
      if (this.registerForm.get('fullName')?.invalid || this.registerForm.get('email')?.invalid) {
        this.registerForm.get('fullName')?.markAsTouched();
        this.registerForm.get('email')?.markAsTouched();
        return;
      }
      this.currentStep = 2;
    }
  }

  prevStep() {
    this.currentStep = 1;
  }

  checkPasswordStrength() {
    const pwd = this.registerForm.get('password')?.value || '';
    let strength = 0;
    if (pwd.length > 7) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    this.passwordStrength = strength;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.authStore.setError('Passwords do not match');
      return;
    }

    this.authStore.setLoading(true);

    // Mock API
    setTimeout(() => {
      const { email, fullName } = this.registerForm.getRawValue();
      const mockUser: User = {
        id: 'new-user-1',
        fullName,
        email,
        avatarUrl: null,
        role: 'owner',
        createdAt: new Date().toISOString()
      };
      this.authStore.login('mock-jwt-token-new', mockUser);
    }, 1500);
  }
}
