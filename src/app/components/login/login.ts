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
  username = signal('');
  password = signal('');
  mode = signal<'login' | 'register'>('login');

  doLogin() {
    this.auth.login(this.username(), this.password());
    this.password.set('');
  }

  doRegister() {
    this.auth.register(this.username(), this.password());
    this.password.set('');
  }

  switchMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.auth.loginError.set('');
    this.auth.registerStatus.set('idle');
    this.auth.registerError.set('');
    this.username.set('');
    this.password.set('');
  }
}
