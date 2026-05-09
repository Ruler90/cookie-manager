import { cookieManagerSkeleton } from './components/CookieManagerSkeleton.component';
import styles from './styles/styles.module.css?raw';
import { closeCookieManager, refresh, deleteAllCookies } from './components/Header/Header.actions';
import { devCookiesList } from './utils/devCookies';
import { getSiteCookies } from './utils/siteCookies';
import { findCookieValue } from './utils/cookieUtils';
import { itemInfo } from './components/Content/ItemInfo.component';
import { itemButtons, addCookie, deleteCookie } from './components/Content/ItemBtns.component';

(() => {
    if (document.querySelector('.mw-cookie-manager')) {
        alert('Another instance of Cookie Manager is already opened');
        return;
    }

    const cookieNodes = new Map<string, HTMLElement>();

    const generateOverlay = () => {
        const overlay = document.createElement('div');
        overlay.classList.add('mw-cookie-manager-overlay');
        document.body.appendChild(overlay);
    };

    const generateCookieManager = () => {
        const cookieManager = document.createElement('div');
        cookieManager.classList.add('mw-cookie-manager');
        cookieManager.innerHTML = cookieManagerSkeleton;
        const cookieManagerStyles = document.createElement('style');
        cookieManagerStyles.innerHTML = styles;
        cookieManager.appendChild(cookieManagerStyles);
        cookieManager.querySelector('.mw-cm__header-remove-btn')?.addEventListener('click', () => deleteAllCookies(cookieNodes));
        cookieManager.querySelector('.mw-cm__header-refresh-btn')?.addEventListener('click', () => refresh());
        cookieManager.querySelector('.mw-cm__header-close-btn')?.addEventListener('click', () => closeCookieManager());
        document.body.appendChild(cookieManager);
    };

    const generateItems = () => {
        const cookieManagerContent = document.querySelector('.mw-cm-content');
        const siteCookiesList = getSiteCookies();

        devCookiesList.forEach((devCookie) => {
            const cookieValue = findCookieValue(devCookie.name, siteCookiesList);
            const cookieManagerItem = document.createElement('div');
            cookieNodes.set(devCookie.name, cookieManagerItem);
            cookieManagerItem.classList.add('mw-cm-item');
            cookieManagerItem.innerHTML =
                itemInfo(devCookie.name, cookieValue, devCookie.description) + itemButtons(devCookie.values);
            cookieManagerItem.querySelectorAll('.mw-cm-item__btn--add').forEach((btn, index) => {
                btn.addEventListener('click', () => addCookie(devCookie, index, cookieManagerItem));
            });
            cookieManagerItem
                .querySelector('.mw-cm-item__btn--remove')
                ?.addEventListener('click', () => deleteCookie(devCookie, cookieManagerItem));
            cookieManagerContent?.appendChild(cookieManagerItem);
        });
    };

    generateOverlay();
    generateCookieManager();
    generateItems();
})();
