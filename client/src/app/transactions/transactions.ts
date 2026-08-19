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
  newIncoming: boolean = false;
  currentDate = new Date();
  loading = true;

  constructor(private currencyService: CurrencyService, private accountService: AccountService, private userService: UserService, private transactionService: TransactionService, private authService: AuthService, private cdr: ChangeDetectorRef) {
    this.loadTransactions();
    setInterval(() => {this.checkRecurringTransactions(); this.currentDate = new Date();}, 60000);
  }

  loadTransactions(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    const accountId = this.authService.getAccountId();
    forkJoin({
        user: this.userService.getUser(userId),
        transactions: this.transactionService.getTransactionsForAccount(accountId),
        accounts: this.accountService.getAccounts()
    }).subscribe({
        next: ({ user, transactions, accounts }) => {
            this.currency = user.currency ?? 'GBP';
            this.transactions = transactions.filter(transaction => transaction.senderId === accountId || transaction.recipientId === accountId).sort((a, b) =>new Date(b.date).getTime() - new Date(a.date).getTime());
            this.regularTransactions = this.transactions.filter(transaction => transaction.regular).sort((a, b) => {
              const nextA = this.getNextTransactionDate(a);
              const nextB = this.getNextTransactionDate(b);
              if (!nextA || !nextB) {return 0;}
              return nextA.getTime() - nextB.getTime();
            });
            const allAccounts = accounts;
            this.accounts = accounts.filter(account => account.userId === userId);
            const otherUserIds = [...new Set(
              this.transactions.map(transaction => {
                const otherAccountId = transaction.senderId === accountId ? transaction.recipientId : transaction.senderId;
                const otherAccount = allAccounts.find(account => account.id === otherAccountId);
                return otherAccount?.userId;
              }).filter((id): id is string => !!id)
            )];
            if (otherUserIds.length === 0) {
                this.upcomingTransaction = this.getNextOutgoingTransaction();
                this.loading = false;
                this.cdr.detectChanges();
                return;
            }
            forkJoin(otherUserIds.map(id => this.userService.getUser(id))).subscribe({
              next: (users) => {
                users.forEach(user => {this.userNames[user.id] = `${user.firstName} ${user.lastname}`;});
                this.upcomingTransaction = this.getNextOutgoingTransaction();
                this.loading = false
                this.cdr.detectChanges();
              },
                error: (error) => {
                  console.error('Failed to load transaction users:', error);
                  this.loading = false
                  this.cdr.detectChanges();
                }
            });
        },
        error: (error) => {
          console.error('Failed to load transactions:', error);
          this.loading = false
          this.cdr.detectChanges();
        }
    });
  }

  getOtherUserId(transaction: Transaction): string {
    const accountId = this.authService.getAccountId();
    const otherAccountId = transaction.senderId === accountId ? transaction.recipientId : transaction.senderId;
    const otherAccount = this.accounts.find(account => account.id === otherAccountId);
    return otherAccount?.userId ?? '';
  }

  getOtherUser(transaction: Transaction): void {
    const otherUserId = this.getOtherUserId(transaction);
    this.userService.getUser(otherUserId).subscribe({
      next: (user) => {console.log('Other user:', user);},
      error: (error) => {console.error('Failed to get other user:', error);}
    });
  }

  isIncoming(transaction: Transaction): boolean {
    const accountId = this.authService.getAccountId();
    return transaction.recipientId === accountId;
  }

  selectTransaction(transaction: Transaction): void {
    this.selectedTransaction = transaction;
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
    const accountId = this.authService.getAccountId();
    const newTransaction: Transaction = {
        categories: [this.newCategories],
        senderId: this.newIncoming ? this.newRecipientId : accountId,
        recipientId: this.newIncoming ? accountId : this.newRecipientId,
        amount: this.newAmount,
        date: new Date(this.newDate),
        regular: this.newRegular,
        frequency: this.newRegular ? this.newFrequency : 'once',
        start: new Date(this.newDate)
    };
    this.transactionService.addTransaction(newTransaction).subscribe({
        next: (transaction) => {
          this.transactions.push(transaction);
          if (transaction.regular) {this.regularTransactions.push(transaction);}
          this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.regularTransactions.sort((a, b) => {
              const nextA = this.getNextTransactionDate(a);
              const nextB = this.getNextTransactionDate(b);
              if (!nextA || !nextB) {return 0}
              return nextA.getTime() - nextB.getTime();
          });
          this.upcomingTransaction = this.getNextOutgoingTransaction();
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
    const accountId = this.authService.getAccountId();
    const possibleTransactions = this.transactions.filter(transaction => transaction.senderId === accountId).map(transaction => ({transaction, nextDate: transaction.regular ? this.getNextTransactionDate(transaction) : new Date(transaction.date)})).filter(item => item.nextDate !== null && item.nextDate > new Date()).sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime());
    return possibleTransactions[0]?.transaction ?? null;
  }


  toggleAccount(accountId: string): void {
    if (this.selectedAccounts.includes(accountId)) {this.selectedAccounts = this.selectedAccounts.filter(id => id !== accountId)} else {this.selectedAccounts.push(accountId)}
  }

  checkRecurringTransactions(): void {
    const now = new Date();
    this.regularTransactions.forEach(transaction => {
        const nextDate = this.getNextOccurrence(transaction);
        if (!nextDate || nextDate > now) {return;}
        const alreadyExists = this.transactions.some(existing =>
            existing.id !== transaction.id &&
            existing.senderId === transaction.senderId &&
            existing.recipientId === transaction.recipientId &&
            existing.amount === transaction.amount &&
            existing.date.getTime() === nextDate.getTime()
        );
        if (!alreadyExists) {this.createRecurringOccurrence(transaction);}
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
    };
    this.transactions.push(newTransaction);
    this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.cdr.detectChanges();
  }

  isPastTransaction(transaction: Transaction): boolean {
    return new Date(transaction.date) <= this.currentDate;
  }

  toggleAllAccounts(): void {
    if (this.selectedAccounts.length === this.accounts.length) {this.selectedAccounts = [];} else {this.selectedAccounts = this.accounts.map(account => account.id);}
  }

  deleteTransaction(): void {
    if (!this.selectedTransaction?.id) {return;}
    const transactionId = this.selectedTransaction.id;
    this.transactions = this.transactions.filter(transaction => transaction.id !== transactionId);
    this.regularTransactions = this.regularTransactions.filter(transaction => transaction.id !== transactionId);
    if (this.upcomingTransaction?.id === transactionId) {this.upcomingTransaction = this.getNextOutgoingTransaction();}
    this.selectedTransaction = null;
    this.transactionService.deleteTransaction(transactionId).subscribe({
        error: (error) => {
            console.error('Failed to delete transaction:', error);
            this.loadTransactions();
        }
    });
  }

  getCurrencySymbol(code: string) {
    return this.transactionService.getCurrencySymbol(code);
  }
}
