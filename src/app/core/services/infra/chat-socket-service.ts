import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../state/auth-service';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
    private client: Client | null = null;
    private readonly messageSubject = new Subject<any>();

    connect(authService: AuthService) {
        const token = authService.getToken();
        const myUuid = authService.getUserId(); // Get the UUID

        if (!token || !myUuid) return;

        this.client = new Client({
            brokerURL: 'ws://localhost:9090/ws-chat',
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: (msg) => console.debug(msg),
            reconnectDelay: 5000,
        });

        this.client.onConnect = () => {
            console.log('✅ Chat Connected');

            // Subscribe to the specific user path
            // Spring's UserDestinationMessageHandler translates this internally,
            // but subscribing to the explicit path often works better with custom principals.

            // Standard Alias:
            this.client?.subscribe('/user/queue/messages', this.onMessageReceived);

            // Explicit Path (Backup):
            // The backend sends to convertAndSendToUser(uuid, "/queue/messages")
            // The actual broker path might be /user/{uuid}/queue/messages
            this.client?.subscribe(`/user/${myUuid}/queue/messages`, this.onMessageReceived);
        };

        this.client.activate();
    }

    sendMessage(destination: string, body: any) {
        this.client?.publish({ destination, body: JSON.stringify(body) });
    }

    onMessageReceived = (msg: Message) => {
        if (msg.body) {
            console.log('📩 Real-time Message:', msg.body);
            this.messageSubject.next(JSON.parse(msg.body));
        }
    };

    getMessages(): Observable<any> {
        return this.messageSubject.asObservable();
    }

    disconnect() {
        this.client?.deactivate();
    }
}
