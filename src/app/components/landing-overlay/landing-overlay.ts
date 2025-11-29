import { Component, signal } from '@angular/core';

@Component({
    selector: 'app-landing-overlay',
    imports: [],
    templateUrl: './landing-overlay.html',
    styleUrl: './landing-overlay.scss',
})
export class LandingOverlay {
    visible = signal(true);

    hide() {
        this.visible.set(false);
    }
}
