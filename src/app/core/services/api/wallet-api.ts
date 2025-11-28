import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Wallet, WalletTransaction} from '../../models/wallet.model';
import {GigtaskerConstants} from '../constant';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class WalletApi {
    private readonly http = inject(HttpClient);

    public getMyWallet(): Observable<Wallet> {
        return this.http.get<Wallet>(`${GigtaskerConstants.API_URL}/api/wallet`);
    }

    public depositFunds(amount: number): Observable<Wallet> {
        return this.http.post<Wallet>(`${GigtaskerConstants.API_URL}/api/wallet/deposit`, amount);
    }

    public getWalletHistory(): Observable<WalletTransaction[]> {
        return this.http.get<WalletTransaction[]>(
            `${GigtaskerConstants.API_URL}/api/wallet/transactions`
        );
    }
}
