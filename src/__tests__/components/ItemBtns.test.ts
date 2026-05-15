import { describe, it, expect, beforeEach } from 'vitest';
import { addCookie, deleteCookie, itemButtons } from '../../components/Content/ItemBtns.component';

function makeNode(values: string[]): HTMLElement {
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

describe('addCookie', () => {
    beforeEach(clearAllCookies);

    it('writes the cookie to document.cookie', () => {
        const node = makeNode(['enabled', 'disabled']);
        addCookie('feature', 'enabled', node);
        expect(document.cookie).toContain('feature=enabled');
    });

    it('updates the status element to "● set"', () => {
        const node = makeNode(['on']);
        addCookie('flag', 'on', node);
        const status = node.querySelector('.js-mw-cm-item-value');
        expect(status?.textContent).toBe('● set');
        expect(status?.classList.contains('mw-cm-item__status--set')).toBe(true);
    });

    it('marks the button matching the new value as active', () => {
        const node = makeNode(['on', 'off']);
        addCookie('mode', 'on', node);
        expect(node.querySelector('[data-value="on"]')?.classList.contains('mw-cm-item__btn--active')).toBe(true);
        expect(node.querySelector('[data-value="off"]')?.classList.contains('mw-cm-item__btn--active')).toBe(false);
    });

    it('deactivates the previously active button when setting a different value', () => {
        document.cookie = 'mode=on; path=/';
        const node = makeNode(['on', 'off']);
        node.querySelector('[data-value="on"]')!.classList.add('mw-cm-item__btn--active');
        addCookie('mode', 'off', node);
        expect(node.querySelector('[data-value="on"]')?.classList.contains('mw-cm-item__btn--active')).toBe(false);
        expect(node.querySelector('[data-value="off"]')?.classList.contains('mw-cm-item__btn--active')).toBe(true);
    });

    it('enables the clear button after setting a cookie', () => {
        const node = makeNode(['true']);
        addCookie('enabled', 'true', node);
        expect(node.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')?.disabled).toBe(false);
    });
});

describe('deleteCookie', () => {
    beforeEach(clearAllCookies);

    it('removes the cookie from document.cookie', () => {
        document.cookie = 'todelete=yes; path=/';
        const node = makeNode(['yes']);
        deleteCookie('todelete', node);
        expect(document.cookie).not.toContain('todelete=yes');
    });

    it('updates the status element to "not set"', () => {
        document.cookie = 'statustest=hello; path=/';
        const node = makeNode(['hello']);
        const status = node.querySelector<HTMLElement>('.js-mw-cm-item-value')!;
        status.classList.add('mw-cm-item__status--set');
        status.textContent = '● set';
        deleteCookie('statustest', node);
        expect(status.textContent).toBe('not set');
        expect(status.classList.contains('mw-cm-item__status--set')).toBe(false);
    });

    it('disables the clear button after deletion', () => {
        document.cookie = 'togone=val; path=/';
        const node = makeNode(['val']);
        node.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')!.disabled = false;
        deleteCookie('togone', node);
        expect(node.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')?.disabled).toBe(true);
    });

    it('removes the active state from all value buttons', () => {
        document.cookie = 'feature=on; path=/';
        const node = makeNode(['on', 'off']);
        node.querySelector('[data-value="on"]')!.classList.add('mw-cm-item__btn--active');
        deleteCookie('feature', node);
        expect(node.querySelector('[data-value="on"]')?.classList.contains('mw-cm-item__btn--active')).toBe(false);
    });
});

describe('itemButtons', () => {
    it('renders one button per value', () => {
        const div = document.createElement('div');
        div.innerHTML = itemButtons(['a', 'b', 'c'], null);
        expect(div.querySelectorAll('.mw-cm-item__btn--add').length).toBe(3);
    });

    it('marks only the button matching the current value as active', () => {
        const div = document.createElement('div');
        div.innerHTML = itemButtons(['on', 'off'], 'on');
        const btns = div.querySelectorAll<HTMLButtonElement>('.mw-cm-item__btn--add');
        expect(btns[0]?.classList.contains('mw-cm-item__btn--active')).toBe(true);
        expect(btns[1]?.classList.contains('mw-cm-item__btn--active')).toBe(false);
    });

    it('marks no button as active when cookie is not set', () => {
        const div = document.createElement('div');
        div.innerHTML = itemButtons(['on', 'off'], null);
        div.querySelectorAll<HTMLButtonElement>('.mw-cm-item__btn--add').forEach((btn) => {
            expect(btn.classList.contains('mw-cm-item__btn--active')).toBe(false);
        });
    });

    it('disables the clear button when cookie is not set', () => {
        const div = document.createElement('div');
        div.innerHTML = itemButtons(['v'], null);
        expect(div.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')?.hasAttribute('disabled')).toBe(true);
    });

    it('enables the clear button when cookie is set', () => {
        const div = document.createElement('div');
        div.innerHTML = itemButtons(['v'], 'v');
        expect(div.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove')?.hasAttribute('disabled')).toBe(false);
    });

    it('escapes HTML in value buttons to prevent XSS', () => {
        const html = itemButtons(['<evil>'], null);
        expect(html).not.toContain('<evil>');
        expect(html).toContain('&lt;evil&gt;');
    });

    it('sets data-value attribute on each button', () => {
        const div = document.createElement('div');
        div.innerHTML = itemButtons(['foo', 'bar'], null);
        const btns = div.querySelectorAll<HTMLButtonElement>('.mw-cm-item__btn--add');
        expect(btns[0]?.dataset.value).toBe('foo');
        expect(btns[1]?.dataset.value).toBe('bar');
    });
});
