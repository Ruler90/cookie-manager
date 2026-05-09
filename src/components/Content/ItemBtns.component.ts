import { showCookieValue } from './ItemInfo.component';

export const addCookie = (cookieName: string, cookieValue: string, node: HTMLElement): void => {
    document.cookie = `${cookieName}=${cookieValue}; path=/`;
    showCookieValue(cookieName, node);
};

export const deleteCookie = (cookieName: string, node: HTMLElement): void => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    showCookieValue(cookieName, node);
};

export const itemButtons = (devCookieValues: string[]): string => {
    const addButtons = devCookieValues.map(
        (value) => `<button class="mw-cm-item__btn mw-cm-item__btn--add" title="${value}">Set value: ${value}</button>`,
    );
    return `${addButtons.join('')}<button class="mw-cm-item__btn mw-cm-item__btn--remove">Remove cookie</button>`;
};
