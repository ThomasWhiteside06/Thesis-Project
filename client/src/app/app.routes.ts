import { Router, Routes } from '@angular/router';
import { Budget } from './budget/budget';
import { Accounts } from './accounts/accounts';
import { Transactions } from './transactions/transactions';
import { Settings } from './settings/settings';
import { inject } from '@angular/core';
import { loginService } from './login/auth.service';
import { firstValueFrom } from 'rxjs';
import { AppLogin } from './login/login';
const authGuard = async () => {
    const auth = inject(loginService)
    const router = inject(Router)
    try {
        await firstValueFrom(auth.getMe())
        return true;
    } catch {
        return router.parseUrl('/login')
    }
}

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full'},
    { path: 'login', component:AppLogin},
    { path: 'budget', component: Budget, canActivate: [authGuard] },
    { path: 'accounts', component: Accounts, canActivate: [authGuard] },
    { path: 'transactions', component: Transactions, canActivate: [authGuard] },
    { path: 'settings', component: Settings, canActivate: [authGuard] }
];