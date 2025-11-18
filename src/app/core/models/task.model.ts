export enum TaskStatusEnum {
    OPEN = 'OPEN',
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface TaskDTO {
    id: number;
    title: string;
    description: string;
    posterUserId: number;
    assignedUserId: number;
    status: TaskStatusEnum;
}
