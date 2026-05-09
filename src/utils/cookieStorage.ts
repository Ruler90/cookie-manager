import { devCookie } from '../types/types';

const STORAGE_KEY = 'mw-cm-cookies';

const defaultConfig: devCookie[] = [
    {
        name: 'example',
        values: ['true'],
        description: 'Example cookie — edit or replace via the gear button',
    },
];

export const loadCookies = (): devCookie[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            const parsed = JSON.parse(stored) as unknown;
            if (Array.isArray(parsed)) return parsed as devCookie[];
        }
    } catch {
        // corrupted JSON — fall through to default
    }
    return defaultConfig;
};

export const saveCookies = (cookies: devCookie[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cookies));
};
