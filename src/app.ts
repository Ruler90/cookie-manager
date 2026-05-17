import { cookieManagerSkeleton } from './components/CookieManagerSkeleton.component';
import styles from './styles/styles.scss?inline';
import { closeCookieManager, refresh, deleteAllCookies } from './components/Header/Header.actions';
import { getSiteCookies } from './utils/siteCookies';
import { findCookieValue } from './utils/cookieUtils';
import { loadCookies } from './utils/cookieStorage';
import { itemInfo } from './components/Content/ItemInfo.component';
import { itemButtons, addCookie, deleteCookie } from './components/Content/ItemBtns.component';
import { openCookieEditor } from './components/CookieEditor/CookieEditor.component';
// __FIREFOX__ is a compile-time constant injected by Vite; the CookieEditor import above
// is fully tree-shaken out of the Firefox build because all its references are in dead code.

(() => {
    const existing = document.querySelector<HTMLElement>('.mw-cookie-manager');
    if (existing) {
        existing.classList.add('mw-cookie-manager--flash');
        existing.addEventListener('animationend', () => existing.classList.remove('mw-cookie-manager--flash'), { once: true });
        return;
    }

    const cookieNodes = new Map<string, HTMLElement>();

    const generateOverlay = () => {
        const overlay = document.createElement('div');
        overlay.classList.add('mw-cookie-manager-overlay');
        document.body.appendChild(overlay);
    };

    const updateFooterCount = () => {
        const countEl = document.querySelector('.js-mw-cm-footer-count');
        if (!countEl) return;
        const n = cookieNodes.size;
        countEl.textContent = `${n} cookie${n !== 1 ? 's' : ''} tracked`;
    };

    const renderItems = () => {
        const cookieManagerContent = document.querySelector('.mw-cm-content');
        if (!cookieManagerContent) return;
        cookieManagerContent.innerHTML = '';
        cookieNodes.clear();
        const siteCookiesList = getSiteCookies();
        loadCookies().forEach((devCookie) => {
            const cookieValue = findCookieValue(devCookie.name, siteCookiesList);
            const cookieManagerItem = document.createElement('div');
            cookieNodes.set(devCookie.name, cookieManagerItem);
            cookieManagerItem.classList.add('mw-cm-item');
            cookieManagerItem.innerHTML =
                itemInfo(devCookie.name, cookieValue, devCookie.description, devCookie.values) + itemButtons(devCookie.values, cookieValue);
            cookieManagerItem.querySelectorAll('.mw-cm-item__btn--add').forEach((btn, index) => {
                btn.addEventListener('click', () =>
                    addCookie(devCookie.name, devCookie.values[index] ?? '', cookieManagerItem, devCookie.values),
                );
            });
            cookieManagerItem
                .querySelector('.mw-cm-item__btn--remove')
                ?.addEventListener('click', () => deleteCookie(devCookie.name, cookieManagerItem, devCookie.values));
            const infoBtn = cookieManagerItem.querySelector<HTMLButtonElement>('.js-mw-cm-item-info');
            infoBtn?.addEventListener('click', () => {
                const isOpen = cookieManagerItem.classList.toggle('is-open');
                infoBtn.setAttribute('aria-expanded', String(isOpen));
                infoBtn.setAttribute('aria-label', isOpen ? 'Hide description' : 'Show description');
                cookieManagerItem.querySelector('.mw-cm-item__desc')?.setAttribute('aria-hidden', String(!isOpen));
            });
            cookieManagerContent.appendChild(cookieManagerItem);
        });
        updateFooterCount();
    };

    const generateCookieManager = () => {
        const cookieManager = document.createElement('div');
        cookieManager.classList.add('mw-cookie-manager');
        cookieManager.innerHTML = cookieManagerSkeleton;
        const cookieManagerStyles = document.createElement('style');
        cookieManagerStyles.textContent = styles;
        cookieManager.appendChild(cookieManagerStyles);
        cookieManager.querySelector('.mw-cm__header-remove-btn')?.addEventListener('click', () => deleteAllCookies(cookieNodes));
        if (!__FIREFOX__) {
            cookieManager.querySelector('.mw-cm__header-settings-btn')?.addEventListener('click', () => openCookieEditor(renderItems));
        }
        cookieManager.querySelector('.mw-cm__header-refresh-btn')?.addEventListener('click', () => refresh());
        cookieManager.querySelector('.mw-cm__header-close-btn')?.addEventListener('click', () => closeCookieManager());
        document.body.appendChild(cookieManager);
    };

    generateOverlay();
    generateCookieManager();
    renderItems();
})();
