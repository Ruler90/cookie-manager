import { siteCookie } from '../types/types';

export const findCookieValue = (cookieName: string, siteCookies: siteCookie[]): string | null => {
    const match = siteCookies.find((siteCookie) => siteCookie.name === cookieName);
    return match?.value ?? null;
};
