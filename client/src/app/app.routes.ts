import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Budget } from './budget/budget';
import { Accounts } from './accounts/accounts';
import { Transactions } from './transactions/transactions';

export const routes: Routes = [
    {path: '', component: Home},
    {path: 'budget', component: Budget},
    {path: 'accounts', component: Accounts},
    {path: 'transactions', component: Transactions},
];
