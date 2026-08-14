import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Temporary until login is implemented
  private userId = 'badb8d32-c7d2-4787-941c-f754936f7ed1';

  getUserId(): string {
    return this.userId;
  }

  setUserId(id: string): void {
    this.userId = id;
  }
}