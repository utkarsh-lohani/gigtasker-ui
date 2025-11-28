import {TaskStatusEnum} from "./task.model";

export enum BidStatusEnum {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

export interface BidDTO {
    id: number;
    taskId: number;
    bidderUserId: number;
    amount: number;
    status: BidStatusEnum;
    proposal: string;
}
export interface BidDetailDTO {
    bidId: number;
    amount: number;
    proposal: string;
    status: BidStatusEnum;
    bidderUserId: number;
    bidderName: string;
}

export interface MyBidDetailDTO {
    bidId: number;
    amount: number;
    proposal: string;
    bidStatus: BidStatusEnum;
    taskId: number;
    taskTitle: string;
    taskStatus: TaskStatusEnum;
}

export interface MyBidDetailDTO {
    bidId: number;
    amount: number;
    proposal: string;
    bidStatus: BidStatusEnum;
    taskId: number;
    taskTitle: string;
    taskStatus: TaskStatusEnum;
}
