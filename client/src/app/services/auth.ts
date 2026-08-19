import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Temporary until login is implemented
  private userId = 'badb8d32-c7d2-4787-941c-f754936f7ed1'; //this is the account id this will change if we get time
  private accountId = 'd16c886b-1481-4927-b651-64812e685403'; //this is the account id this will change if we get time

  getUserId(): string {
    return this.userId;
  }

  setUserId(id: string): void {
    this.userId = id;
  }

  getAccountId(): string {
    return this.accountId
  }
}