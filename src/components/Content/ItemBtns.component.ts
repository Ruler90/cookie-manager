import { devCookie } from '../../types/types';
import { showCookieValue } from './ItemInfo.component';

export const addCookie = (cookie: devCookie, index: number) => {
    document.cookie = cookie.name + '=' + cookie.values[index] + '; path=/';
    showCookieValue(cookie);
};

export const deleteCookie = (cookie: devCookie) => {
    document.cookie = cookie.name + '=;' + 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    if (cookie.node) {
        cookie.node.querySelector('.js-mw-cm-item-value')!.textContent = 'No cookie';
        // to make sure the cookie doesn't exist
        showCookieValue(cookie);
    }
};

// Generate HTML for the buttons below every dev cookie
export const itemButtons = (devCookieValues: string[]) => {
    const addButtons: string[] = [];
    devCookieValues.forEach((item) => {
        addButtons.push(`<button class="mw-cm-item__btn mw-cm-item__btn--add" title="${item}">Set value: ${item}</button>`);
    });
    return `${addButtons.join('')} <button class="mw-cm-item__btn mw-cm-item__btn--remove">Remove cookie</button>`;
};
