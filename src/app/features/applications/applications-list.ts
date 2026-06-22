import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Application } from '../../core/services/application';
import { JobApplication, ApplicationStatus, STATUS_OPTIONS } from '../../core/models/models';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-applications-list',
  imports: [ReactiveFormsModule, MatIconModule, CurrencyPipe, DatePipe],
  template: `
    <div class="space-y-6 font-sans">
      
      <!-- Top Action Hub Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">Job Applications</h2>
          <p class="text-sm text-zinc-500 mt-1">Keep track of your active opportunities, interviews, and progress timeline.</p>
        </div>
        <div>
          <button
            (click)="openCreateForm()"
            class="inline-flex items-center gap-2 px-5 py-2.5 h-10 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/10 cursor-pointer transition-colors"
          >
            <mat-icon class="text-lg">post_add</mat-icon>
            Add Application
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <!-- Interactive Search -->
        <div class="relative w-full md:max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <mat-icon class="text-lg">search</mat-icon>
          </div>
          <input
            type="text"
            [value]="searchQuery()"
            (input)="onSearchInput($event)"
            placeholder="Search by company or role..."
            class="block w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-all text-zinc-900 placeholder-zinc-400 text-sm h-10"
          />
        </div>

        <!-- Filter Pills Segment -->
        <div class="flex flex-wrap gap-1.5 w-full md:w-auto items-center">
          <span class="text-xs font-semibold text-zinc-400 mr-1.5 hidden lg:inline">Filter:</span>
          
          <button
            (click)="setFilter('All')"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            [class]="filterSelected() === 'All' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'"
          >
            All ({{ totalCount() }})
          </button>

          @for (opt of statusOptions; track opt) {
            <button
              (click)="setFilter(opt)"
              class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              [class]="filterSelected() === opt ? 'bg-indigo-600 text-white shadow-sm' : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:bg-zinc-100'"
            >
              {{ opt }} ({{ countByStatus(opt) }})
            </button>
          }
        </div>
      </div>

      <!-- Main Result List / Table -->
      <div class="bg-white rounded-2xl border border-zinc-200/60 shadow-sm overflow-hidden">
        
        <!-- Responsive Grid / Responsive Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="bg-zinc-50/70 border-b border-zinc-200/60 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th class="py-3 px-6">Company</th>
                <th class="py-3 px-6">Position</th>
                <th class="py-3 px-6 text-right">Offer Target</th>
                <th class="py-3 px-6">Applied Date</th>
                <th class="py-3 px-6 text-center">Status</th>
                <th class="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100/80 text-zinc-700">
              @for (app of filteredApplications(); track app.id) {
                <tr class="hover:bg-zinc-50/40 transition-colors group">
                  
                  <!-- Company Name -->
                  <td class="py-4 px-6">
                    <button
                      type="button"
                      (click)="openDetailView(app)"
                      class="font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors block cursor-pointer text-left focus:outline-none w-full"
                    >
                      {{ app.companyName }}
                    </button>
                  </td>

                  <!-- Position -->
                  <td class="py-4 px-6">
                    <span class="text-zinc-600 font-medium text-xs">{{ app.jobPosition }}</span>
                  </td>

                  <!-- Salary -->
                  <td class="py-4 px-6 text-right font-mono text-zinc-600 font-medium">
                    @if (app.salaryOffered) {
                      {{ app.salaryOffered | currency:'USD':'symbol':'1.0-0' }}
                    } @else {
                      <span class="text-zinc-400 italic font-sans text-xs">Unspecified</span>
                    }
                  </td>

                  <!-- Application Date -->
                  <td class="py-4 px-6 text-xs text-zinc-500 font-medium whitespace-nowrap">
                    {{ app.applicationDate | date:'mediumDate' }}
                  </td>

                  <!-- Status -->
                  <td class="py-4 px-6 text-center whitespace-nowrap">
                    <span [class]="getStatusClass(app.status)">
                      {{ app.status }}
                    </span>
                  </td>

                  <!-- Quick Actions Row -->
                  <td class="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                    <!-- Details button -->
                    <button
                      (click)="openDetailView(app)"
                      title="View Details"
                      class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <mat-icon class="text-lg">visibility</mat-icon>
                    </button>

                    <!-- Edit button -->
                    <button
                      (click)="openEditForm(app)"
                      title="Edit application"
                      class="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <mat-icon class="text-lg">edit</mat-icon>
                    </button>

                    <!-- Delete button with immediate check -->
                    <button
                      (click)="onDeleteConfirm(app)"
                      title="Remove application"
                      class="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <mat-icon class="text-lg">delete_sweep</mat-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-16 text-center text-sm text-zinc-400 space-y-3">
                    <div class="inline-flex p-3 rounded-full bg-zinc-50 text-zinc-400">
                      <mat-icon class="text-3xl leading-none">filter_list_off</mat-icon>
                    </div>
                    <p class="font-medium text-zinc-500">No applications match your filtering criteria.</p>
                    <p class="text-xs text-zinc-400">Clear filters or create a new application tracking sequence.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- FORMS OVERLAY MODAL (CREATE AND UPDATE) -->
      @if (isFormOpen()) {
        <div class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <!-- Modal Header -->
            <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <h3 class="text-base font-bold text-zinc-900 flex items-center gap-2">
                <mat-icon class="text-indigo-600">{{ isEditMode() ? 'edit_note' : 'post_add' }}</mat-icon>
                {{ isEditMode() ? 'Edit Opportunity Details' : 'Create Tracking Sequence' }}
              </h3>
              <button (click)="closeForm()" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Form Body -->
            <form [formGroup]="appForm" (ngSubmit)="onFormSubmit()" class="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              
              <!-- Company Name -->
              <div>
                <label for="form-companyName" class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Company Name *</label>
                <input
                  id="form-companyName"
                  type="text"
                  formControlName="companyName"
                  placeholder="e.g. Stripe, Google, Acme Inc."
                  class="block w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-all text-zinc-900 text-sm"
                  [class.border-red-400]="formSubmitted() && appForm.get('companyName')?.invalid"
                />
                @if (formSubmitted() && appForm.get('companyName')?.invalid) {
                  <p class="mt-1 text-xs text-red-500">Company Name is required</p>
                }
              </div>

              <!-- Job Position -->
              <div>
                <label for="form-jobPosition" class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Job Position *</label>
                <input
                  id="form-jobPosition"
                  type="text"
                  formControlName="jobPosition"
                  placeholder="e.g. Senior Frontend Developer"
                  class="block w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-all text-zinc-900 text-sm"
                  [class.border-red-400]="formSubmitted() && appForm.get('jobPosition')?.invalid"
                />
                @if (formSubmitted() && appForm.get('jobPosition')?.invalid) {
                  <p class="mt-1 text-xs text-red-500">Job Position is required</p>
                }
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Salary Offered -->
                <div>
                  <label for="form-salaryOffered" class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Salary Offered ($ / Year)</label>
                  <input
                    id="form-salaryOffered"
                    type="number"
                    formControlName="salaryOffered"
                    placeholder="e.g. 120000"
                    class="block w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-all text-zinc-900 text-sm font-mono"
                    [class.border-red-400]="formSubmitted() && appForm.get('salaryOffered')?.invalid"
                  />
                  @if (formSubmitted() && appForm.get('salaryOffered')?.invalid) {
                    <p class="mt-1 text-xs text-red-500">Please enter a valid numerical value</p>
                  }
                </div>

                <!-- Application Date -->
                <div>
                  <label for="form-applicationDate" class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Application Date *</label>
                  <input
                    id="form-applicationDate"
                    type="date"
                    formControlName="applicationDate"
                    class="block w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-all text-zinc-900 text-sm"
                    [class.border-red-400]="formSubmitted() && appForm.get('applicationDate')?.invalid"
                  />
                  @if (formSubmitted() && appForm.get('applicationDate')?.invalid) {
                    <p class="mt-1 text-xs text-red-500">Application Date is required</p>
                  }
                </div>
              </div>

              <!-- Status Option selector -->
              <div>
                <label for="form-status" class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Status Selection</label>
                <select
                  id="form-status"
                  formControlName="status"
                  class="block w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-all text-zinc-900 text-sm cursor-pointer"
                >
                  @for (opt of statusOptions; track opt) {
                    <option [value]="opt">{{ opt }}</option>
                  }
                </select>
              </div>

              <!-- Notes -->
              <div>
                <label for="form-notes" class="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Notes & Interactions</label>
                <textarea
                  id="form-notes"
                  formControlName="notes"
                  rows="3"
                  placeholder="Recruiter contact details, links to job specifications, interview prep notes, feedback logs, etc."
                  class="block w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-all text-zinc-900 text-sm resize-none"
                ></textarea>
              </div>

              <!-- Action buttons inside form -->
              <div class="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  (click)="closeForm()"
                  class="px-4 py-2 border border-zinc-200 text-zinc-700 font-semibold rounded-xl text-xs hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 cursor-pointer transition-colors"
                >
                  <mat-icon class="text-sm">save</mat-icon>
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- DETAIL VIEW SUMMARY DIALOG -->
      @if (isDetailOpen() && activeApp()) {
        <div class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div class="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            <!-- Company Info block -->
            <div class="px-6 py-5 bg-zinc-50 border-b border-zinc-100 flex items-start justify-between">
              <div>
                <span [class]="getStatusClass(activeApp()!.status)">{{ activeApp()!.status }}</span>
                <h3 class="text-xl font-extrabold text-zinc-900 mt-2">{{ activeApp()!.companyName }}</h3>
                <p class="text-sm font-semibold text-zinc-600">{{ activeApp()!.jobPosition }}</p>
              </div>
              <button (click)="closeDetailView()" class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer">
                <mat-icon>close</mat-icon>
              </button>
            </div>

            <!-- Detail Grid values -->
            <div class="px-6 py-5 space-y-5">
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Offer Target</span>
                  <span class="text-sm font-mono text-zinc-800 font-bold block mt-1.5">
                    @if (activeApp()!.salaryOffered) {
                      {{ activeApp()!.salaryOffered | currency:'USD':'symbol':'1.0-0' }}
                    } @else {
                      <span class="text-zinc-400 italic text-xs font-normal">Not specified</span>
                    }
                  </span>
                </div>

                <div class="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Date Logged</span>
                  <span class="text-sm text-zinc-800 font-semibold block mt-1.5">
                    {{ activeApp()!.applicationDate | date:'mediumDate' }}
                  </span>
                </div>
              </div>

              <!-- Notes block -->
              <div class="space-y-1.5">
                <span class="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Notes & Interactive Records</span>
                <div class="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-xs text-zinc-700 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {{ activeApp()!.notes || 'No interactive notes have been entered. Capture preparation details, contacts and interviews dates easily here!' }}
                </div>
              </div>
            </div>

            <!-- Footer Operations -->
            <div class="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
              <!-- Safety Delete button -->
              <button
                (click)="onDeleteConfirm(activeApp()!)"
                class="px-3.5 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <mat-icon class="text-sm">delete_outline</mat-icon>
                Delete File
              </button>

              <div class="flex items-center gap-2">
                <button
                  (click)="openEditForm(activeApp()!)"
                  class="px-3.5 py-2 border border-zinc-200 text-zinc-700 font-semibold rounded-lg text-xs hover:bg-zinc-150 transition-colors flex items-center gap-1 cursor-pointer bg-white"
                >
                  <mat-icon class="text-sm">edit</mat-icon>
                  Edit Details
                </button>
                <button
                  (click)="closeDetailView()"
                  class="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- POPUP CONFIRMATION SAFETY DELETE PROMPT -->
      @if (deleteConfirmTarget()) {
        <div class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-in fade-in duration-150">
          <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-zinc-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div class="flex gap-3 text-red-600">
              <mat-icon class="text-2xl shrink-0">warning</mat-icon>
              <div>
                <h4 class="font-bold text-zinc-900">Remove Application Tracking?</h4>
                <p class="text-xs text-zinc-500 mt-1 leading-normal">
                  Are you absolutely sure you want to remove <strong class="text-zinc-700">{{ deleteConfirmTarget()?.companyName }}</strong>'s slot tracking? This operation cannot be reverted.
                </p>
              </div>
            </div>
            
            <div class="flex justify-end gap-2.5 pt-1">
              <button
                (click)="cancelDelete()"
                class="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Discard
              </button>
              <button
                (click)="executeDelete()"
                class="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <mat-icon class="text-sm">delete</mat-icon>
                Proceed Delete
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class ApplicationsListComponent {
  tracker = inject(Application);
  private fb = inject(FormBuilder);

  statusOptions = STATUS_OPTIONS;

  // Search & Filters state
  searchQuery = signal('');
  filterSelected = signal<'All' | ApplicationStatus>('All');

  // Form dialog state
  isFormOpen = signal(false);
  isEditMode = signal(false);
  editTargetId = signal<string | null>(null);
  formSubmitted = signal(false);

  // Detail view state
  isDetailOpen = signal(false);
  activeApp = signal<JobApplication | null>(null);

  // Safety Delete Confirmation overlay state
  deleteConfirmTarget = signal<JobApplication | null>(null);

  appForm: FormGroup = this.fb.group({
    companyName: ['', Validators.required],
    jobPosition: ['', Validators.required],
    salaryOffered: [null, [Validators.min(0)]],
    applicationDate: [new Date().toISOString().split('T')[0], Validators.required],
    status: ['Pending', Validators.required],
    notes: [''],
  });

  // Derived properties counts
  totalCount = computed(() => this.tracker.userApplications().length);
  countByStatus(status: ApplicationStatus): number {
    return this.tracker.userApplications().filter(a => a.status === status).length;
  }

  // Multi-tier search and status filtering via signal sequence
  filteredApplications = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.filterSelected();
    const apps = this.tracker.userApplications();

    return apps.filter(app => {
      const matchQuery = !query || 
                         app.companyName.toLowerCase().includes(query) || 
                         app.jobPosition.toLowerCase().includes(query);
      const matchFilter = filter === 'All' || app.status === filter;
      return matchQuery && matchFilter;
    });
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  setFilter(filter: 'All' | ApplicationStatus): void {
    this.filterSelected.set(filter);
  }

  openCreateForm(): void {
    this.isEditMode.set(false);
    this.editTargetId.set(null);
    this.formSubmitted.set(false);
    this.appForm.reset({
      companyName: '',
      jobPosition: '',
      salaryOffered: null,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: '',
    });
    this.isFormOpen.set(true);
  }

  openEditForm(app: JobApplication): void {
    this.isEditMode.set(true);
    this.editTargetId.set(app.id);
    this.formSubmitted.set(false);
    
    this.appForm.patchValue({
      companyName: app.companyName,
      jobPosition: app.jobPosition,
      salaryOffered: app.salaryOffered,
      applicationDate: app.applicationDate,
      status: app.status,
      notes: app.notes,
    });
    
    this.isFormOpen.set(true);
  }

  closeForm(): void {
    this.isFormOpen.set(false);
  }

  onFormSubmit(): void {
    this.formSubmitted.set(true);
    if (this.appForm.invalid) {
      return;
    }

    const val = this.appForm.value;
    const cleanData = {
      companyName: val.companyName.trim(),
      jobPosition: val.jobPosition.trim(),
      salaryOffered: val.salaryOffered !== null ? Number(val.salaryOffered) : null,
      applicationDate: val.applicationDate,
      status: val.status as ApplicationStatus,
      notes: (val.notes || '').trim(),
    };

    if (this.isEditMode()) {
      const id = this.editTargetId();
      if (id) {
        this.tracker.update(id, cleanData);
        // Sync active detail if active detail represents edited item
        const active = this.activeApp();
        if (active && active.id === id) {
          const updatedRecord = this.tracker.getById(id);
          if (updatedRecord) {
            this.activeApp.set(updatedRecord);
          }
        }
      }
    } else {
      this.tracker.create(cleanData);
    }

    this.isFormOpen.set(false);
  }

  openDetailView(app: JobApplication): void {
    this.activeApp.set(app);
    this.isDetailOpen.set(true);
  }

  closeDetailView(): void {
    this.isDetailOpen.set(false);
    this.activeApp.set(null);
  }

  onDeleteConfirm(app: JobApplication): void {
    this.deleteConfirmTarget.set(app);
  }

  cancelDelete(): void {
    this.deleteConfirmTarget.set(null);
  }

  executeDelete(): void {
    const target = this.deleteConfirmTarget();
    if (target) {
      this.tracker.delete(target.id);
      
      // If the deleted application is currently viewed as active, shut the detail block
      const active = this.activeApp();
      if (active && active.id === target.id) {
        this.closeDetailView();
      }
      this.deleteConfirmTarget.set(null);
    }
  }

  getStatusClass(status: string): string {
    const base = 'inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest leading-none border';
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
