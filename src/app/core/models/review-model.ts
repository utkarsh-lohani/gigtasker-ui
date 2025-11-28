export interface ReviewDTO {
    id: number;
    taskId: number;
    reviewerId: string; // UUID
    revieweeId: string; // UUID
    rating: number;
    comment: string;
    createdAt: string;
}
