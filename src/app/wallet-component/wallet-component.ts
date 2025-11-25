import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { Wallet, WalletTransaction } from '../core/models/wallet.model';
import { ApiService } from '../core/services/api-service';

@Component({
    selector: 'app-wallet-component',
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatTableModule
    ],
    templateUrl: './wallet-component.html',
    styleUrl: './wallet-component.scss',
})
export class WalletComponent implements OnInit {
    private readonly apiService = inject(ApiService);
    private readonly snackBar = inject(MatSnackBar);

    public wallet = signal<Wallet | null>(null);
    public transactions = signal<WalletTransaction[]>([]);
    public isLoading = signal(true);
    public depositAmount: number | null = null;

    public displayedColumns: string[] = ['date', 'type', 'amount', 'description'];

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading.set(true);

        // Parallel load of Wallet + History
        // In a real app, you might use forkJoin
        this.apiService.getMyWallet().subscribe({
            next: (w) => {
                this.wallet.set(w);
                this.isLoading.set(false); // Stop spinner once balance loads
            },
            error: (err) => {
                console.error('Failed to load wallet', err);
                this.isLoading.set(false);
            },
        });

        this.apiService.getWalletHistory().subscribe({
            next: (t) => this.transactions.set(t),
            error: (err) => console.error('Failed to load history', err),
        });
    }

    onDeposit() {
        if (!this.depositAmount || this.depositAmount <= 0) return;

        this.apiService.depositFunds(this.depositAmount).subscribe({
            next: (updatedWallet) => {
                this.wallet.set(updatedWallet);
                this.snackBar.open(`Successfully added $${this.depositAmount}!`, 'Cha-ching!', {
                    duration: 3000,
                });
                this.depositAmount = null;

                // Reload history to show the new deposit
                this.apiService.getWalletHistory().subscribe((t) => this.transactions.set(t));
            },
            error: () => this.snackBar.open('Deposit failed.', 'Close', { duration: 3000 }),
        });
    }
}
