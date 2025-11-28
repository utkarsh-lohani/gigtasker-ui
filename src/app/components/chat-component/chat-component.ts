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
    private readonly chatApi = inject(ChatApi);
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

        // 1. Connect Socket
        this.socket.connect(this.auth);

        // 2. Load Rooms and Check for Query Params (Deep Linking)
        this.loadRoomsAndCheckParams();

        // 3. Listen for incoming
        this.socket.getMessages().subscribe((msg: any) => {
            this.handleIncomingMessage(msg);
        });
    }

    ngOnDestroy() {
        this.socket.disconnect();
    }

    loadRoomsAndCheckParams() {
        this.chatApi.getMyChatRooms().subscribe((rooms) => {
            this.rooms.set(rooms);

            // Check if redirected from Task Detail with intent to chat
            const params = this.route.snapshot.queryParams;
            const targetTaskId = Number(params['taskId']);
            const targetUuid = params['targetId'];

            if (targetTaskId && targetUuid) {
                this.openOrDraftRoom(targetTaskId, targetUuid);
            }
        });
    }

    openOrDraftRoom(taskId: number, targetUuid: string) {
        // Try to find existing room first
        const existingRoom = this.rooms().find(
            (r) =>
                r.taskId === taskId && (r.recipientId === targetUuid || r.senderId === targetUuid)
        );

        if (existingRoom) {
            this.selectRoom(existingRoom);
        } else {
            // Create local "Draft" room. It becomes real on first message.
            const draftRoom: ChatRoom = {
                id: 'draft',
                chatId: 'new',
                taskId: taskId,
                senderId: this.myId,
                recipientId: targetUuid,
                otherUserName: 'User', // Placeholder
            };
            this.rooms.update((list) => [draftRoom, ...list]);
            this.selectRoom(draftRoom);
        }
    }

    selectRoom(room: ChatRoom) {
        this.activeRoom.set(room);
        this.messages.set([]);

        // Identify the other person
        const otherUserId = room.senderId === this.myId ? room.recipientId : room.senderId;

        // Fetch History
        if (room.id !== 'draft') {
            this.chatApi.getChatHistory(room.taskId, otherUserId).subscribe((msgs) => {
                this.messages.set(msgs);
                this.scrollToBottom();
            });
        }
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.activeRoom()) return;

        const room = this.activeRoom()!;
        const otherUserId = room.senderId === this.myId ? room.recipientId : room.senderId;

        const payload: ChatMessage = {
            chatId: room.chatId,
            taskId: room.taskId,
            senderId: this.myId,
            recipientId: otherUserId,
            content: this.newMessage,
            timestamp: new Date().toISOString(),
        };

        // 1. Send
        this.socket.sendMessage('/app/chat', payload);

        // 2. Optimistic UI Update
        this.messages.update((msgs) => [...msgs, payload]);
        this.newMessage = '';
        this.scrollToBottom();

        // 3. If Draft, reload rooms after delay to get real ID
        if (room.id === 'draft') {
            setTimeout(() => this.reloadRoomsKeepActive(), 1000);
        }
    }

    reloadRoomsKeepActive() {
        this.chatApi.getMyChatRooms().subscribe((rooms) => {
            this.rooms.set(rooms);
            // Find the now-created room and set it active so 'draft' flag disappears
            const currentTask = this.activeRoom()?.taskId;
            const realRoom = rooms.find((r) => r.taskId === currentTask);
            if (realRoom) this.activeRoom.set(realRoom);
        });
    }

    handleIncomingMessage(msg: any) {
        const current = this.activeRoom();
        if (current &&(msg.senderId === current.senderId || msg.senderId === current.recipientId)) {
            const chatMsg: ChatMessage = {
                chatId: current.chatId,
                taskId: current.taskId,
                senderId: msg.senderId,
                recipientId: this.myId,
                content: msg.content,
                timestamp: new Date().toISOString(),
            };
            this.messages.update((msgs) => [...msgs, chatMsg]);
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const element = document.getElementById('chat-history');
            if (element) element.scrollTop = element.scrollHeight;
        }, 100);
    }
}
