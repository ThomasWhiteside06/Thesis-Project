import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/accounts';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private apiUrl = 'https://budget-backend-c188.onrender.com/api/accounts/';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(this.apiUrl);
  }
}