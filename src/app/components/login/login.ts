import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  auth = inject(AuthService);
  email = signal('');
  password = signal('');

  doLogin() {
    this.auth.login(this.email(), this.password());
    this.password.set('');
  }
}
