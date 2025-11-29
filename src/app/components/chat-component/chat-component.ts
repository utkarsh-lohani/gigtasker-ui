import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute } from '@angular/router';
import { ChatRoom, ChatMessage } from '../../core/models/chat-model';
import { ChatSocketService } from '../../core/services/infra/chat-socket-service';
import { AuthService } from '../../core/services/state/auth-service';
import { ChatApi } from '../../core/services/api/chat-api';

@Component({
    selector: 'app-chat-component',
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatDividerModule,
    ],
    templateUrl: './chat-component.html',
    styleUrl: './chat-component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
    private readonly api = inject(ChatApi);
    private readonly auth = inject(AuthService);
    private readonly socket = inject(ChatSocketService);
    private readonly route = inject(ActivatedRoute);

    rooms = signal<ChatRoom[]>([]);
    activeRoom = signal<ChatRoom | null>(null);
    messages = signal<ChatMessage[]>([]);
    newMessage = '';
    myId = '';

    ngOnInit() {
        this.myId = this.auth.getUserId();
        this.socket.connect(this.auth);

        // 1. Listen for new messages
        this.socket.getMessages().subscribe((msg: any) => {
            const current = this.activeRoom();
            // Check if message belongs to current room (either from me or to me)
            if (
                current &&
                (msg.senderId === current.senderId || msg.senderId === current.recipientId)
            ) {
                // Create valid message object from notification
                const chatMsg: ChatMessage = {
                    chatId: current.chatId,
                    taskId: current.taskId,
                    senderId: msg.senderId,
                    recipientId: this.myId,
                    content: msg.content,
                    timestamp: new Date().toISOString(),
                };
                this.messages.update((m) => [...m, chatMsg]);
                this.scrollToBottom();
            }
        });

        // 2. Load Rooms
        this.loadRoomsAndCheckParams();
    }

    ngOnDestroy() {
        this.socket.disconnect();
    }

    loadRoomsAndCheckParams() {
        this.api.getMyChatRooms().subscribe((rooms) => {
            this.rooms.set(rooms);

            // Check URL params for deep linking
            const params = this.route.snapshot.queryParams;
            if (params['taskId'] && params['targetId']) {
                this.openOrDraftRoom(Number(params['taskId']), params['targetId']);
            }
        });
    }

    openOrDraftRoom(taskId: number, targetUuid: string) {
        const existing = this.rooms().find(
            (r) =>
                r.taskId === taskId && (r.recipientId === targetUuid || r.senderId === targetUuid)
        );

        if (existing) {
            this.selectRoom(existing);
        } else {
            const draft: ChatRoom = {
                id: 'draft',
                chatId: 'new',
                taskId,
                senderId: this.myId,
                recipientId: targetUuid,
                otherUserName: 'User',
            };
            this.rooms.update((r) => [draft, ...r]);
            this.selectRoom(draft);
        }
    }

    selectRoom(room: ChatRoom) {
        this.activeRoom.set(room);
        this.messages.set([]);

        const otherId = room.senderId === this.myId ? room.recipientId : room.senderId;

        if (room.id !== 'draft') {
            this.api.getChatHistory(room.taskId, otherId).subscribe((msgs) => {
                this.messages.set(msgs);
                this.scrollToBottom();
            });
        }
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.activeRoom()) return;

        const room = this.activeRoom()!;
        const otherId = room.senderId === this.myId ? room.recipientId : room.senderId;

        const payload: ChatMessage = {
            chatId: room.chatId,
            taskId: room.taskId,
            senderId: this.myId,
            recipientId: otherId,
            content: this.newMessage,
            timestamp: new Date().toISOString(),
        };

        this.socket.sendMessage('/app/chat', payload);
        this.messages.update((m) => [...m, payload]);
        this.newMessage = '';
        this.scrollToBottom();

        if (room.id === 'draft') {
            setTimeout(() => this.loadRoomsAndCheckParams(), 1000);
        }
    }

    isMyMessage(msg: ChatMessage) {
        return String(msg.senderId) === String(this.myId);
    }

    scrollToBottom() {
        setTimeout(() => {
            const el = document.getElementById('chat-history');
            if (el) el.scrollTop = el.scrollHeight;
        }, 100);
    }
}
