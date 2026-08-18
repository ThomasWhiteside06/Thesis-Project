import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../models/accounts';
import { Transaction } from '../models/transactions';
import { AccountService } from '../services/account';
import { AuthService } from '../services/auth';
import { TransactionService } from '../services/transaction';
import { UserService } from '../services/user';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule, FormsModule],
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
  allAccounts: Account[] = [];
  userNames: { [id: string]: string } = {};
  showAddAccountForm = false;
  newAccountName = '';
  newAccountType = 'checking';
  accountTypes = [
    'checking',
    'savings',
    'investment',
    'credit',
    'cash',
    'other'
  ];
  //balance
  totalIncoming = 0;
  totalOutgoing = 0;
  currentBalance = 0;
  //weekly balance
  weeklyIncoming = 0;
  weeklyOutgoing = 0;
  weeklyTotal = 0;
  //monthly balance
  monthlyIncoming = 0;
  monthlyOutgoing = 0;
  monthlyTotal = 0;
  //annual balance
  yearlyIncoming = 0;
  yearlyOutgoing = 0;
  yearlyTotal = 0;

  constructor(private accountService: AccountService, private userService: UserService, private transactionService: TransactionService, private authService: AuthService, private cdr: ChangeDetectorRef) {}

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
      }
    });
    this.accountService.getAccounts().subscribe({next: (accounts) => {this.allAccounts = accounts;}, error: (error) => {console.error('Failed to load all accounts:', error);}});
  }

  selectAccount(account: Account): void {
    this.selectedAccount = account;
    this.loadAccountTransactions(account.id);
  }

  loadAccountTransactions(accountId: string): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.transactionService.getTransactionsForAccount(accountId).subscribe({
        next: (transactions) => {
          console.log('Account transactions:', transactions);
          this.transactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          this.reccuringTransactions = this.transactions.filter(transaction => transaction.regular);
          this.calculateAccountTotals();
          const otherUserIds = [...new Set(this.transactions.map(transaction => this.getOtherUserId(transaction)).filter(id => !!id))];
          if (otherUserIds.length === 0) {
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          otherUserIds.forEach(userId => {
            this.userService.getUser(userId).subscribe({
              next: (user) => {
                this.userNames[user.id] = `${user.firstName} ${user.lastname}`;
                this.loading = false;
                this.cdr.detectChanges();
              },
              error: (error) => {console.error('Failed to load transaction user:', error);}
            });
          });
          this.loading = false;
          this.cdr.detectChanges();
        }, error: (error) => {
          console.error('Failed to load account transactions:', error);
          this.loading = false;
          this.cdr.detectChanges();
        }
    });
  }

  getCurrencySymbol(code: string) {
    return this.transactionService.getCurrencySymbol(code);
  }

  isIncoming(transaction: Transaction): boolean {
    if (!this.selectedAccount) { false;}
    return transaction.recipientId === this.selectedAccount!.id;
  }

  getOtherUserId(transaction: Transaction): string {
    if (!this.selectedAccount) {return ''}
    const otherAccountId = transaction.senderId === this.selectedAccount.id ? transaction.recipientId : transaction.senderId;
    const otherAccount = this.allAccounts.find(account => account.id === otherAccountId);
    return otherAccount?.userId ?? '';
  }

  getOtherAccount(transaction: Transaction): Account | undefined {
    if (!this.selectedAccount) {return undefined;}
    const otherAccountId = transaction.senderId === this.selectedAccount.id ? transaction.recipientId : transaction.senderId;
    return this.allAccounts.find(account => account.id === otherAccountId);
  }

  calculateAccountTotals(): void {
    if (!this.selectedAccount) {return}
    console.log('Selected account:', this.selectedAccount);
    console.log('Recurring transactions:');
    this.reccuringTransactions.forEach(transaction => {
      console.log({
        id: transaction.id,
        amount: transaction.amount,
        regular: transaction.regular,
        frequency: transaction.frequency,
        senderId: transaction.senderId,
        recipientId: transaction.recipientId,
        selectedAccountId: this.selectedAccount?.id,
        incoming: this.isIncoming(transaction)
      });
    });
    this.totalIncoming = 0;
    this.totalOutgoing = 0;
    this.transactions.forEach(transaction => {
      if (!transaction.regular) {
        if (this.isIncoming(transaction)) {this.totalIncoming += transaction.amount} else {this.totalOutgoing += transaction.amount;}
        return;
      }
      const occurrences = this.getPastOccurrences(transaction);
      occurrences.forEach(() => {if (this.isIncoming(transaction)) {this.totalIncoming += transaction.amount;} else {this.totalOutgoing += transaction.amount;}});
    });
    this.currentBalance = this.totalIncoming - this.totalOutgoing;
    this.selectedAccount.balance = this.currentBalance;
    this.accountService.updateAccount(this.selectedAccount).subscribe({
      next: (updatedAccount) => {
        console.log('Account balance updated:', updatedAccount);
        const index = this.accounts.findIndex(account => account.id === updatedAccount.id);
        if (index !== -1) {this.accounts[index] = updatedAccount;}
        this.selectedAccount = updatedAccount;
        this.cdr.detectChanges();
      }, error: (error) => {console.error('Failed to update account balance:', error);}
    });
    this.weeklyIncoming = 0;
    this.weeklyOutgoing = 0;
    this.monthlyIncoming = 0;
    this.monthlyOutgoing = 0;
    this.yearlyIncoming = 0;
    this.yearlyOutgoing = 0;
    this.reccuringTransactions.forEach(transaction => {
      const amount = transaction.amount;
      if (this.isIncoming(transaction)) {this.addRecurringAmount(transaction.frequency, amount, true);} else {this.addRecurringAmount(transaction.frequency, amount, false);}
    });
    this.weeklyTotal = this.weeklyIncoming - this.weeklyOutgoing;
    this.monthlyTotal = this.monthlyIncoming - this.monthlyOutgoing;
    this.yearlyTotal = this.yearlyIncoming - this.yearlyOutgoing;
  }

  addRecurringAmount(frequency: string | undefined, amount: number, incoming: boolean): void {
    if (!frequency) {return;}
    switch (frequency.toLowerCase()) {
      case 'daily':
        if (incoming) {
          this.weeklyIncoming += amount * 7;
          this.monthlyIncoming += amount * 30.4375;
          this.yearlyIncoming += amount * 365;
        } else {
          this.weeklyOutgoing += amount * 7;
          this.monthlyOutgoing += amount * 30.4375;
          this.yearlyOutgoing += amount * 365;
        }
        break;
      case 'weekly':
        if (incoming) {
          this.weeklyIncoming += amount;
          this.monthlyIncoming += amount * 4.345;
          this.yearlyIncoming += amount * 52.143;
        } else {
          this.weeklyOutgoing += amount;
          this.monthlyOutgoing += amount * 4.345;
          this.yearlyOutgoing += amount * 52.143;
        }
        break;
      case 'monthly':
        if (incoming) {
          this.weeklyIncoming += amount / 4.345;
          this.monthlyIncoming += amount;
          this.yearlyIncoming += amount * 12;
        } else {
          this.weeklyOutgoing += amount / 4.345;
          this.monthlyOutgoing += amount;
          this.yearlyOutgoing += amount * 12;
        }
        break;
      case 'yearly':
        if (incoming) {
          this.weeklyIncoming += amount / 52.143;
          this.monthlyIncoming += amount / 12;
          this.yearlyIncoming += amount;
        } else {
          this.weeklyOutgoing += amount / 52.143;
          this.monthlyOutgoing += amount / 12;
          this.yearlyOutgoing += amount;
        }
        break;
    }
  }

  getPastOccurrences(transaction: Transaction): Date[] {
    if (!transaction.regular || !transaction.frequency) {return [];}
    const occurrences: Date[] = [];
    const now = new Date();
    let occurrenceDate = new Date(transaction.start ?? transaction.date);
    while (occurrenceDate <= now) {
      occurrences.push(new Date(occurrenceDate));
      switch (transaction.frequency.toLowerCase()) {
        case 'daily':
          occurrenceDate.setDate(occurrenceDate.getDate() + 1);
          break;
        case 'weekly':
          occurrenceDate.setDate(occurrenceDate.getDate() + 7);
          break;
        case 'monthly':
          occurrenceDate.setMonth(occurrenceDate.getMonth() + 1);
          break;
        case 'yearly':
          occurrenceDate.setFullYear(occurrenceDate.getFullYear() + 1);
          break;
        default:
          return occurrences;
      }
    }
    return occurrences;
  }

  isUpcoming(transaction: Transaction): boolean {
    return new Date(transaction.date) > new Date();
  } 

  openAddAccountForm(): void {
    this.showAddAccountForm = true;
  }

  closeAddAccountForm(): void {
    this.showAddAccountForm = false;
    this.newAccountName = '';
    this.newAccountType = 'checking';
  }

  addAccount(): void {
    if (!this.newAccountName.trim()) {return;}
    const userId = this.authService.getUserId();
    const newAccount: Account = {
      id: crypto.randomUUID(),
      userId: userId,
      accountType: this.newAccountType,
      accountName: this.newAccountName.trim(),
      balance: 0
    };
    this.accountService.addAccount(newAccount).subscribe({
      next: (account) => {
        this.accounts.push(account);
        this.closeAddAccountForm();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to add account:', error);
      }
    });
  }
}
