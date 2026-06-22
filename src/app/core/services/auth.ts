import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/models';

const USERS_KEY = 'jta_registered_users';
const CURRENT_USER_KEY = 'jta_current_user';

interface UserRecord extends User {
  passwordHash: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  // Signals for responsive global state
  private currentUserSignal = signal<User | null>(null);

  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        try {
          this.currentUserSignal.set(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }
    }
  }

  private getUsers(): UserRecord[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const val = localStorage.getItem(USERS_KEY);
    return val ? JSON.parse(val) : [];
  }

  private saveUsers(users: UserRecord[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  register(username: string, email: string, password: string): { success: boolean; message: string } {
    const users = this.getUsers();
    
    // Check if account with email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    // Check if username already exists
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'This username is already taken.' };
    }

    const newUser: UserRecord = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      username,
      email,
      passwordHash: btoa(password), // simple base64 "hash" for localized sandbox preservation
    };

    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: 'Registration successful!' };
  }

  login(emailOrUsername: string, password: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const searchVal = emailOrUsername.toLowerCase();
    
    const user = users.find(u => 
      u.email.toLowerCase() === searchVal || 
      u.username.toLowerCase() === searchVal
    );

    if (!user) {
      return { success: false, message: 'Invalid username/email or password.' };
    }

    const decrypted = btoa(password);
    if (user.passwordHash !== decrypted) {
      return { success: false, message: 'Invalid username/email or password.' };
    }

    // Set interactive state and session
    const sessionUser: User = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    }
    this.currentUserSignal.set(sessionUser);

    return { success: true, message: `Welcome back, ${user.username}!` };
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    this.currentUserSignal.set(null);
  }
}
