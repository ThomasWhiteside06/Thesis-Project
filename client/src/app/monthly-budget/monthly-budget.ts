import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../models/accounts';
import { Transaction } from '../models/transactions';
import { AccountService } from '../services/account';
import { AuthService } from '../services/auth';
import { TransactionService } from '../services/transaction';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  transactions: Transaction[];
}

@Component({
  selector: 'app-monthly-budget',
  imports: [CommonModule],
  templateUrl: './monthly-budget.html',
  styleUrl: './monthly-budget.css',
})
export class MonthlyBudget implements OnInit {
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  categories: BudgetCategory[] = [];
  selectedCategory: BudgetCategory | null = null;
  currency = 'GBP';
  totalIncome = 0;
  totalExpenses = 0;
  remaining = 0;
  budgetPeriod: 'monthly' | 'yearly' = 'monthly';
  selectedMonth = new Date();
  selectedYear = new Date().getFullYear();
  loading = true;

  constructor(private accountService: AccountService, private transactionService: TransactionService, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('MonthlyBudget ngOnInit called');
    this.loadBudget();
  }

  loadBudget(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    console.log('loadBudget called');
    console.log('User ID:', userId);
    this.accountService.getUserAccounts(userId).subscribe({
      next: (accounts) => {
        console.log('Accounts returned:', accounts);
        this.accounts = accounts;
        if (this.accounts.length === 0) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        this.loadTransactions();
      }, error: (error) => {
        console.error('Failed to load accounts:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTransactions(): void {
    const requests = this.accounts.map(account => this.transactionService.getTransactionsForAccount(account.id));
    if (requests.length === 0) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    forkJoin(requests).subscribe({
      next: (transactionArrays) => {
        console.log('Transaction arrays returned:', transactionArrays);
        this.transactions = transactionArrays.flat().filter((transaction, index, array) => index === array.findIndex(t => t.id === transaction.id));
        console.log('Final transactions:', this.transactions);
        this.calculateBudget();
        console.log('Budget categories:', this.categories);
        console.log('Total income:', this.totalIncome);
        console.log('Total expenses:', this.totalExpenses);
        console.log('Remaining:', this.remaining);
        this.loading = false;
        this.cdr.detectChanges();
      }, error: (error) => {
        console.error('Failed to load transactions:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateBudget(): void {
    this.totalIncome = 0;
    this.totalExpenses = 0;
    this.categories = [];
    this.selectedCategory = null;
    const periodStart = this.getPeriodStart();
    const periodEnd = this.getPeriodEnd();
    const periodTransactions: Transaction[] = [];
    this.transactions.forEach(transaction => {
      if (transaction.regular) {
        const occurrences = this.getOccurrencesInPeriod(transaction);
        occurrences.forEach(date => {if (!this.occurrenceExists(transaction, date)) {periodTransactions.push({...transaction, date: date});}});
      } else {
        const date = new Date(transaction.date);
        if (date >= periodStart && date <= periodEnd) {periodTransactions.push(transaction)}
      }
    });
    const accountIds = new Set(this.accounts.map(account => account.id));
    periodTransactions.forEach(transaction => {
      if (accountIds.has(transaction.recipientId) && !this.isInternalTransfer(transaction)) {this.totalIncome += transaction.amount;}
      if (accountIds.has(transaction.senderId)) {
        this.totalExpenses += transaction.amount;
        transaction.categories.forEach(categoryName => {
          let category = this.categories.find(c => c.name === categoryName);
          if (!category) {
            category = {
              name: categoryName,
              amount: 0,
              percentage: 0,
              transactions: []
            };
            this.categories.push(category);
          }
          category.amount += transaction.amount;
          category.transactions.push(transaction);
        });
      }
    });
    this.categories.forEach(category => {category.percentage = this.totalIncome > 0 ? (category.amount / this.totalIncome) * 100 : 0;});
    this.remaining = this.totalIncome - this.totalExpenses;
    if (this.remaining > 0) {
      this.categories.push({
        name: 'Remaining',
        amount: this.remaining,
        percentage: this.totalIncome > 0 ? (this.remaining / this.totalIncome) * 100 : 0,
        transactions: []
      });
    }
    this.categories.sort((a, b) => {
      if (a.name === 'Remaining') return 1;
      if (b.name === 'Remaining') return -1;
      return b.amount - a.amount;
    });
  }

  isIncoming(transaction: Transaction): boolean {
    const accountIds = new Set(this.accounts.map(account => account.id));
    return accountIds.has(transaction.recipientId) && !this.isInternalTransfer(transaction);
  }

  getOccurrencesInPeriod(transaction: Transaction): Date[] {
    if (!transaction.regular || !transaction.frequency) {return [];}
    const occurrences: Date[] = [];
    const periodStart = this.getPeriodStart();
    const periodEnd = this.getPeriodEnd();
    const startDate = new Date(transaction.start ?? transaction.date);
    let occurrenceDate = new Date(startDate);
    while (occurrenceDate < periodStart) {
      this.advanceOccurrence(occurrenceDate, transaction.frequency);
    }
    while (occurrenceDate <= periodEnd) {
      if (occurrenceDate >= startDate) {occurrences.push(new Date(occurrenceDate));}
      this.advanceOccurrence(occurrenceDate, transaction.frequency);
    }
    return occurrences;
  }

  advanceOccurrence(date: Date, frequency: string): void {
    switch (frequency.toLowerCase()) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
  }

  selectCategory(category: BudgetCategory): void {
    if (category.name === 'Remaining') {
      this.selectedCategory = null;
      return;
    }
    this.selectedCategory = category;
  }

  getCurrencySymbol(): string {
    return this.transactionService.getCurrencySymbol(this.currency);
  }

  getPeriodStart(): Date {
    if (this.budgetPeriod === 'yearly') {return new Date(this.selectedYear, 0, 1, 0, 0, 0, 0);}
    return new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth(), 1, 0, 0, 0, 0);
  }

  getPeriodEnd(): Date {
    if (this.budgetPeriod === 'yearly') {return new Date(this.selectedYear, 11, 31, 23, 59, 59, 999);}
    return new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  setBudgetPeriod(period: 'monthly' | 'yearly'): void {
    this.budgetPeriod = period;
    this.calculateBudget();
  }

  isInternalTransfer(transaction: Transaction): boolean {
    const accountIds = new Set(this.accounts.map(account => account.id));
    return (accountIds.has(transaction.senderId) && accountIds.has(transaction.recipientId));
  }

  occurrenceExists(recurringTransaction: Transaction, occurrenceDate: Date): boolean {
    return this.transactions.some(existing => !existing.regular && existing.senderId === recurringTransaction.senderId && existing.recipientId === recurringTransaction.recipientId && existing.amount === recurringTransaction.amount && new Date(existing.date).getTime() === occurrenceDate.getTime());
  }
}