import { Injectable } from '@angular/core';
import { Auth, signInWithPopup, GoogleAuthProvider, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /** Emits authentication changes. */
  public onAuthStateChanged$ = new Observable<User | null>(subscriber => this.auth.onAuthStateChanged(subscriber));

  constructor(
    private auth: Auth
  ) { }

  /**
   * Displays an OAuth sign in pop up.
   */
  public signIn() {

    return signInWithPopup(this.auth, new GoogleAuthProvider());

  }

  /**
   * Signs the current user out (if signed in).
   */
  public signOut(): Promise<void> {

    return this.auth.signOut();

  }

  /**
   * Returns the current user (or null if not logged in).
   */
  public get currentUser(): User | null {

    return this.auth.currentUser;

  }

}
