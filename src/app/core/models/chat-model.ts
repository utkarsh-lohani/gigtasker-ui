export interface ChatRoom {
    id: string;
    taskId: number;
    chatId: string; // e.g. "task_123_poster_worker"
    senderId: string;
    recipientId: string;
    otherUserName?: string;
    taskTitle?: string;
}

export interface ChatMessage {
    id?: string;
    chatId: string;
    taskId: number;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: string;
}
