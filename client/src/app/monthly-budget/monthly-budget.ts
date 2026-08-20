import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../models/accounts';
import { Transaction } from '../models/transactions';
import { AccountService } from '../services/account';
import { AuthService } from '../services/auth';
import { TransactionService } from '../services/transaction';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { Tab } from '../budget/tabs/tabs';
import { TabGroup } from '../budget/tabs/tab-group';
import * as d3 from 'd3';


interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  transactions: Transaction[];
}

@Component({
  selector: 'app-monthly-budget',
  imports: [CommonModule, TabGroup, Tab],
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
        occurrences.forEach(date => {periodTransactions.push({...transaction, date: date});});
      } else {
        const date = new Date(transaction.date);
        if (date >= periodStart && date <= periodEnd) {periodTransactions.push(transaction)}
      }
    });
    periodTransactions.forEach(transaction => {if (this.isIncoming(transaction)) {this.totalIncome += transaction.amount;}});
    periodTransactions.forEach(transaction => {
      if (!this.isIncoming(transaction)) {
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
    this.categories.forEach(category => {if (this.totalIncome > 0) {category.percentage = (category.amount / this.totalIncome) * 100;} else {category.percentage = 0;}});
    this.remaining = this.totalIncome - this.totalExpenses;
    if (this.remaining > 0) {
      this.categories.push({
        name: 'Remaining',
        amount: this.remaining,
        percentage: this.totalIncome > 0 ? (this.remaining / this.totalIncome) * 100  : 0, transactions: []
      });
    }
    this.categories.sort((a, b) => {
      if (a.name === 'Remaining') return 1;
      if (b.name === 'Remaining') return -1;
      return b.amount - a.amount;
    });
    
  this.renderActiveChart();


  }

  isIncoming(transaction: Transaction): boolean {
    const accountIds = new Set(this.accounts.map(account => account.id));
    return accountIds.has(transaction.recipientId);
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
    this.renderActiveChart();
  }



private renderMonthlyChart(container: HTMLElement): void {
  d3.select(container).selectAll('*').remove();

  const width = 800;
  const height = 450;
  const margin = { top: 40, right: 120, bottom: 40, left: 40 };

  const data: BudgetCategory[] = this.categories.filter(
    (c: BudgetCategory) => c.name !== 'Remaining'
  );

  const total = d3.sum(data, d => d.amount);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + margin.right)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const x = d3
    .scaleBand<string>()
    .domain(data.map(d => d.name))
    .range([0, innerWidth])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.amount)!])
    .range([innerHeight, 0]);

  const color = d3
    .scaleOrdinal<string>()
    .domain(data.map(d => d.name))
    .range(d3.schemeCategory10);

  
  svg.append('text')
    .attr('x', innerWidth / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', '600')
    .text('Monthly Budget Breakdown');

  
  svg.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x));

  svg.append('g').call(d3.axisLeft(y));

  
  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.name)!)
    .attr('y', d => y(d.amount))
    .attr('width', x.bandwidth())
    .attr('height', d => innerHeight - y(d.amount))
    .attr('fill', d => color(d.name));

  
  svg
    .selectAll('text.percent')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'percent')
    .attr('x', d => x(d.name)! + x.bandwidth() / 2)
    .attr('y', d => y(d.amount) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .text(d => `${((d.amount / total) * 100).toFixed(1)}%`);

  
  const legend = svg
    .append('g')
    .attr('transform', `translate(${innerWidth + 20}, 0)`);

  data.forEach((d, i) => {
    const g = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

    g.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', color(d.name));

    g.append('text')
      .attr('x', 18)
      .attr('y', 10)
      .style('font-size', '12px')
      .text(`${d.name} (${((d.amount / total) * 100).toFixed(1)}%)`);
  });
}

  private renderYearlyChart(container: HTMLElement): void {
  d3.select(container).selectAll('*').remove();

  const width = 800;
  const height = 450;
  const radius = Math.min(width, height) / 2;

  const data: BudgetCategory[] = this.categories;
  const total = d3.sum(data, d => d.amount);

  const svg = d3
    .select(container)
    .append('svg')
    .attr('width', width + 140)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie<BudgetCategory>().value(d => d.amount);

  const arc = d3
    .arc<d3.PieArcDatum<BudgetCategory>>()
    .innerRadius(radius * 0.5)
    .outerRadius(radius);

  const color = d3
    .scaleOrdinal<string>()
    .domain(data.map(d => d.name))
    .range(d3.schemeCategory10);

  
  d3.select(container)
    .select('svg')
    .append('text')
    .attr('x', 80)
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .style('font-size', '20px')
    .style('font-weight', '600')
    .text('Yearly Budget');

  
  svg
    .selectAll('path')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.name));

  
  svg
    .selectAll('text.slice-label')
    .data(pie(data))
    .enter()
    .append('text')
    .attr('class', 'slice-label')
    .attr('transform', d => `translate(${arc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .text(d => `${((d.data.amount / total) * 100).toFixed(1)}%`);

  
  const legend = d3
    .select(container)
    .select('svg')
    .append('g')
    .attr('transform', `translate(${width + 20}, 40)`);

  data.forEach((d, i) => {
    const g = legend.append('g').attr('transform', `translate(0, ${i * 20})`);

    g.append('rect')
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', color(d.name));

    g.append('text')
      .attr('x', 18)
      .attr('y', 10)
      .style('font-size', '12px')
      .text(`${d.name} (${((d.amount / total) * 100).toFixed(1)}%)`);
  });
}

  private renderActiveChart(): void {
  const container = document.querySelector<HTMLElement>('.budget-chart');
  if (!container) return;

  container.innerHTML = ''; 

  if (this.budgetPeriod === 'monthly') {
    this.renderMonthlyChart(container);
  } else {
    this.renderYearlyChart(container);
  }
}

onTabActivated(label: string): void {
  this.renderActiveChart();
}


}