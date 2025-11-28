import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatRoom, ChatMessage } from '../../models/chat-model';
import { HttpClient } from '@angular/common/http';
import { GigtaskerConstants } from '../constant';

@Injectable({
    providedIn: 'root',
})
export class ChatApi {
    private readonly http = inject(HttpClient);

    public getMyChatRooms(): Observable<ChatRoom[]> {
        return this.http.get<ChatRoom[]>(`${GigtaskerConstants.API_URL}/api/chat/rooms`);
    }

    public getChatHistory(taskId: number, recipientId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(
            `${GigtaskerConstants.API_URL}/api/chat/messages/${taskId}/${recipientId}`
        );
    }
}
