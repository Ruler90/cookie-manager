import { devCookie } from '../../types/types';
import { showCookieValue } from './ItemInfo.component';

export const addCookie = (cookie: devCookie, index: number, node: HTMLElement): void => {
    document.cookie = `${cookie.name}=${cookie.values[index]}; path=/`;
    showCookieValue(cookie, node);
};

export const deleteCookie = (cookie: devCookie, node: HTMLElement): void => {
    document.cookie = `${cookie.name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    showCookieValue(cookie, node);
};

export const itemButtons = (devCookieValues: string[]): string => {
    const addButtons = devCookieValues.map(
        (value) => `<button class="mw-cm-item__btn mw-cm-item__btn--add" title="${value}">Set value: ${value}</button>`,
    );
    return `${addButtons.join('')}<button class="mw-cm-item__btn mw-cm-item__btn--remove">Remove cookie</button>`;
};
