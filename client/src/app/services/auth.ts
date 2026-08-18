import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Temporary until login is implemented
  private userId = '8dda761a-af2a-4640-869b-2659354766e5'; //this is the account id this will change if we get time

  getUserId(): string {
    return this.userId;
  }

  setUserId(id: string): void {
    this.userId = id;
  }
}