import { devCookie } from './types';

declare global {
    interface Window {
        __CM_CONFIG__?: devCookie[];
        __CM_BOOKMARKLET_TEMPLATE__?: string;
    }
}
