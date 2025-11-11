import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService extends RxStomp {
    constructor() {
        super(); // Initialize the RxStomp parent
        this.configure({
            // This is the "front door" we defined in WebSocketConfig.java
            brokerURL: 'ws://localhost:9090/ws-notify',
            reconnectDelay: 5000,
        });

        // Start the connection
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
