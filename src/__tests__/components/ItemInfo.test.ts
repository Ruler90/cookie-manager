import { describe, it, expect, beforeEach } from 'vitest';
import { showCookieValue, itemInfo } from '../../components/Content/ItemInfo.component';
import { addCookie, deleteCookie, itemButtons } from '../../components/Content/ItemBtns.component';

function makeNode(values: string[] = ['on', 'off']): HTMLElement {
    const node = document.createElement('div');
    node.innerHTML = `
        <div class="mw-cm-item__status js-mw-cm-item-value">not set</div>
        ${values.map((v) => `<button class="mw-cm-item__btn mw-cm-item__btn--add" data-value="${v}">${v}</button>`).join('')}
        <button class="mw-cm-item__btn mw-cm-item__btn--remove" disabled>clear</button>
    `;
    return node;
}

function makeNodeWithPillsRow(values: string[] = ['on', 'off']): HTMLElement {
    const node = document.createElement('div');
    node.innerHTML = `
        <div class="mw-cm-item__status js-mw-cm-item-value">not set</div>
        <div class="mw-cm-item__pills-row">
            ${values.map((v) => `<button class="mw-cm-item__btn mw-cm-item__btn--add" data-value="${v}">${v}</button>`).join('')}
            <button class="mw-cm-item__btn mw-cm-item__btn--remove" disabled>clear</button>
        </div>
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

    it('shows "● other value" status when cookie value is not in configuredValues', () => {
        document.cookie = 'ck=unknown; path=/';
        const node = makeNode(['on', 'off']);
        showCookieValue('ck', node, ['on', 'off']);
        const status = node.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent).toBe('● other value');
        expect(status?.classList.contains('mw-cm-item__status--other')).toBe(true);
        expect(status?.classList.contains('mw-cm-item__status--set')).toBe(false);
    });

    it('shows "● empty value" status when cookie is set to an empty string not in configuredValues', () => {
        document.cookie = 'ck=; path=/';
        const node = makeNode(['on', 'off']);
        showCookieValue('ck', node, ['on', 'off']);
        const status = node.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent).toBe('● empty value');
        expect(status?.classList.contains('mw-cm-item__status--other')).toBe(true);
    });

    it('inserts an unmanaged pill for a non-empty value not in configuredValues', () => {
        document.cookie = 'ck=unknown; path=/';
        const node = makeNodeWithPillsRow(['on', 'off']);
        showCookieValue('ck', node, ['on', 'off']);
        const pill = node.querySelector('.mw-cm-item__btn--unmanaged');
        expect(pill?.textContent).toBe('unknown');
    });

    it('does not insert an unmanaged pill when the value is an empty string', () => {
        document.cookie = 'ck=; path=/';
        const node = makeNodeWithPillsRow(['on', 'off']);
        showCookieValue('ck', node, ['on', 'off']);
        expect(node.querySelector('.mw-cm-item__btn--unmanaged')).toBeNull();
    });

    it('removes an existing unmanaged pill when the value resolves to a configured option', () => {
        document.cookie = 'ck=unknown; path=/';
        const node = document.createElement('div');
        node.innerHTML = itemInfo('ck', 'unknown', '', ['on', 'off']) + itemButtons(['on', 'off'], 'unknown');
        expect(node.querySelector('.mw-cm-item__btn--unmanaged')).not.toBeNull();
        addCookie('ck', 'on', node, ['on', 'off']);
        expect(node.querySelector('.mw-cm-item__btn--unmanaged')).toBeNull();
        expect(node.querySelector('.js-mw-cm-item-value')?.textContent).toBe('● set');
    });

    it('removes an existing unmanaged pill when the cookie is cleared', () => {
        document.cookie = 'ck=unknown; path=/';
        const node = document.createElement('div');
        node.innerHTML = itemInfo('ck', 'unknown', '', ['on', 'off']) + itemButtons(['on', 'off'], 'unknown');
        expect(node.querySelector('.mw-cm-item__btn--unmanaged')).not.toBeNull();
        deleteCookie('ck', node, ['on', 'off']);
        expect(node.querySelector('.mw-cm-item__btn--unmanaged')).toBeNull();
        expect(node.querySelector('.js-mw-cm-item-value')?.textContent).toBe('not set');
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

    it('renders "● other value" status when cookieValue is not in configuredValues', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('ck', 'unknown', '', ['on', 'off']);
        const status = div.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent?.trim()).toBe('● other value');
        expect(status?.classList.contains('mw-cm-item__status--other')).toBe(true);
        expect(status?.classList.contains('mw-cm-item__status--set')).toBe(false);
    });

    it('renders "● empty value" status when cookieValue is empty string not in configuredValues', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('ck', '', '', ['on', 'off']);
        const status = div.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent?.trim()).toBe('● empty value');
        expect(status?.classList.contains('mw-cm-item__status--other')).toBe(true);
    });

    it('renders "● set" status when cookieValue is a configured option', () => {
        const div = document.createElement('div');
        div.innerHTML = itemInfo('ck', 'on', '', ['on', 'off']);
        const status = div.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent?.trim()).toBe('● set');
        expect(status?.classList.contains('mw-cm-item__status--set')).toBe(true);
        expect(status?.classList.contains('mw-cm-item__status--other')).toBe(false);
    });
});
