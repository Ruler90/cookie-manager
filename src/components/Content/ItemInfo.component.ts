import { getSiteCookies } from '../../utils/siteCookies';
import { escapeHtml } from '../../utils/escapeHtml';

export const showCookieValue = (cookieName: string, node: HTMLElement, configuredValues?: string[]): void => {
    const statusEl = node.querySelector<HTMLElement>('.js-mw-cm-item-value');
    if (!statusEl) return;
    const match = getSiteCookies().find((siteCookie) => siteCookie.name === cookieName);
    const value = match?.value ?? null;
    const isUnmanaged = configuredValues !== undefined && value !== null && !configuredValues.includes(value);

    if (isUnmanaged) {
        statusEl.textContent = value === '' ? '● empty value' : '● other value';
        statusEl.className = 'mw-cm-item__status mw-cm-item__status--other js-mw-cm-item-value';
    } else if (value !== null) {
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

    const pillsRow = node.querySelector<HTMLElement>('.mw-cm-item__pills-row');
    const existingUnmanaged = node.querySelector<HTMLElement>('.mw-cm-item__btn--unmanaged');
    if (isUnmanaged && value !== '') {
        if (existingUnmanaged) {
            existingUnmanaged.textContent = value;
        } else if (pillsRow) {
            const pill = document.createElement('span');
            pill.className = 'mw-cm-item__btn mw-cm-item__btn--unmanaged';
            pill.textContent = value;
            pillsRow.insertBefore(pill, pillsRow.firstChild);
        }
    } else {
        existingUnmanaged?.remove();
    }
};

export const itemInfo = (cookieName: string, cookieValue: string | null, cookieDescription: string, configuredValues?: string[]) => {
    const isOther = configuredValues !== undefined && cookieValue !== null && !configuredValues.includes(cookieValue);
    const statusModifier = isOther ? 'mw-cm-item__status--other' : (cookieValue !== null ? 'mw-cm-item__status--set' : '');
    const statusText = isOther ? (cookieValue === '' ? '● empty value' : '● other value') : (cookieValue !== null ? '● set' : 'not set');
    return `
    <div class="mw-cm-item__row">
        <div class="mw-cm-item__name"><code title="${escapeHtml(cookieName)}">${escapeHtml(cookieName)}</code></div>
        <div class="mw-cm-item__status ${statusModifier} js-mw-cm-item-value">${statusText}</div>
        ${cookieDescription ? '<button class="mw-cm-item__info js-mw-cm-item-info" aria-expanded="false" aria-label="Show description"><svg width="2" height="8" viewBox="0 0 2 8" fill="currentColor" aria-hidden="true"><rect width="2" height="2" rx="1"/><rect y="3.5" width="2" height="4.5" rx="0.5"/></svg></button>' : ''}
    </div>
    ${cookieDescription ? `<div class="mw-cm-item__desc" role="region" aria-hidden="true">${escapeHtml(cookieDescription)}</div>` : ''}
`;
};
