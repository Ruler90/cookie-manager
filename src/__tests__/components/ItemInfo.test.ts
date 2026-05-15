import { describe, it, expect, beforeEach } from 'vitest';
import { showCookieValue, itemInfo } from '../../components/Content/ItemInfo.component';

function makeNode(values: string[] = ['on', 'off']): HTMLElement {
    const node = document.createElement('div');
    node.innerHTML = `
        <div class="mw-cm-item__status js-mw-cm-item-value">not set</div>
        ${values.map((v) => `<button class="mw-cm-item__btn mw-cm-item__btn--add" data-value="${v}">${v}</button>`).join('')}
        <button class="mw-cm-item__btn mw-cm-item__btn--remove" disabled>clear</button>
    `;
    return node;
}

function clearAllCookies() {
    document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0]?.trim();
        if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
}

describe('showCookieValue', () => {
    beforeEach(clearAllCookies);

    it('shows "not set" status when the cookie is absent', () => {
        const node = makeNode();
        showCookieValue('no_such_cookie', node);
        const status = node.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent).toBe('not set');
        expect(status?.classList.contains('mw-cm-item__status--set')).toBe(false);
    });

    it('shows "● set" status when the cookie is present', () => {
        document.cookie = 'mycookie=on; path=/';
        const node = makeNode();
        showCookieValue('mycookie', node);
        const status = node.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent).toBe('● set');
        expect(status?.classList.contains('mw-cm-item__status--set')).toBe(true);
    });

    it('marks the button matching the current value as active', () => {
        document.cookie = 'feature=on; path=/';
        const node = makeNode(['on', 'off']);
        showCookieValue('feature', node);
        expect(node.querySelector('[data-value="on"]')?.classList.contains('mw-cm-item__btn--active')).toBe(true);
        expect(node.querySelector('[data-value="off"]')?.classList.contains('mw-cm-item__btn--active')).toBe(false);
    });

    it('clears active state from all buttons when cookie is absent', () => {
        const node = makeNode(['on', 'off']);
        node.querySelector('[data-value="on"]')!.classList.add('mw-cm-item__btn--active');
        showCookieValue('no_such_cookie', node);
        node.querySelectorAll('.mw-cm-item__btn--add').forEach((btn) => {
            expect(btn.classList.contains('mw-cm-item__btn--active')).toBe(false);
        });
    });

    it('disables the clear button when the cookie is absent', () => {
        const node = makeNode();
        node.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')!.disabled = false;
        showCookieValue('no_such_cookie', node);
        expect(node.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')?.disabled).toBe(true);
    });

    it('enables the clear button when the cookie is present', () => {
        document.cookie = 'present=1; path=/';
        const node = makeNode(['1']);
        showCookieValue('present', node);
        expect(node.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')?.disabled).toBe(false);
    });
});

describe('itemInfo', () => {
    it('renders "not set" status when cookieValue is null', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('mycookie', null, '');
        expect(div.querySelector('.js-mw-cm-item-value')?.textContent?.trim()).toBe('not set');
        expect(div.querySelector('.mw-cm-item__status--set')).toBeNull();
    });

    it('renders "● set" status when cookieValue is not null', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('mycookie', 'somevalue', '');
        const status = div.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent).toContain('set');
        expect(status?.classList.contains('mw-cm-item__status--set')).toBe(true);
    });

    it('renders "● set" status even when cookieValue is empty string', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('mycookie', '', '');
        expect(div.querySelector('.mw-cm-item__status--set')).not.toBeNull();
    });

    it('renders info button and description div when description is provided', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('cookie', 'val', 'My description');
        expect(div.querySelector('.js-mw-cm-item-info')).not.toBeNull();
        expect(div.querySelector('.mw-cm-item__desc')?.textContent).toContain('My description');
    });

    it('does not render info button when description is empty', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('cookie', 'val', '');
        expect(div.querySelector('.js-mw-cm-item-info')).toBeNull();
        expect(div.querySelector('.mw-cm-item__desc')).toBeNull();
    });

    it('escapes HTML in the cookie name', () => {
        const html = itemInfo('<script>xss</script>', null, '');
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });

    it('escapes HTML in the description', () => {
        const html = itemInfo('cookie', null, '<img src=x onerror=alert(1)>');
        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img');
    });
});
