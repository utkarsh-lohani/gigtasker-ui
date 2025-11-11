import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService extends RxStomp {
    constructor() {
        super(); // Initialize the RxStomp parent
    }

    /**
     * Call this *after* the user is logged in.
     * It configures and activates the WebSocket connection.
     */
    public connect(authService: AuthService): void {
        if (this.active) {
            return; // Already connected
        }

        const token = authService.getToken();
        if (!token) {
            console.error('WebSocket: No auth token found. Cannot connect.');
            return;
        }

        // Configure the connection
        this.configure({
            brokerURL: 'ws://localhost:9090/ws-notify', // Connect to the gateway

            // Send the Keycloak token in the STOMP connection headers
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            // ---

            reconnectDelay: 5000,
        });

        // 2. Start the connection
        this.activate();
    }

    /**
     * Subscribes to a STOMP topic and returns an Observable
     * that parses the JSON message body.
     *
     * @param destination - The topic to subscribe to (e.g., '/topic/tasks')
     */
    public watchJson<T>(destination: string): Observable<T> {
        return this.watch(destination).pipe(map((message) => JSON.parse(message.body) as T));
    }
}
