import { getSiteCookies } from '../../utils/siteCookies';
import { escapeHtml } from '../../utils/escapeHtml';

export const showCookieValue = (cookieName: string, node: HTMLElement): void => {
    const valueEl = node.querySelector('.js-mw-cm-item-value')!;
    const match = getSiteCookies().find((siteCookie) => siteCookie.name === cookieName);
    valueEl.textContent = match?.value ?? 'No cookie';
};

export const itemInfo = (cookieName: string, cookieValue: string | null, cookieDescription: string) => `
    <div class="mw-cm-item__info">
        <span class="mw-cm-item__info-text mw-cm-item__info-text--name"
            ${cookieDescription ? 'title="' + escapeHtml(cookieDescription) + '"' : ''}>${escapeHtml(cookieName)}
        </span>
        <span class="mw-cm-item__info-text mw-cm-item__info-text--separator">|</span>
        <span class="mw-cm-item__info-text mw-cm-item__info-text--description js-mw-cm-item-value">
            ${escapeHtml(cookieValue ?? 'No cookie')}
        </span>
    </div>
`;
