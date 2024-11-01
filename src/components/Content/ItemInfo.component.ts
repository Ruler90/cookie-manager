import { devCookie } from '../../types/types';
import { getSiteCookies } from '../../utils/siteCookies';

// Get all site cookies, match with a dev cookie and show the current value
export const showCookieValue = (cookie: devCookie) => {
    const siteCookiesList = getSiteCookies();
    siteCookiesList.forEach((siteCookie) => {
        if (cookie.name === siteCookie.name && cookie.node) {
            cookie.node.querySelector('.js-mw-cm-item-value')!.textContent = siteCookie.value;
        }
    });
};

// Generate HTML for the description of every dev cookie
export const itemInfo = (cookieName: string, cookieValue: string | null, cookieDescription: string) => `
    <div class="mw-cm-item__info">
        <h3 class="mw-cm-item__info-text mw-cm-item__info-text--header">Cookie</h3>
        <span class="mw-cm-item__info-text mw-cm-item__info-text--separator">|</span>
        <h3 class="mw-cm-item__info-text mw-cm-item__info-text--header">Status/value</h3>
        <span class="mw-cm-item__info-text mw-cm-item__info-text--name"
            ${cookieDescription ? 'title="' + cookieDescription + '"' : ''}>${cookieName}
        </span>
        <span class="mw-cm-item__info-text mw-cm-item__info-text--separator">|</span>
        <span class="mw-cm-item__info-text mw-cm-item__info-text--description js-mw-cm-item-value">
            ${cookieValue || 'No cookie'}
        </span>
    </div>
`;
