import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { type Transaction }from '../models/transactions'
import { currencies } from '../currencies';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = 'https://budget-backend-c188.onrender.com/api';
    constructor(private http: HttpClient) {}

    getTransactions(userId: string): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/user/${userId}`);
    }

    addTransaction(transaction: Transaction): Observable<Transaction> {
        return this.http.post<Transaction>(`${this.apiUrl}/transactions/`, transaction); 
    }

    deleteTransaction(userId: string): Observable<Transaction> {
        return this.http.delete<Transaction>(`${this.apiUrl}/transactions/${userId}`)
    }

    getTransactionsForAccount(accountId: string): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.apiUrl}/transactions/account/${accountId}`);
    }

    getCurrencySymbol(code: string): string {
        const currency = currencies.find(currency => currency.code === code);
        return currency?.symbol ?? code;
    }
}
