import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Temporary until login is implemented
  private userId = '303a8279-3df3-4567-bac2-0f5645810998';

  getUserId(): string {
    return this.userId;
  }

  setUserId(id: string): void {
    this.userId = id;
  }
}