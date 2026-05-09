import { devCookiesList } from '../../utils/devCookies';
import { deleteCookie } from '../Content/ItemBtns.component';

export const closeCookieManager = (): void => {
    document.querySelector('.mw-cookie-manager-overlay')?.remove();
    document.querySelector('.mw-cookie-manager')?.remove();
};

export const refresh = (): void => {
    location.reload();
};

export const deleteAllCookies = (cookieNodes: Map<string, HTMLElement>): void => {
    devCookiesList.forEach((cookie) => {
        const node = cookieNodes.get(cookie.name);
        if (node) deleteCookie(cookie, node);
    });
};
