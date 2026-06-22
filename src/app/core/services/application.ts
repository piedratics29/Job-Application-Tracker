import { Injectable, signal, computed, inject } from '@angular/core';
import { Auth } from './auth';
import { JobApplication } from '../models/models';

const APPLICATIONS_KEY = 'jta_applications';

@Injectable({
  providedIn: 'root',
})
export class Application {
  private auth = inject(Auth);

  // Private signal containing all applications in localStorage
  private allApplicationsSignal = signal<JobApplication[]>([]);

  // Computed signal representing applications for the current logged in user
  userApplications = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return [];
    
    const apps = this.allApplicationsSignal().filter(app => app.userId === user.id);
    
    // If user is logged in but has zero applications, they might be new.
    // Let's seed 4 realistic job applications for them to explore the tracker's metrics right away!
    if (apps.length === 0) {
      return this.seedDemoApplications(user.id);
    }
    
    // Sort by application date or creation date descending by default
    return [...apps].sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
  });

  // Statistics derived responsively via signals
  stats = computed(() => {
    const list = this.userApplications();
    return {
      total: list.length,
      pending: list.filter(a => a.status === 'Pending').length,
      interview: list.filter(a => a.status === 'Interview').length,
      rejected: list.filter(a => a.status === 'Rejected').length,
      hired: list.filter(a => a.status === 'Hired').length,
    };
  });

  constructor() {
    this.loadApplications();
  }

  private loadApplications(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(APPLICATIONS_KEY);
      if (saved) {
        try {
          this.allApplicationsSignal.set(JSON.parse(saved));
        } catch {
          this.allApplicationsSignal.set([]);
        }
      }
    }
  }

  private saveApplications(apps: JobApplication[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    }
    this.allApplicationsSignal.set(apps);
  }

  private seedDemoApplications(userId: string): JobApplication[] {
    const today = new Date();
    const seedApps: JobApplication[] = [
      {
        id: 'app_seed1',
        userId,
        companyName: 'Google',
        jobPosition: 'Senior Frontend Engineer',
        salaryOffered: 165000,
        applicationDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        status: 'Interview',
        notes: 'Recruiter call went super well! Technical screen scheduled for next Friday focusing on frontend systems and Angular concepts.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'app_seed2',
        userId,
        companyName: 'Airbnb',
        jobPosition: 'Staff UI Designer / Developer',
        salaryOffered: 180000,
        applicationDate: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days ago
        status: 'Pending',
        notes: 'Submitted portfolio link along with resume. Got an automated email from the hiring lead that they are reviewing portfolios.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'app_seed3',
        userId,
        companyName: 'Stripe',
        jobPosition: 'Full Stack Engineer (Billing Systems)',
        salaryOffered: 175000,
        applicationDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ago
        status: 'Hired',
        notes: 'Offer extended and signed! Background check cleared. Absolutely excited to join the merchant workflows squad.',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'app_seed4',
        userId,
        companyName: 'Netflix',
        jobPosition: 'Product Engineer',
        salaryOffered: 210000,
        applicationDate: new Date(today.getTime() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 22 days ago
        status: 'Rejected',
        notes: 'Completed final technical round. Got kind and constructive feedback; they decided to proceed with an internal candidate.',
        createdAt: new Date().toISOString(),
      },
    ];

    // Persist seeded data so it's persistent and acts as a standard DB record
    const all = [...this.allApplicationsSignal(), ...seedApps];
    this.saveApplications(all);
    return seedApps;
  }

  create(appData: Omit<JobApplication, 'id' | 'userId' | 'createdAt'>): JobApplication {
    const user = this.auth.currentUser();
    if (!user) {
      throw new Error('User must be authenticated to create a job application.');
    }

    const newApp: JobApplication = {
      ...appData,
      id: 'app_' + Math.random().toString(36).substring(2, 11),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    const updated = [...this.allApplicationsSignal(), newApp];
    this.saveApplications(updated);
    return newApp;
  }

  update(id: string, updatedFields: Partial<Omit<JobApplication, 'id' | 'userId' | 'createdAt'>>): JobApplication {
    const all = this.allApplicationsSignal();
    const index = all.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Job application with ID ${id} not found.`);
    }

    const updatedApp: JobApplication = {
      ...all[index],
      ...updatedFields,
    };

    const newAll = [...all];
    newAll[index] = updatedApp;
    this.saveApplications(newAll);
    return updatedApp;
  }

  delete(id: string): void {
    const updated = this.allApplicationsSignal().filter(a => a.id !== id);
    this.saveApplications(updated);
  }

  getById(id: string): JobApplication | undefined {
    return this.allApplicationsSignal().find(a => a.id === id);
  }
}
