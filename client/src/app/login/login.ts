import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {  loginService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
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
