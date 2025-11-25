export interface Wallet {
    id: number;
    userId: number;
    balance: number;
    currency: string;
}

export interface WalletTransaction {
    id: number;
    walletId: number;
    amount: number;
    type: 'credit' | 'debit';
    timestamp: string;
}
