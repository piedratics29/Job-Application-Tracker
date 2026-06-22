import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="min-h-screen min-w-0 overflow-x-hidden bg-zinc-50 flex font-sans">
      
      <!-- Desktop Sidebar -->
      <aside class="hidden lg:flex lg:w-64 lg:flex-col fixed lg:inset-y-0 bg-white border-r border-zinc-200/80 z-20">
        <!-- Logo Header -->
        <div class="flex items-center gap-2.5 px-6 h-16 border-b border-zinc-100">
          <div class="bg-indigo-600 text-white p-2 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-600/15">
            <mat-icon class="text-xl">work</mat-icon>
          </div>
          <span class="text-lg font-bold tracking-tight text-zinc-900">CareerPath</span>
          <span class="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ml-auto">pro</span>
        </div>

        <!-- Navigation Links -->
        <div class="flex-1 flex flex-col justify-between py-6 px-4">
          <nav class="space-y-1.5">
            <a
              routerLink="/dashboard"
              routerLinkActive="bg-indigo-50 text-indigo-600 font-semibold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all group"
            >
              <mat-icon class="text-zinc-400 group-hover:text-zinc-600 transition-colors">dashboard</mat-icon>
              Dashboard
            </a>
            
            <a
              routerLink="/applications"
              routerLinkActive="bg-indigo-50 text-indigo-600 font-semibold"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all group"
            >
              <mat-icon class="text-zinc-400 group-hover:text-zinc-600 transition-colors">assignment</mat-icon>
              Job Applications
            </a>
          </nav>

          <!-- User Quick Profile Footer -->
          <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100 flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {{ userInitials() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-zinc-900 truncate">{{ auth.currentUser()?.username }}</p>
                <p class="text-[10px] text-zinc-500 truncate">{{ auth.currentUser()?.email }}</p>
              </div>
            </div>
            
            <button
              (click)="onSignOut()"
              class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200 rounded-lg cursor-pointer transition-colors"
            >
              <mat-icon class="text-sm">logout</mat-icon>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <!-- Mobile Top Bar & Drawer Navigation -->
      <div class="flex-1 min-w-0 w-full flex flex-col lg:pl-64">
        <!-- Top Navbar Header -->
        <header class="sticky top-0 z-10 bg-white border-b border-zinc-200/80 min-h-16 flex items-center justify-between gap-3 px-3 py-2 sm:px-6">
          <div class="flex min-w-0 items-center gap-2 sm:gap-3">
            <!-- Hamburger menu button -->
            <button
              (click)="toggleMobileMenu()"
              class="lg:hidden shrink-0 p-2 rounded-xl text-zinc-500 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-600/10"
              aria-label="Toggle navigation menu"
            >
              <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
            </button>
            
            <h1 class="min-w-0 truncate text-sm sm:text-lg font-bold text-zinc-800 tracking-tight">
              Welcome back,
              <span class="text-indigo-600 font-extrabold select-all">{{ auth.currentUser()?.username }}</span>!
            </h1>
          </div>

          <!-- Extra metadata status badges -->
          <div class="flex items-center gap-3">
            <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Synchronized Portal
            </span>
          </div>
        </header>

        <!-- Mobile Drawer Menu Overlay -->
        @if (mobileMenuOpen()) {
          <button
            type="button"
            (click)="closeMobileMenu()"
            class="lg:hidden fixed inset-0 bg-black/40 z-30 transition-opacity block w-full h-full text-left border-none focus:outline-none cursor-default"
            aria-label="Close mobile menu"
          ></button>
          
          <aside class="lg:hidden fixed inset-y-0 left-0 w-[min(18rem,calc(100vw-2rem))] bg-white shadow-2xl z-40 flex flex-col justify-between py-6 px-4 animate-in slide-in-from-left duration-200">
            <div>
              <div class="flex items-center justify-between pb-6 border-b border-zinc-100 mb-6">
                <div class="flex items-center gap-2.5">
                  <div class="bg-indigo-600 text-white p-2 rounded-lg flex items-center justify-center shadow-sm">
                    <mat-icon class="text-xl">work</mat-icon>
                  </div>
                  <span class="text-lg font-bold tracking-tight text-zinc-900">CareerPath</span>
                </div>
                <button (click)="closeMobileMenu()" class="p-1 rounded-lg text-zinc-400 hover:bg-zinc-50">
                  <mat-icon>close</mat-icon>
                </button>
              </div>

              <nav class="space-y-1.5">
                <a
                  routerLink="/dashboard"
                  routerLinkActive="bg-indigo-50 text-indigo-600 font-semibold"
                  [routerLinkActiveOptions]="{ exact: true }"
                  (click)="closeMobileMenu()"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 group"
                >
                  <mat-icon>dashboard</mat-icon>
                  Dashboard
                </a>
                
                <a
                  routerLink="/applications"
                  routerLinkActive="bg-indigo-50 text-indigo-600 font-semibold"
                  (click)="closeMobileMenu()"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-zinc-600 hover:bg-zinc-50 group"
                >
                  <mat-icon>assignment</mat-icon>
                  Job Applications
                </a>
              </nav>
            </div>

            <!-- Profile & Log out on Mobile Drawer Footer -->
            <div class="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {{ userInitials() }}
                </div>
                <div>
                  <p class="text-xs font-semibold text-zinc-900">{{ auth.currentUser()?.username }}</p>
                  <p class="text-[10px] text-zinc-500">{{ auth.currentUser()?.email }}</p>
                </div>
              </div>
              <button
                (click)="onSignOut(); closeMobileMenu()"
                class="w-full h-9 flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-semibold border border-zinc-200 rounded-lg cursor-pointer"
              >
                <mat-icon class="text-sm">logout</mat-icon>
                Sign Out
              </button>
            </div>
          </aside>
        }

        <!-- Main Workspace Router Outlet -->
        <main class="flex-1 min-w-0 p-4 sm:p-6 xl:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  auth = inject(Auth);
  private router = inject(Router);

  mobileMenuOpen = signal(false);

  userInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return '?';
    return user.username.slice(0, 2).toUpperCase();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  onSignOut(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
