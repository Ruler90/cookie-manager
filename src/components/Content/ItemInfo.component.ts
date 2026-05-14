import { getSiteCookies } from '../../utils/siteCookies';
import { escapeHtml } from '../../utils/escapeHtml';

export const showCookieValue = (cookieName: string, node: HTMLElement): void => {
    const statusEl = node.querySelector<HTMLElement>('.js-mw-cm-item-value');
    if (!statusEl) return;
    const match = getSiteCookies().find((siteCookie) => siteCookie.name === cookieName);
    const value = match?.value ?? null;

    if (value !== null) {
        statusEl.textContent = '● set';
        statusEl.className = 'mw-cm-item__status mw-cm-item__status--set js-mw-cm-item-value';
    } else {
        statusEl.textContent = 'not set';
        statusEl.className = 'mw-cm-item__status js-mw-cm-item-value';
    }

    node.querySelectorAll<HTMLElement>('.mw-cm-item__btn--add').forEach((btn) => {
        btn.classList.toggle('mw-cm-item__btn--active', btn.dataset.value === value);
    });

    const clearBtn = node.querySelector<HTMLButtonElement>('.mw-cm-item__btn--remove');
    if (clearBtn) clearBtn.disabled = value === null;
};

export const itemInfo = (cookieName: string, cookieValue: string | null, cookieDescription: string) => `
    <div class="mw-cm-item__row">
        <div class="mw-cm-item__name"><code title="${escapeHtml(cookieName)}">${escapeHtml(cookieName)}</code></div>
        <div class="mw-cm-item__status ${cookieValue !== null ? 'mw-cm-item__status--set' : ''} js-mw-cm-item-value">${cookieValue !== null ? '● set' : 'not set'}</div>
        ${cookieDescription ? '<button class="mw-cm-item__info js-mw-cm-item-info" aria-expanded="false" aria-label="Show description"><svg width="2" height="8" viewBox="0 0 2 8" fill="currentColor" aria-hidden="true"><rect width="2" height="2" rx="1"/><rect y="3.5" width="2" height="4.5" rx="0.5"/></svg></button>' : ''}
    </div>
    ${cookieDescription ? `<div class="mw-cm-item__desc" role="region" aria-hidden="true">${escapeHtml(cookieDescription)}</div>` : ''}
`;
