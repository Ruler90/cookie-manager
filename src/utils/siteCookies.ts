import { siteCookie } from '../types/types';

export const getSiteCookies = () => {
    const siteCookiesList: siteCookie[] = [];
    document.cookie.split(/;\s?/).forEach((item) => {
        const [rawName, ...rest] = item.split('=');
        const name = (rawName || '').trim();
        const value = rest.join('=');
        siteCookiesList.push({ name, value });
    });
    return siteCookiesList;
};
