import { Component } from '@angular/core';
import { CurrencyService } from '../services/currency';

@Component({
  selector: 'app-transactions',
  imports: [],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  constructor(private currencyService: CurrencyService) {
    this.testfunc();
  }

  testfunc(){this.currencyService.convertCurrency('USD', 'GBP', 1000).subscribe(amount => {console.log(`$1000 = £${amount}`)})}
}
