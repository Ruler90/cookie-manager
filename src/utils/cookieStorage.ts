import { devCookie } from '../types/types';
import defaultCookies from '../config/defaultCookies.json';

let sessionConfig: devCookie[] = window.__CM_CONFIG__ ?? (defaultCookies as devCookie[]);

export const loadCookies = (): devCookie[] => sessionConfig;

export const updateCookies = (cookies: devCookie[]): void => {
    sessionConfig = cookies;
};

export const generateBookmarkletUrl = (cookies: devCookie[]): string | null => {
    const template = window.__CM_BOOKMARKLET_TEMPLATE__;
    if (!template) return null;
    const config = JSON.stringify(cookies);
    const templateStr = JSON.stringify(template);
    return `javascript:(()=>{const _C=${config};const _S=${templateStr};window.__CM_CONFIG__=_C;window.__CM_BOOKMARKLET_TEMPLATE__=_S;${template}})()`;
};
