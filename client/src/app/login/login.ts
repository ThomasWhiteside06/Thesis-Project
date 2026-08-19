import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

import {  loginService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="login-container">

      <h1>Login</h1>

      <form (submit)="onLogin($event)" class="form">

        <label>Email</label>
        <input
          type="email"
          [value]="email()"
          (input)="onEmailInput($event)"
          required
        />

        <label>Password</label>
        <input
          type="password"
          [value]="password()"
          (input)="onPasswordInput($event)"
          required
        />

        <button type="submit">Login</button>
      </form>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <hr />

      <button class="logout-btn" (click)="onLogout()">Logout</button>

    </div>
  `,
  styles: [`
    .login-container {
      width: 800px;
      min-height: 600px;
      margin: 120px auto;
      padding: 50px;
      border-radius: 16px;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
      gap: 30px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    input {
      padding: 14px;
      font-size: 1.1rem;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    button {
      padding: 16px;
      font-size: 1.1rem;
      background: #333;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }

    .logout-btn {
      background: #b30000;
    }

    .error {
      color: red;
      font-weight: bold;
      font-size: 1.1rem;
    }
  `]
})
export class AppLogin{
  private readonly auth = inject(loginService);
  private readonly router = inject(Router);

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

    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        this.auth.getMe().subscribe({
          next: () => this.router.navigateByUrl('/budget'),
          error: () => this.error.set('Failed to verify login')
        });
      },
      error: () => this.error.set('Invalid email or password')
    });
  }

  
  onLogout() {
    this.auth.logout().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }
}
