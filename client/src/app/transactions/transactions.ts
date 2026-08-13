import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CurrencyService } from '../services/currency';
import { TransactionService } from '../services/transaction';
import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import type { Transaction } from '../models/transactions';
import { ChangeDetectorRef } from '@angular/core';
import { currencies } from '../currencies';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  transactions: Transaction[] = [];
  currency: string = '';
  userNames: { [id: string]: string } = {};

  constructor(private currencyService: CurrencyService, private userService: UserService, private transactionService: TransactionService, private authService: AuthService, private cdr: ChangeDetectorRef) {
    this.loadTransactions();
  }

  loadTransactions(): void {
    const userId = this.authService.getUserId();
    console.log(userId)
    forkJoin({user: this.userService.getUser(userId), transactions: this.transactionService.getTransactions(userId)}).subscribe({
        next: ({ user, transactions }) => {
            this.currency = user.currency ?? 'GBP';
            this.transactions = transactions.filter(transaction => transaction.senderId === userId || transaction.recipientId === userId);
            const otherUserIds = [...new Set(this.transactions.map(transaction => transaction.senderId === userId ? transaction.recipientId : transaction.senderId))]
            if (otherUserIds.length === 0) {
                this.cdr.detectChanges();
                return;
            }
            forkJoin(otherUserIds.map(id => this.userService.getUser(id))).subscribe({
                next: (users) => {
                    users.forEach(user => {this.userNames[user.id] = `${user.firstName} ${user.lastname}`;});
                    this.cdr.detectChanges();
                }, error: (error) => {console.error('Failed to load transaction users:', error);}
            });
        }, error: (error) => {console.error('Failed to load transactions:', error);}
    });
  }

  getCurrencySymbol(code: string): string {
    const currency = currencies.find(currency => currency.code === code);
    return currency?.symbol ?? code;
  }

  getOtherUserId(transaction: Transaction): string {
    const userId = this.authService.getUserId();
    if (transaction.senderId === userId) {return transaction.recipientId;}
    return transaction.senderId;
  }

  getOtherUser(transaction: Transaction): void {
    const otherUserId = this.getOtherUserId(transaction);
    this.userService.getUser(otherUserId).subscribe({
      next: (user) => {console.log('Other user:', user);},
      error: (error) => {console.error('Failed to get other user:', error);}
    });
  }

  isIncoming(transaction: Transaction): boolean {
    const userId = this.authService.getUserId();
    return transaction.recipientId === userId;
  }
}
