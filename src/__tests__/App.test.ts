import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { devCookie } from '../types/types';

// app.ts imports styles.scss?inline — mock it so the IIFE runs cleanly in jsdom
vi.mock('../styles/styles.scss?inline', () => ({ default: '' }));

const cookies: devCookie[] = [
    { name: 'cookie_a', values: ['1', '2'], description: 'First' },
    { name: 'cookie_b', values: ['x'], description: '' },
];

beforeEach(() => {
    vi.resetModules();
    window.__CM_CONFIG__ = cookies;
    document.body.innerHTML = '';
});

describe('Cookie Manager IIFE rendering', () => {
    it('injects the cookie manager panel into the DOM', async () => {
        await import('../app');
        expect(document.querySelector('.mw-cookie-manager')).not.toBeNull();
    });

    it('injects the dark overlay into the DOM', async () => {
        await import('../app');
        expect(document.querySelector('.mw-cookie-manager-overlay')).not.toBeNull();
    });

    it('renders one .mw-cm-item per configured cookie', async () => {
        await import('../app');
        expect(document.querySelectorAll('.mw-cm-item').length).toBe(cookies.length);
    });

    it('shows "N cookies tracked" in the footer', async () => {
        await import('../app');
        const count = document.querySelector('.js-mw-cm-footer-count');
        expect(count?.textContent).toBe(`${cookies.length} cookies tracked`);
    });

    it('uses the singular form for exactly 1 cookie', async () => {
        window.__CM_CONFIG__ = [cookies[0]!];
        await import('../app');
        const count = document.querySelector('.js-mw-cm-footer-count');
        expect(count?.textContent).toBe('1 cookie tracked');
    });

    it('does not create a second panel when the IIFE runs again on the same page', async () => {
        await import('../app');
        vi.resetModules();
        await import('../app');
        expect(document.querySelectorAll('.mw-cookie-manager').length).toBe(1);
    });

    it('renders each cookie name in a <code> element', async () => {
        await import('../app');
        const codes = Array.from(document.querySelectorAll('.mw-cm-item__name code'));
        const names = codes.map((el) => el.textContent);
        expect(names).toContain('cookie_a');
        expect(names).toContain('cookie_b');
    });

    it('renders an info button only for cookies that have a description', async () => {
        await import('../app');
        const items = document.querySelectorAll('.mw-cm-item');
        // cookie_a has a description, cookie_b does not
        expect(items[0]?.querySelector('.js-mw-cm-item-info')).not.toBeNull();
        expect(items[1]?.querySelector('.js-mw-cm-item-info')).toBeNull();
    });
});
