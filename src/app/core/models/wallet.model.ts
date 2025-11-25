export interface WalletTransaction {
    id: number;
    walletId: number;
    amount: number; // BigDecimal → number (or string if you prefer exact precision)
    type: TransactionType;
    description?: string;
    timestamp: string; // ISO timestamp from LocalDateTime
    taskId?: number;
}

export enum TransactionType {
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    HOLD = 'HOLD',
    RELEASE = 'RELEASE',
    REFUND = 'REFUND',
}

export interface Wallet {
    id: number;
    userId: string;
    balance: number;
    heldFunds: number;
}
