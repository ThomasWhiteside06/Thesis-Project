import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../models/accounts';
import { Transaction } from '../models/transactions';
import { AccountService } from '../services/account';
import { AuthService } from '../services/auth';
import { TransactionService } from '../services/transaction';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts implements OnInit{
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  transactions: Transaction[] = [];
  reccuringTransactions: Transaction[] = [];
  currency: string = 'GBP';
  loading = true;

  constructor(private accountService: AccountService, private transactionService: TransactionService, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const user_id = this.authService.getUserId();
    this.accountService.getUserAccounts(user_id).subscribe({
      next: (accounts) => {
        this.accounts = accounts
        this.loading = false;
        this.cdr.detectChanges();
      }, error: (error) => {
        console.error('Failed to load accounts:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }});
  }

  selectAccount(account: Account): void {
    this.selectedAccount = account;
    this.loadAccountTransactions(account.id);
  }

  loadAccountTransactions(accountId: string): void {
    this.transactionService.getTransactionsForAccount(accountId).subscribe({
        next: (transactions) => {
          console.log('Account transactions:', transactions);
          this.transactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, error: (error) => {
          console.error('Failed to load account transactions:', error);
        }
    });
  }

  getCurrencySymbol(code: string) {
    return this.transactionService.getCurrencySymbol(code);
  }
}
