import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Application } from '../../core/services/application';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-dashboard',
  imports: [RouterLink, MatIconModule, CurrencyPipe, DatePipe, PercentPipe],
  template: `
    <div class="space-y-8 font-sans">
      <!-- Greeting and Header Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">Career Hub</h2>
          <p class="text-sm text-zinc-500 mt-1">Supercharge your job search pipeline and analyze response metrics over time.</p>
        </div>
        <div>
          <a
            routerLink="/applications"
            class="inline-flex items-center gap-2 px-5 py-2.5 h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/10 cursor-pointer transition-colors"
          >
            <mat-icon class="text-lg">add</mat-icon>
            Manage Applications
          </a>
        </div>
      </div>

      <!-- Quick Summary Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- Total Card -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col justify-between h-32 group hover:border-indigo-200 transition-all">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total</span>
            <div class="p-1.5 rounded-lg bg-zinc-50 text-zinc-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <mat-icon class="text-lg leading-none">assessment</mat-icon>
            </div>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-zinc-900 leading-none">{{ tracker.stats().total }}</p>
            <p class="text-[10px] text-zinc-400 mt-1.5">Submitted jobs</p>
          </div>
        </div>

        <!-- Pending Card -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col justify-between h-32 group hover:border-amber-200 transition-all">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending</span>
            <div class="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <mat-icon class="text-lg leading-none">hourglass_empty</mat-icon>
            </div>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-zinc-900 leading-none">{{ tracker.stats().pending }}</p>
            <p class="text-[10px] text-zinc-400 mt-1.5">Awaiting feedback</p>
          </div>
        </div>

        <!-- Interview Card -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col justify-between h-32 group hover:border-indigo-200 transition-all">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Interviews</span>
            <div class="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <mat-icon class="text-lg leading-none">forum</mat-icon>
            </div>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-zinc-900 leading-none">{{ tracker.stats().interview }}</p>
            <p class="text-[10px] text-zinc-400 mt-1.5">Active calls scheduled</p>
          </div>
        </div>

         <!-- Hired Card -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col justify-between h-32 group hover:border-emerald-200 transition-all">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Hired</span>
            <div class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <mat-icon class="text-lg leading-none">emoji_events</mat-icon>
            </div>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-zinc-900 leading-none">{{ tracker.stats().hired }}</p>
            <p class="text-[10px] text-zinc-400 mt-1.5">Offers signed 🎉</p>
          </div>
        </div>

        <!-- Rejected Card -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200/60 flex flex-col justify-between h-32 group hover:border-red-200 transition-all col-span-2 lg:col-span-1">
          <div class="flex justify-between items-start">
            <span class="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Rejected</span>
            <div class="p-1.5 rounded-lg bg-red-50 text-red-600">
              <mat-icon class="text-lg leading-none">highlight_off</mat-icon>
            </div>
          </div>
          <div>
            <p class="text-3xl font-extrabold text-zinc-900 leading-none">{{ tracker.stats().rejected }}</p>
            <p class="text-[10px] text-zinc-400 mt-1.5">Archived application loops</p>
          </div>
        </div>
      </div>

      <!-- Advanced Metrical Insights Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Visual Funnel & Analytics -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/60 space-y-6 lg:col-span-1">
          <div>
            <h3 class="text-sm font-bold text-zinc-900 uppercase tracking-wider">Pipeline Analytics</h3>
            <p class="text-xs text-zinc-500 mt-0.5">Automated success conversion metrics.</p>
          </div>

          <div class="space-y-4">
            <!-- Interactivity conversion rate progress -->
            <div>
              <div class="flex justify-between items-center text-xs text-zinc-600 font-semibold mb-1.5">
                <span>Response Rate</span>
                <span>{{ responseRate() | percent:'1.0-1' }}</span>
              </div>
              <div class="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-500 rounded-full" [style.width.%]="responseRate() * 100"></div>
              </div>
              <p class="text-[10px] text-zinc-400 mt-1">Interviews & offers over total submissions.</p>
            </div>

            <div>
              <div class="flex justify-between items-center text-xs text-zinc-600 font-semibold mb-1.5">
                <span>Offer Conversion Rate</span>
                <span>{{ offerRate() | percent:'1.0-1' }}</span>
              </div>
              <div class="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 rounded-full" [style.width.%]="offerRate() * 100"></div>
              </div>
              <p class="text-[10px] text-zinc-400 mt-1">Offers received over scheduled interviews.</p>
            </div>

            <hr class="border-zinc-100" />

            <!-- Financial context block -->
            <div class="bg-zinc-50 p-4 border border-zinc-100 rounded-xl space-y-2">
              <div class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Salary statistics</div>
              <div class="flex justify-between items-baseline">
                <span class="text-xs text-zinc-600">Average Offered</span>
                <span class="text-lg font-bold text-zinc-900">{{ averageSalary() | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="flex justify-between items-baseline">
                <span class="text-xs text-zinc-600">Maximum Ceiling</span>
                <span class="text-sm font-semibold text-zinc-700">{{ maxSalary() | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Applications Table Section -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-zinc-200/60 lg:col-span-2 space-y-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-bold text-zinc-900 uppercase tracking-wider">Recent Activity</h3>
              <p class="text-xs text-zinc-500 mt-0.5">The most recently logged opportunities.</p>
            </div>
            <a
              routerLink="/applications"
              class="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors group"
            >
              See all
              <mat-icon class="text-xs group-hover:translate-x-0.5 transition-transform">arrow_forward</mat-icon>
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b border-zinc-100 text-xs font-bold uppercase tracking-wider text-zinc-400">
                  <th class="py-3 px-4">Company</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-1 hidden sm:table-cell text-right">Offer Target</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4 hidden md:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-50 text-zinc-700">
                @for (app of recentApps(); track app.id) {
                  <tr class="hover:bg-zinc-50/50 transition-colors">
                    <td class="py-3.5 px-4 font-semibold text-zinc-900">{{ app.companyName }}</td>
                    <td class="py-3.5 px-4 max-w-[150px] truncate text-xs text-zinc-600">{{ app.jobPosition }}</td>
                    <td class="py-3.5 px-1 hidden sm:table-cell text-right font-mono text-xs text-zinc-600">
                      @if (app.salaryOffered) {
                        {{ app.salaryOffered | currency:'USD':'symbol':'1.0-0' }}
                      } @else {
                        <span class="text-zinc-400">—</span>
                      }
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span [class]="getStatusClass(app.status)">
                        {{ app.status }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-xs font-medium text-zinc-400 hidden md:table-cell leading-none">{{ app.applicationDate | date:'mediumDate' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="5" class="py-12 text-center text-sm text-zinc-400 space-y-2">
                      <mat-icon class="text-zinc-300 text-3xl">inbox</mat-icon>
                      <p>No job applications logged or active yet.</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  tracker = inject(Application);

  recentApps = computed(() => {
    // Only display up to 4 applications on core dashboard quick table
    return this.tracker.userApplications().slice(0, 4);
  });

  responseRate = computed(() => {
    const list = this.tracker.userApplications();
    if (list.length === 0) return 0;
    const responded = list.filter(a => a.status === 'Interview' || a.status === 'Hired' || a.status === 'Rejected').length;
    return responded / list.length;
  });

  offerRate = computed(() => {
    const list = this.tracker.userApplications();
    const interviewed = list.filter(a => a.status === 'Interview' || a.status === 'Hired').length;
    if (interviewed === 0) return 0;
    const hired = list.filter(a => a.status === 'Hired').length;
    return hired / interviewed;
  });

  averageSalary = computed(() => {
    const list = this.tracker.userApplications().filter(a => a.salaryOffered !== null && a.salaryOffered > 0);
    if (list.length === 0) return 0;
    const total = list.reduce((sum, current) => sum + (current.salaryOffered || 0), 0);
    return total / list.length;
  });

  maxSalary = computed(() => {
    const list = this.tracker.userApplications().filter(a => a.salaryOffered !== null && a.salaryOffered > 0);
    if (list.length === 0) return 0;
    return Math.max(...list.map(a => a.salaryOffered || 0));
  });

  getStatusClass(status: string): string {
    const base = 'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider leading-none border';
    switch (status) {
      case 'Hired':
        return `${base} bg-emerald-50 border-emerald-100 text-emerald-700`;
      case 'Interview':
        return `${base} bg-indigo-50 border-indigo-100 text-indigo-700`;
      case 'Pending':
        return `${base} bg-amber-50 border-amber-100 text-amber-700`;
      case 'Rejected':
        return `${base} bg-zinc-100 border-zinc-200 text-zinc-600`;
      default:
        return `${base} bg-zinc-50 border-zinc-100 text-zinc-600`;
    }
  }
}
