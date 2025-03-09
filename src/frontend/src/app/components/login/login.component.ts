import { Component } from '@angular/core';
import { ButtonComponent } from '../shared/button/button.component';
import { AuthService } from '@devflow/services';

@Component({
  selector: 'app-login',
  imports: [ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(
    private auth: AuthService
  ) { }

  public login(): void {

    this.auth.signIn();

  }

}
