import { deleteCookie } from '../Content/ItemBtns.component';

export const closeCookieManager = (): void => {
    document.querySelector('.mw-cookie-manager-overlay')?.remove();
    document.querySelector('.mw-cookie-manager')?.remove();
};

export const refresh = (): void => {
    location.reload();
};

export const deleteAllCookies = (cookieNodes: Map<string, HTMLElement>): void => {
    cookieNodes.forEach((node, cookieName) => deleteCookie(cookieName, node));
};
