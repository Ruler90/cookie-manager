import { siteCookie } from '../types/types';

export const getSiteCookies = () => {
    const siteCookiesList: siteCookie[] = [];
    document.cookie.split(/;\s?/).forEach((item) => {
        siteCookiesList.push({ name: item.split('=')[0], value: item.split('=')[1] });
    });
    return siteCookiesList;
};
