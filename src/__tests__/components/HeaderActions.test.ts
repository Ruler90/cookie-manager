import { describe, it, expect, vi, afterEach } from 'vitest';
import { closeCookieManager, deleteAllCookies, refresh } from '../../components/Header/Header.actions';

describe('closeCookieManager', () => {
    it('removes the overlay element from the DOM', () => {
        const overlay = document.createElement('div');
        overlay.classList.add('mw-cookie-manager-overlay');
        document.body.appendChild(overlay);

        closeCookieManager();

        expect(document.querySelector('.mw-cookie-manager-overlay')).toBeNull();
    });

    it('removes the cookie manager panel from the DOM', () => {
        const panel = document.createElement('div');
        panel.classList.add('mw-cookie-manager');
        document.body.appendChild(panel);

        closeCookieManager();

        expect(document.querySelector('.mw-cookie-manager')).toBeNull();
    });

    it('removes both overlay and panel in one call', () => {
        document.body.innerHTML = `
            <div class="mw-cookie-manager-overlay"></div>
            <div class="mw-cookie-manager"></div>
        `;

        closeCookieManager();

        expect(document.querySelector('.mw-cookie-manager-overlay')).toBeNull();
        expect(document.querySelector('.mw-cookie-manager')).toBeNull();
    });

    it('does not throw when neither element is present', () => {
        expect(() => closeCookieManager()).not.toThrow();
    });
});

describe('deleteAllCookies', () => {
    afterEach(() => {
        document.cookie.split(';').forEach((c) => {
            const name = c.split('=')[0]?.trim();
            if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
    });

    function makeNode(): HTMLElement {
        const node = document.createElement('div');
        node.innerHTML = `
            <div class="mw-cm-item__status js-mw-cm-item-value">not set</div>
            <button class="mw-cm-item__btn mw-cm-item__btn--remove"></button>
        `;
        return node;
    }

    it('removes every cookie tracked in the Map from document.cookie', () => {
        document.cookie = 'foo=bar; path=/';
        document.cookie = 'baz=qux; path=/';

        const nodes = new Map<string, HTMLElement>([
            ['foo', makeNode()],
            ['baz', makeNode()],
        ]);

        deleteAllCookies(nodes);

        expect(document.cookie).not.toContain('foo=');
        expect(document.cookie).not.toContain('baz=');
    });

    it('updates the status element to "not set" for each deleted cookie', () => {
        document.cookie = 'a=1; path=/';
        document.cookie = 'b=2; path=/';

        const nodeA = makeNode();
        const nodeB = makeNode();

        [nodeA, nodeB].forEach((node) => {
            const status = node.querySelector<HTMLElement>('.js-mw-cm-item-value')!;
            status.classList.add('mw-cm-item__status--set');
            status.textContent = '● set';
        });

        deleteAllCookies(new Map([['a', nodeA], ['b', nodeB]]));

        [nodeA, nodeB].forEach((node) => {
            const status = node.querySelector<HTMLElement>('.js-mw-cm-item-value')!;
            expect(status.textContent).toBe('not set');
            expect(status.classList.contains('mw-cm-item__status--set')).toBe(false);
        });
    });

    it('does not throw for an empty Map', () => {
        expect(() => deleteAllCookies(new Map())).not.toThrow();
    });

    it('handles a Map with three cookies', () => {
        document.cookie = 'x=1; path=/';
        document.cookie = 'y=2; path=/';
        document.cookie = 'z=3; path=/';

        const nodes = new Map<string, HTMLElement>([
            ['x', makeNode()],
            ['y', makeNode()],
            ['z', makeNode()],
        ]);

        deleteAllCookies(nodes);

        expect(document.cookie).not.toContain('x=');
        expect(document.cookie).not.toContain('y=');
        expect(document.cookie).not.toContain('z=');
    });
});

describe('refresh', () => {
    it('calls location.reload()', () => {
        const reloadMock = vi.fn();
        vi.stubGlobal('location', { ...window.location, reload: reloadMock });
        refresh();
        expect(reloadMock).toHaveBeenCalledOnce();
        vi.unstubAllGlobals();
    });
});
