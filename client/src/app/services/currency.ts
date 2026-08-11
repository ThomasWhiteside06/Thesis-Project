import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface ExchangeRateResponse {
    success: boolean;
    base: string;
    rates: {
        [currency: string]: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private apiUrl = 'https://api.exchangeratesapi.io/v1';
    constructor(private http: HttpClient) {}

    getExchangeRate(from: string, to: string): Observable<ExchangeRateResponse> {
        return this.http.get<ExchangeRateResponse>(
            `${this.apiUrl}/latest`,
            {
                params: {
                    access_key: 'f4e84863be290773602c5a0fe27796f7',
                    symbols: `${from},${to}`
                }
            }
        );
    }

    convertCurrency(from: string, to: string, amount: number): Observable<string> {
        return this.getExchangeRate(from, to).pipe(
            map(response => {
                const fromRate = response.rates[from];
                const toRate = response.rates[to];
                return ((amount / fromRate) * toRate).toFixed(2);
            })
        )
    }
}