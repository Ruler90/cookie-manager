import { cookieManagerSkeleton } from './components/CookieManagerSkeleton.component';
import styles from './styles/styles.module.css?raw';
import { refresh } from './components/Header/RefreshBtn.component';
import { deleteDevCookies } from './components/Header/RemoveBtn.component';
import { closeCookieManager } from './components/Header/CloseBtn.component';
import { getSiteCookies } from './utils/siteCookies';
import { devCookiesList } from './utils/devCookies';
import { itemInfo } from './components/Content/ItemInfo.component';
import { itemButtons, addCookie, deleteCookie } from './components/Content/ItemBtns.component';

(() => {
    const runCookieManager = () => {
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
            cookieManager
                .querySelector('.mw-cm__header-remove-btn')
                ?.addEventListener('click', () => deleteDevCookies());
            cookieManager.querySelector('.mw-cm__header-refresh-btn')?.addEventListener('click', () => refresh());
            cookieManager
                .querySelector('.mw-cm__header-close-btn')
                ?.addEventListener('click', () => closeCookieManager());
            document.body.appendChild(cookieManager);
        };

        const generateItems = () => {
            const cookieManagerContent = document.querySelector('.mw-cm-content');

            const siteCookiesList = getSiteCookies();
            devCookiesList.forEach((devCookie) => {
                let cookieValue: string | null = null;
                siteCookiesList.forEach((siteCookie) => {
                    if (devCookie.name === siteCookie.name) {
                        cookieValue = siteCookie.value;
                    }
                });
                const cookieManagerItem = document.createElement('div');
                devCookie.node = cookieManagerItem;
                cookieManagerItem.classList.add('mw-cm-item');
                cookieManagerItem.innerHTML =
                    itemInfo(devCookie.name, cookieValue, devCookie.description) + itemButtons(devCookie.values);
                cookieManagerItem.querySelectorAll('.mw-cm-item__btn--add')?.forEach((item, index) => {
                    item.addEventListener('click', () => addCookie(devCookie, index));
                });
                cookieManagerItem
                    .querySelector('.mw-cm-item__btn--remove')
                    ?.addEventListener('click', () => deleteCookie(devCookie));
                cookieManagerContent?.appendChild(cookieManagerItem);
            });
        };

        const displayCookieManager = () => {
            if (!document.querySelector('.mw-cookie-manager')) {
                generateOverlay();
                generateCookieManager();
                generateItems();
            } else {
                alert('Another instance of Cookie Manager is already opened');
            }
        };
        displayCookieManager();
    };
    runCookieManager();
})();
