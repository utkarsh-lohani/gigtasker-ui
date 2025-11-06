export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface BidDTO {
    id: number;
    taskId: number;
    bidderUserId: number;
    amount: number;
    status: BidStatus;
}
