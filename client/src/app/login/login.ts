import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {  loginService } from './auth.service';
import { AuthStateService } from './AuthState.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class AppLogin{
  auth = inject(AuthStateService);
  

  email = signal('');
  password = signal('');
  error = signal('');

  
  onEmailInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.email.set(value);
  }

  onPasswordInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.password.set(value);
  }

  
  onLogin(event: Event) {
    event.preventDefault();
    this.auth.login(this.email(),this.password())
  }

  
  onLogout() {
    this.auth.logout()
  }
}
