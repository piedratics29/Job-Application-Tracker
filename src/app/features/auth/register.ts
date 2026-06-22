import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <!-- Logo / Title -->
        <div class="flex justify-center items-center gap-3">
          <div class="bg-indigo-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center">
            <mat-icon class="text-2xl">work</mat-icon>
          </div>
          <span class="text-2xl font-bold tracking-tight text-zinc-900">CareerPath</span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold tracking-tight text-zinc-900">
          Create dynamic sandbox profile
        </h2>
        <p class="mt-2 text-center text-sm text-zinc-600">
          Or
          <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            log into existing account
          </a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow-sm border border-zinc-200/60 sm:rounded-2xl sm:px-10">
          @if (errorMessage()) {
            <div class="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-start gap-2.5 text-sm">
              <mat-icon class="text-red-500 shrink-0">error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          @if (successMessage()) {
            <div class="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-xl flex items-start gap-2.5 text-sm">
              <mat-icon class="text-emerald-500 shrink-0">check_circle_outline</mat-icon>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="username" class="block text-sm font-semibold text-zinc-700">
                Username
              </label>
              <div class="mt-1.5 relative rounded-md">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <mat-icon class="text-base">person</mat-icon>
                </div>
                <input
                  id="username"
                  type="text"
                  formControlName="username"
                  placeholder="john_doe"
                  class="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-zinc-900 placeholder-zinc-400 text-sm"
                  [class.border-red-400]="submitted() && registerForm.get('username')?.invalid"
                />
              </div>
              @if (submitted() && registerForm.get('username')?.invalid) {
                <p class="mt-1.5 text-xs text-red-500 font-medium">Username must be at least 3 characters long</p>
              }
            </div>

            <div>
              <label for="email" class="block text-sm font-semibold text-zinc-700">
                Email Address
              </label>
              <div class="mt-1.5 relative rounded-md">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <mat-icon class="text-base">mail</mat-icon>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="john@example.com"
                  class="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-zinc-900 placeholder-zinc-400 text-sm"
                  [class.border-red-400]="submitted() && registerForm.get('email')?.invalid"
                />
              </div>
              @if (submitted() && registerForm.get('email')?.invalid) {
                <p class="mt-1.5 text-xs text-red-500 font-medium">Please enter a valid email address</p>
              }
            </div>

            <div>
              <label for="password" class="block text-sm font-semibold text-zinc-700">
                Password
              </label>
              <div class="mt-1.5 relative rounded-md">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <mat-icon class="text-base">lock</mat-icon>
                </div>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="block w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-zinc-900 placeholder-zinc-400 text-sm"
                  [class.border-red-400]="submitted() && registerForm.get('password')?.invalid"
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <mat-icon class="text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (submitted() && registerForm.get('password')?.invalid) {
                <p class="mt-1.5 text-xs text-red-500 font-medium">Password must be at least 4 characters long</p>
              }
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="w-full h-11 flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-sm shadow-indigo-600/10 cursor-pointer transition-colors active:bg-indigo-700"
              >
                <mat-icon class="text-lg">person_add</mat-icon>
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  showPassword = signal(false);
  submitted = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.registerForm.invalid) {
      return;
    }

    const { username, email, password } = this.registerForm.value;
    const res = this.auth.register(username, email, password);

    if (res.success) {
      this.successMessage.set(res.message + ' Redirecting to login...');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1500);
    } else {
      this.errorMessage.set(res.message);
    }
  }
}
