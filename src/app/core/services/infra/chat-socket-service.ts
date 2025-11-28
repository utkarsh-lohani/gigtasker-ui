import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../state/auth-service';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
    private client: Client | null = null;
    private readonly messageSubject = new Subject<any>();

    constructor() {}

    public connect(authService: AuthService): void {
        const token = authService.getToken();
        if (!token) return;

        this.client = new Client({
            brokerURL: 'ws://localhost:9090/ws-chat',
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => console.debug('[ChatWS]: ' + str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Chat WebSocket Connected!');

            // Subscribe to private messages sent to this user
            // Backend sends to: /user/{uuid}/queue/messages
            this.client?.subscribe('/user/queue/messages', (message: Message) => {
                if (message.body) {
                    this.messageSubject.next(JSON.parse(message.body));
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    public sendMessage(destination: string, body: any): void {
        if (this.client?.connected) {
            this.client.publish({ destination, body: JSON.stringify(body) });
        } else {
            console.error('Cannot send message: Chat WebSocket is disconnected');
        }
    }

    public getMessages(): Observable<any> {
        return this.messageSubject.asObservable();
    }

    public disconnect(): void {
        if (this.client) {
            this.client.deactivate();
        }
    }
}
