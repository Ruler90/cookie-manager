import { showCookieValue } from './ItemInfo.component';
import { escapeHtml } from '../../utils/escapeHtml';

export const addCookie = (cookieName: string, cookieValue: string, node: HTMLElement, configuredValues?: string[]): void => {
    document.cookie = `${cookieName}=${cookieValue}; path=/`;
    showCookieValue(cookieName, node, configuredValues);
};

export const deleteCookie = (cookieName: string, node: HTMLElement, configuredValues?: string[]): void => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    showCookieValue(cookieName, node, configuredValues);
};

export const itemButtons = (devCookieValues: string[], currentValue: string | null): string => {
    const isUnmanaged = currentValue !== null && !devCookieValues.includes(currentValue);
    const unmanagedPill = isUnmanaged && currentValue !== ''
        ? `<span class="mw-cm-item__btn mw-cm-item__btn--unmanaged" title="${escapeHtml(currentValue)}">${escapeHtml(currentValue)}</span>`
        : '';
    const addButtons = devCookieValues.map(
        (value) =>
            `<button class="mw-cm-item__btn mw-cm-item__btn--add${currentValue === value ? ' mw-cm-item__btn--active' : ''}" data-value="${escapeHtml(value)}" title="${escapeHtml(value)}">${escapeHtml(value)}</button>`,
    );
    return `<div class="mw-cm-item__pills-row">${unmanagedPill}${addButtons.join('')}<button class="mw-cm-item__btn mw-cm-item__btn--remove"${currentValue === null ? ' disabled' : ''}>clear</button></div>`;
};
