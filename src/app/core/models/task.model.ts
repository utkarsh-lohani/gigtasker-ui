export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export interface TaskDTO {
    id: number;
    title: string;
    description: string;
    posterUserId: number;
    status: string;
}
