import { Component } from '@angular/core';
import { MonthlyBudget } from '../monthly-budget/monthly-budget';

@Component({
  selector: 'app-budget',
  imports: [MonthlyBudget],
  templateUrl: './budget.html',
  styleUrl: './budget.css',
})
export class Budget {}
