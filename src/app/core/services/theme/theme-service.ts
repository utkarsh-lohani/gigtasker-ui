import { Injectable, signal, Signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'amoled' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly storageKey = 'theme-preference';

    // Writable internally
    private readonly _theme = signal<ThemeMode>('system');

    public theme: Signal<ThemeMode> = this._theme;

    constructor() {
        this.loadStoredTheme();
        this.setupSystemThemeListener();
    }

    /* -----------------------------------------------------------
     LOAD SAVED THEME OR DEFAULT
  ------------------------------------------------------------ */
    private loadStoredTheme() {
        const stored = (localStorage.getItem(this.storageKey) as ThemeMode | null) ?? 'system';
        this.setTheme(stored, false);
    }

    /* -----------------------------------------------------------
     APPLY THEME CLASSES TO <html>
  ------------------------------------------------------------ */
    private applyThemeClasses(theme: ThemeMode) {
        const html = document.documentElement;

        html.classList.remove('dark-mode', 'amoled');

        switch (theme) {
            case 'light':
                return;

            case 'dark':
                html.classList.add('dark-mode');
                return;

            case 'amoled':
                html.classList.add('dark-mode', 'amoled');
                return;

            case 'system': {
                const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    html.classList.add('dark-mode', 'amoled'); // AMOLED for dark environments
                }
                return;
            }
        }
    }

    /* -----------------------------------------------------------
     PUBLIC SET THEME METHOD
  ------------------------------------------------------------ */
    public setTheme(theme: ThemeMode, persist: boolean = true) {
        this._theme.set(theme);
        if (persist) localStorage.setItem(this.storageKey, theme);

        this.applyThemeClasses(theme);
    }

    /* -----------------------------------------------------------
     LISTEN FOR SYSTEM THEME CHANGES
     (Only affects when theme = 'system')
  ------------------------------------------------------------ */
    private setupSystemThemeListener() {
        const media = globalThis.matchMedia('(prefers-color-scheme: dark)');

        media.addEventListener('change', () => {
            if (this._theme() === 'system') {
                this.applyThemeClasses('system');
            }
        });
    }
}
