import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { CurrencyService } from '../services/currency';
import { TransactionService } from '../services/transaction';
import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { AccountService } from '../services/account';
import type { Transaction } from '../models/transactions';
import { ChangeDetectorRef } from '@angular/core';
import { currencies } from '../currencies';
import { FormsModule } from '@angular/forms';
import { Account } from '../models/accounts';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  transactions: Transaction[] = [];
  currency: string = '';
  userNames: { [id: string]: string } = {};
  selectedTransaction: Transaction | null = null;
  newRecipientId: string = '';
  newAmount: number = 0;
  newCategories: string = '';
  newDate: string = '';
  newRegular: boolean = false;
  newFrequency: string = 'once';
  regularTransactions: Transaction[] = [];
  upcomingTransaction: Transaction | null = null;
  accounts: Account[] = [];
  selectedAccounts: string[] = [];

  constructor(private currencyService: CurrencyService, private accountService: AccountService, private userService: UserService, private transactionService: TransactionService, private authService: AuthService, private cdr: ChangeDetectorRef) {
    this.loadTransactions();
    setInterval(() => {this.checkRecurringTransactions()}, 60000);
  }

  loadTransactions(): void {
    const userId = this.authService.getUserId();
    console.log(userId)
    forkJoin({user: this.userService.getUser(userId), transactions: this.transactionService.getTransactions(userId), accounts: this.accountService.getAccounts()}).subscribe({
        next: ({ user, transactions, accounts }) => {
            this.currency = user.currency ?? 'GBP';
            this.transactions = transactions.filter(transaction => transaction.senderId === userId || transaction.recipientId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            this.regularTransactions = this.transactions.filter(transaction => transaction.regular);
            this.checkRecurringTransactions();
            this.upcomingTransaction = this.getNextOutgoingTransaction();
            this.accounts = accounts.filter(account => account.userId === userId);
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

  selectTransaction(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    console.log('Selected:', this.selectedTransaction);
  }

  getNextTransactionDate(transaction: Transaction): Date | null {
    if (!transaction.regular) {return null;}
    const nextDate = new Date(transaction.start!);
    const now = new Date();
    while (nextDate <= now) {
      switch (transaction.frequency!.toLowerCase()) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'yearly':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
        default:
          return null;
      }
    }
    return nextDate;
  }

  addTransaction(): void {
    const userId = this.authService.getUserId();
    const newTransaction: Transaction = {
        categories: [this.newCategories],
        senderId: userId,
        recipientId: this.newRecipientId,
        amount: this.newAmount,
        date: new Date(this.newDate),
        regular: this.newRegular,
        frequency: this.newRegular ? this.newFrequency : 'once',
        start: new Date(this.newDate)
    };
    console.log('Creating transaction:', newTransaction);
    this.transactionService.addTransaction(newTransaction).subscribe({
        next: (transaction) => {
            console.log('Transaction created:', transaction);
            // Add the new transaction to the displayed list
            this.transactions.push(transaction);
            // Clear the form
            this.newRecipientId = '';
            this.newAmount = 0;
            this.newCategories = '';
            this.newDate = '';
            this.newRegular = false;
            this.newFrequency = 'once';
            this.cdr.detectChanges();
        },
        error: (error) => {
            console.error('Failed to create transaction:', error);
            console.error('Backend response:', error.error);
        }
    });
  }

  getNextOutgoingTransaction(): Transaction | null {
    const userId = this.authService.getUserId();
    const now = new Date();
    const outgoingRegularTransactions = this.transactions.filter(transaction => transaction.senderId === userId && transaction.regular).map(transaction => ({transaction, nextDate: this.getNextTransactionDate(transaction)})).filter(item => item.nextDate! > now).sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime());
    return outgoingRegularTransactions[0]?.transaction ?? null;
  }

  toggleAccount(accountId: string): void {
    if (this.selectedAccounts.includes(accountId)) {this.selectedAccounts = this.selectedAccounts.filter(id => id !== accountId)} else {this.selectedAccounts.push(accountId)}
  }

  checkRecurringTransactions(): void {
    const now = new Date();
    this.regularTransactions.forEach(transaction => {
      const nextDate = this.getNextOccurrence(transaction);
      if (nextDate && nextDate <= now) {this.createRecurringOccurrence(transaction);}
    });
  }

  getNextOccurrence(transaction: Transaction): Date | null {
    if (!transaction.regular || !transaction.frequency) {return null}
    const nextDate = new Date(transaction.date);
    switch (transaction.frequency.toLowerCase()) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        return null;
    }
    return nextDate;
  }

  createRecurringOccurrence(transaction: Transaction): void {
    const nextDate = this.getNextOccurrence(transaction);
    if (!nextDate) {return}
    const newTransaction: Transaction = {
      ...transaction,
      id: undefined,
      date: nextDate,
      start: transaction.start ? new Date(transaction.start) : undefined,
    };
    this.transactions.push(newTransaction);
    this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.cdr.detectChanges();
  }
}
