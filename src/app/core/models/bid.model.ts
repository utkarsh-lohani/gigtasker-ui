import { TaskStatus } from "./task.model";

export type BidStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface BidDTO {
    id: number;
    taskId: number;
    bidderUserId: number;
    amount: number;
    status: BidStatus;
    proposal: string;
}
export interface BidDetailDTO {
    bidId: number;
    amount: number;
    proposal: string;
    status: BidStatus;
    bidderUserId: number;
    bidderName: string;
}

export interface MyBidDetailDTO {
    bidId: number;
    amount: number;
    proposal: string;
    bidStatus: BidStatus;
    taskId: number;
    taskTitle: string;
    taskStatus: TaskStatus;
}
