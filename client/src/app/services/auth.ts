import { inject, Injectable } from '@angular/core';
import { AuthStateService } from '../login/AuthState.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  auth = inject(AuthStateService)

  // Temporary until login is implemented
  // private userId = '8dda761a-af2a-4640-869b-2659354766e5';
  //this is the account id this will change if we get time
  
   private userId = this.auth.globalUserId()
  getUserId(): any {
    return this.auth.globalUserId();
  }

  setUserId(id: string): void {
    this.userId = id;
  }
}