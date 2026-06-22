import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
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
          Sign in to your tracker
        </h2>
        <p class="mt-2 text-center text-sm text-zinc-600">
          Or
          <a routerLink="/register" class="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            create a complimentary account
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

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label for="usernameOrEmail" class="block text-sm font-semibold text-zinc-700">
                Username or Email Address
              </label>
              <div class="mt-1.5 relative rounded-md">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <mat-icon class="text-base">alternate_email</mat-icon>
                </div>
                <input
                  id="usernameOrEmail"
                  type="text"
                  formControlName="usernameOrEmail"
                  placeholder="name@example.com or username"
                  class="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-zinc-900 placeholder-zinc-400 text-sm"
                  [class.border-red-400]="submitted() && loginForm.get('usernameOrEmail')?.invalid"
                />
              </div>
              @if (submitted() && loginForm.get('usernameOrEmail')?.invalid) {
                <p class="mt-1.5 text-xs text-red-500 font-medium">Username or Email is required</p>
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
                  [class.border-red-400]="submitted() && loginForm.get('password')?.invalid"
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <mat-icon class="text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (submitted() && loginForm.get('password')?.invalid) {
                <p class="mt-1.5 text-xs text-red-500 font-medium">Password must be at least 4 characters long</p>
              }
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="w-full h-11 flex justify-center items-center gap-2 px-4 py-2.5 border border-transparent rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 shadow-sm shadow-indigo-600/10 cursor-pointer transition-colors active:bg-indigo-700"
              >
                <mat-icon class="text-lg">login</mat-icon>
                Sign In
              </button>
            </div>
          </form>

          <div class="mt-6 flex flex-col gap-2 bg-zinc-50 p-4 border border-zinc-100 rounded-2xl text-xs text-zinc-500">
            <span class="font-bold text-zinc-700 uppercase tracking-wider text-[10px]">Demo Credentials</span>
            <div class="flex justify-between">
              <span>Login: <strong class="text-zinc-700 select-all">candidate</strong> or <strong class="text-zinc-700 select-all">rosepiedrasingco123&#64;gmail.com</strong></span>
              <span>Pass: <strong class="text-zinc-700 select-all font-mono">admin123</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  showPassword = signal(false);
  submitted = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    usernameOrEmail: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor() {
    // Seed standard dummy user for convenience in standard exploration session
    this.auth.register('candidate', 'rosepiedrasingco123@gmail.com', 'admin123');
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      return;
    }

    const { usernameOrEmail, password } = this.loginForm.value;
    const res = this.auth.login(usernameOrEmail, password);

    if (res.success) {
      this.successMessage.set(res.message);
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
    } else {
      this.errorMessage.set(res.message);
    }
  }
}
