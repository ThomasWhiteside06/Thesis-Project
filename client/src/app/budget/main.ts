import { Component } from "@angular/core";
import { BudgetDetails } from "./budget-details";

@Component({
  selector: 'budget-main',
  imports: [BudgetDetails],
  template: `
  <div class="hero-container">
    <budget-details/>
  </div>
  `,
  styles: [`
    .hero-container {
      margin:75px;
      padding:25px;
      display: block;
      z-index: 9;
    }
    `]
})

export class MainBudget{

}