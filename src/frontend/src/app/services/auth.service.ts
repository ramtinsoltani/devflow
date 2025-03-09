import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** Emits authentication changes. */
  public onAuthStateChanged$ = new Observable<User | null>(subscriber => this.auth.onAuthStateChanged(subscriber));

  constructor(
    private auth: Auth,
    private router: Router
  ) { }

  /**
   * Displays an OAuth sign in pop up and redirects user to landing page after successful login.
   */
  public async signIn(): Promise<void> {

    await signInWithPopup(this.auth, new GoogleAuthProvider());

    this.router.navigate(['/']);

  }

  /**
   * Signs the current user out (if signed in) and navigates to login page.
   */
  public async signOut(): Promise<void> {

    await this.auth.signOut();

    this.router.navigate(['/login']);

  }

  /**
   * Returns the current user (or null if not logged in).
   */
  public get currentUser(): User | null {

    return this.auth.currentUser;

  }

  /**
   * Resolves when the auth state has settled with the initial value.
   * @returns A void promise
   */
  public waitForAuthReady(): Promise<void> {

    return this.auth.authStateReady();

  }

}
