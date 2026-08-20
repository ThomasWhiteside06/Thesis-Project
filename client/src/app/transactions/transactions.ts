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
  //transactions
  transactions: Transaction[] = [];
  displayedTransactions: Transaction[] = [];
  selectedTransaction: Transaction | null = null;
  regularTransactions: Transaction[] = [];
  displayedRegularTransactions: Transaction[] = [];
  upcomingTransaction: Transaction | null = null;
  //user info
  currency: string = '';
  userNames: { [id: string]: string } = {};
  //creating new transaction
  newRecipientId: string = '';
  recipientSearch: string = '';
  recipientDropdownOpen: boolean = false;
  recipientAccounts: {
    account: Account;
    name: string;
  }[] = [];
  filteredRecipientAccounts: {
    account: Account;
    name: string;
  }[] = [];
  newAmount: number = 0;
  newCategories: string = '';
  newDate: string = '';
  newRegular: boolean = false;
  newFrequency: string = 'once';
  //accounts
  accounts: Account[] = [];
  allAccounts: Account[] = [];
  selectedAccounts: string[] = [];
  newIncoming: boolean = false;
  //miscelaneous
  currentDate = new Date();
  loading = true;

  constructor(private currencyService: CurrencyService, private accountService: AccountService, private userService: UserService, private transactionService: TransactionService, private authService: AuthService, private cdr: ChangeDetectorRef) {
    this.loadTransactions();
    setInterval(() => {this.checkRecurringTransactions(); this.currentDate = new Date();}, 60000);
  }

  loadTransactions(): void {
  this.loading = true;
  const userId = this.authService.getUserId();
  console.log('Logged in userId:', userId);
  forkJoin({user: this.userService.getUser(userId), accounts: this.accountService.getAccounts()}).subscribe({
    next: ({ user, accounts }) => {
      console.log('All accounts:', accounts);
      console.log('Account userIds:', accounts.map(account => account.userId));
      this.currency = user.currency ?? 'GBP';
      this.allAccounts = accounts;
      this.accounts = accounts.filter(account => account.userId === userId);
      this.selectedAccounts = this.accounts.map(account => account.id);
      console.log('User accounts:', this.accounts);
      if (this.accounts.length === 0) {
        console.warn('No accounts found for userId:', userId);
        this.transactions = [];
        this.regularTransactions = [];
        this.displayedTransactions = [];
        this.displayedRegularTransactions = [];
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      forkJoin(this.accounts.map(account => this.transactionService.getTransactionsForAccount(account.id))).subscribe({
        next: (transactionArrays) => {
          this.transactions = transactionArrays.flat().filter((transaction, index, array) => index === array.findIndex(t => t.id === transaction.id)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.regularTransactions = this.transactions.filter(transaction => transaction.regular).sort((a, b) => {
            const nextA = this.getNextTransactionDate(a);
            const nextB = this.getNextTransactionDate(b);
            if (!nextA || !nextB) {return 0;}
            return nextA.getTime() - nextB.getTime();
          });
          this.displayedTransactions = [...this.transactions];
          this.displayedRegularTransactions = [...this.regularTransactions];
          const myAccountIds = new Set(this.accounts.map(account => account.id));
          const otherUserIds = [...new Set(this.transactions.map(transaction => {
            const otherAccountId = myAccountIds.has(transaction.senderId) ? transaction.recipientId : transaction.senderId;
            const otherAccount = this.allAccounts.find(account => account.id === otherAccountId);
            return otherAccount?.userId;
          }).filter((id): id is string => !!id))];
          if (otherUserIds.length === 0) {
            this.upcomingTransaction = this.getNextOutgoingTransaction();
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          forkJoin(otherUserIds.map(id => this.userService.getUser(id))).subscribe({
            next: (users) => {
              users.forEach(user => { this.userNames[user.id] = `${user.firstName} ${user.lastname}`;});
              this.buildRecipientList();
              this.upcomingTransaction = this.getNextOutgoingTransaction();
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('Failed to load transaction users:', error);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
        },

        error: (error) => {
          console.error(
            'Failed to load account transactions:',
            error
          );

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    },

    error: (error) => {
      console.error(
        'Failed to load user/accounts:',
        error
      );

      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  getOtherUserId(transaction: Transaction): string {
  const myAccountIds = new Set(this.accounts.map(account => account.id));
  const otherAccountId = myAccountIds.has(transaction.senderId)? transaction.recipientId : transaction.senderId;
  const otherAccount = this.allAccounts.find(account => account.id === otherAccountId);
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
    return this.selectedAccounts.includes(transaction.recipientId);
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
    if (this.selectedAccounts.length !== 1) {
      console.error('Please select exactly one account.');
      return;
    }
    const selectedAccountId = this.selectedAccounts[0];
    const newTransaction: Transaction = {
      categories: [this.newCategories],
      senderId: this.newIncoming ? this.newRecipientId : selectedAccountId,
      recipientId: this.newIncoming ? selectedAccountId : this.newRecipientId,
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
          if (!nextA || !nextB) {return 0;}
          return nextA.getTime() - nextB.getTime();
        });
        this.upcomingTransaction = this.getNextOutgoingTransaction();
        this.newRecipientId = '';
        this.recipientSearch = '';
        this.recipientDropdownOpen = false;
        this.newAmount = 0;
        this.newCategories = '';
        this.newDate = '';
        this.newRegular = false;
        this.newFrequency = 'once';
        this.checkRecurringTransactions();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to create transaction:', error);
        console.error('Backend response:', error.error);
      }
    });
  }

  getNextOutgoingTransaction(): Transaction | null {
    const myAccountIds = new Set(this.accounts.map(account => account.id));
    const possibleTransactions = this.transactions.filter(transaction => myAccountIds.has(transaction.senderId)).map(transaction => ({transaction, nextDate: transaction.regular ? this.getNextTransactionDate(transaction) : new Date(transaction.date)})).filter(item => item.nextDate !== null && item.nextDate > new Date()).sort((a, b) => a.nextDate!.getTime() - b.nextDate!.getTime());
    return possibleTransactions[0]?.transaction ?? null;
  }

  toggleAccount(accountId: string): void {
    if (this.selectedAccounts.includes(accountId)) {this.selectedAccounts = this.selectedAccounts.filter(id => id !== accountId);} else {this.selectedAccounts.push(accountId);}
    this.updateDisplayedTransactions();
  }

  checkRecurringTransactions(): void {
    const now = new Date();

    this.regularTransactions.forEach(transaction => {
      if (!transaction.regular || !transaction.frequency) {
        return;
      }

      const startDate = new Date(transaction.start ?? transaction.date);
      let occurrenceDate = new Date(startDate);

      while (occurrenceDate <= now) {
        const occurrenceAlreadyExists = this.transactions.some(existing =>
          existing.senderId === transaction.senderId &&
          existing.recipientId === transaction.recipientId &&
          existing.amount === transaction.amount &&
          new Date(existing.date).getTime() === occurrenceDate.getTime()
        );

        if (
          !occurrenceAlreadyExists &&
          occurrenceDate.getTime() !== startDate.getTime()
        ) {
          this.createRecurringOccurrence(
            transaction,
            new Date(occurrenceDate)
          );
        }

        this.advanceOccurrence(occurrenceDate, transaction.frequency);
      }
    });

    this.updateDisplayedTransactions();
    this.cdr.detectChanges();
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

  createRecurringOccurrence(transaction: Transaction, occurrenceDate: Date): void {
    const newTransaction: Transaction = {
      ...transaction,
      id: undefined,
      date: new Date(occurrenceDate),
      regular: false,
      frequency: 'once'
    };
    this.transactionService.addTransaction(newTransaction).subscribe({
      next: (savedTransaction) => {
        this.transactions.push(savedTransaction);
        this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.updateDisplayedTransactions();
        this.cdr.detectChanges();
      }, error: (error) => {console.error('Failed to save recurring occurrence:', error);}
    });
  }

  isPastTransaction(transaction: Transaction): boolean {
    return new Date(transaction.date) <= this.currentDate;
  }

  toggleAllAccounts(): void {
    if (this.selectedAccounts.length === this.accounts.length) {this.selectedAccounts = []} else {this.selectedAccounts = this.accounts.map(account => account.id);}
    this.updateDisplayedTransactions();
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

  updateDisplayedTransactions(): void {
    if (this.selectedAccounts.length === 0) {
      this.displayedTransactions = [];
      this.displayedRegularTransactions = [];
      return;
    }
    this.displayedTransactions = this.transactions.filter(transaction => this.selectedAccounts.includes(transaction.senderId) || this.selectedAccounts.includes(transaction.recipientId));
    this.displayedRegularTransactions = this.regularTransactions.filter(transaction => this.selectedAccounts.includes(transaction.senderId) || this.selectedAccounts.includes(transaction.recipientId));
  }

  getOtherAccount(transaction: Transaction): Account | undefined {
    const myAccountIds = new Set(this.accounts.map(account => account.id));
    const otherAccountId = myAccountIds.has(transaction.senderId) ? transaction.recipientId : transaction.senderId;
    return this.allAccounts.find(account => account.id === otherAccountId);
  }

  advanceOccurrence(date: Date, frequency: string): void {
    switch (frequency.toLowerCase()) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
  }

  buildRecipientList(): void {
    const myAccountIds = new Set(this.accounts.map(account => account.id));
    this.recipientAccounts = this.allAccounts.map(account => ({account: account, name: this.userNames[account.userId] ?? 'Unknown User'}));
    this.filteredRecipientAccounts = [...this.recipientAccounts];
  }

  filterRecipients(): void {
    const search = this.recipientSearch.toLowerCase().trim();
    if (!search) {
      this.filteredRecipientAccounts = [...this.recipientAccounts];
      return;
    }
    this.filteredRecipientAccounts = this.recipientAccounts.filter(item => item.name.toLowerCase().includes(search) || item.account.accountName.toLowerCase().includes(search));
  }

  selectRecipient(item: { account: Account; name: string }): void {
    this.newRecipientId = item.account.id;
    this.recipientSearch = `${item.name} - ${item.account.accountName}`;
    this.recipientDropdownOpen = false;
  }
}
