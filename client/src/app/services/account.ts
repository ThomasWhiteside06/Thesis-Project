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

  getUserAccounts(user_id: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}user/${user_id}`);
  }

  addAccount(account: Account): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}`, account);
  }  

  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.apiUrl}/${account.id}`, account);
  }
}