import { devCookie } from '../../types/types';
import { loadCookies, updateCookies, generateBookmarkletUrl } from '../../utils/cookieStorage';
import { escapeHtml } from '../../utils/escapeHtml';
import { setupDragReorder } from './dragReorder';
import { collectAndValidate } from './validateCookies';

function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) element.classList.add(...className.split(' '));
    return element;
}

function buildPill(value: string): HTMLDivElement {
    const pill = createEl('div', 'mw-ce__pill');
    pill.dataset.value = value;
    pill.title = value;

    const text = createEl('span', 'mw-ce__pill-text');
    text.textContent = value;

    const removeBtn = createEl('button', 'mw-ce__pill-remove');
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `Remove ${value}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => pill.remove());

    pill.append(text, removeBtn);
    return pill;
}

function buildDragHandle(): HTMLDivElement {
    const handle = createEl('div', 'mw-ce__drag-handle');
    handle.setAttribute('aria-label', 'Drag to reorder');
    handle.innerHTML = `<svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/>
        <circle cx="3" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/>
        <circle cx="3" cy="15" r="1.5"/><circle cx="9" cy="15" r="1.5"/>
    </svg>`;
    return handle;
}

function buildEntry(cookie: devCookie, uid: number, options: { isNew?: boolean } = {}): HTMLDivElement {
    const entry = createEl('div', 'mw-ce__entry');
    if (options.isNew) entry.classList.add('mw-ce__entry--new');

    // Name
    const nameField = createEl('div', 'mw-ce__field');
    const nameLabel = createEl('label', 'mw-ce__label');
    nameLabel.textContent = 'Name';
    nameLabel.htmlFor = `mw-ce-name-${uid}`;
    const nameInput = createEl('input', 'mw-ce__input mw-ce__input--name');
    nameInput.id = `mw-ce-name-${uid}`;
    nameInput.type = 'text';
    nameInput.value = cookie.name;
    nameInput.placeholder = 'cookie_name';
    nameField.append(nameLabel, nameInput);

    // Description
    const descField = createEl('div', 'mw-ce__field');
    const descLabel = createEl('label', 'mw-ce__label');
    descLabel.textContent = 'Note';
    descLabel.htmlFor = `mw-ce-desc-${uid}`;
    const descInput = createEl('input', 'mw-ce__input mw-ce__input--desc');
    descInput.id = `mw-ce-desc-${uid}`;
    descInput.type = 'text';
    descInput.value = cookie.description;
    descInput.placeholder = 'Optional description…';
    descField.append(descLabel, descInput);

    // Values — pill container
    const valuesSection = createEl('div', 'mw-ce__values-section');
    const valuesLabel = createEl('label', 'mw-ce__label');
    valuesLabel.textContent = 'Values';
    valuesLabel.htmlFor = `mw-ce-pill-${uid}`;

    const pillsContainer = createEl('div', 'mw-ce__pills');

    const pillInput = createEl('input', 'mw-ce__pill-input');
    pillInput.id = `mw-ce-pill-${uid}`;
    pillInput.type = 'text';
    pillInput.placeholder = 'Add value…';

    const confirmPill = () => {
        const value = pillInput.value.trim();
        if (!value) return;
        pillsContainer.insertBefore(buildPill(value), pillInput);
        pillInput.value = '';
        pillsContainer.classList.remove('mw-ce__pills--error');
        updateMeta();
    };

    pillInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmPill();
        }
    });
    pillInput.addEventListener('blur', () => { pillInput.value = ''; });
    pillsContainer.addEventListener('click', (e) => {
        if (e.target === pillsContainer) pillInput.focus();
    });

    cookie.values.filter((v) => v).forEach((v) => pillsContainer.appendChild(buildPill(v)));
    pillsContainer.appendChild(pillInput);
    valuesSection.append(valuesLabel, pillsContainer);

    // Error
    const errorSpan = createEl('span', 'mw-ce__error');

    // Card actions row
    const cardActions = createEl('div', 'mw-ce__card-actions');
    const valueMeta = createEl('span', 'mw-ce__card-meta');
    const updateMeta = () => {
        const n = pillsContainer.querySelectorAll('.mw-ce__pill').length;
        valueMeta.textContent = `${n} ${n === 1 ? 'value' : 'values'}`;
    };
    updateMeta();

    const deleteBtn = createEl('button', 'mw-ce__card-del');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete cookie';
    cardActions.append(valueMeta, deleteBtn);

    // Inline confirm row
    const confirmRow = createEl('div', 'mw-ce__confirm-row');
    confirmRow.style.display = 'none';
    const confirmMsg = createEl('span', 'mw-ce__confirm-msg');
    const confirmActions = createEl('div', 'mw-ce__confirm-actions');
    const cancelDelBtn = createEl('button', 'mw-ce__mini-btn');
    cancelDelBtn.type = 'button';
    cancelDelBtn.textContent = 'Cancel';
    const confirmDelBtn = createEl('button', 'mw-ce__mini-btn mw-ce__mini-btn--danger');
    confirmDelBtn.type = 'button';
    confirmDelBtn.textContent = 'Delete';
    confirmActions.append(cancelDelBtn, confirmDelBtn);
    confirmRow.append(confirmMsg, confirmActions);

    deleteBtn.addEventListener('click', () => {
        entry.classList.add('mw-ce__entry--confirm-del');
        cardActions.style.display = 'none';
        confirmRow.style.display = '';
        const name = nameInput.value || 'this cookie';
        confirmMsg.innerHTML = `Delete <strong class="mw-ce__confirm-name">${escapeHtml(name)}</strong>?`;
    });

    cancelDelBtn.addEventListener('click', () => {
        entry.classList.remove('mw-ce__entry--confirm-del');
        cardActions.style.display = '';
        confirmRow.style.display = 'none';
    });

    confirmDelBtn.addEventListener('click', () => entry.remove());

    pillsContainer.addEventListener('click', updateMeta);

    const content = createEl('div', 'mw-ce__entry-content');
    content.append(nameField, descField, valuesSection, errorSpan, cardActions, confirmRow);
    entry.append(buildDragHandle(), content);
    return entry;
}

export function openCookieEditor(onSave: () => void): void {
    const overlay = createEl('div', 'mw-ce-overlay');
    const panel = createEl('div', 'mw-ce');

    // Header
    const header = createEl('header', 'mw-ce__header');
    const headerLeft = createEl('div', 'mw-ce__header-left');
    const title = createEl('h2', 'mw-ce__title');
    title.textContent = 'Configure cookies';
    const unsavedBadge = createEl('span', 'mw-ce__unsaved-badge');
    unsavedBadge.textContent = 'Unsaved';
    unsavedBadge.style.display = 'none';
    headerLeft.append(title, unsavedBadge);
    const closeBtn = createEl('button', 'mw-ce__close-btn');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close editor');
    closeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M27.9808 2.01923L2.01929 27.9808" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.01929 2.01923L27.9808 27.9808" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    header.append(headerLeft, closeBtn);

    // Body
    let entryUid = 0;
    const body = createEl('div', 'mw-ce__body');
    loadCookies().forEach((cookie) => body.appendChild(buildEntry(cookie, ++entryUid)));

    const addCookieBtn = createEl('button', 'mw-ce__add-cookie-btn');
    addCookieBtn.type = 'button';
    addCookieBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg> Add cookie';
    addCookieBtn.addEventListener('click', () => {
        const entry = buildEntry({ name: '', values: [], description: '' }, ++entryUid, { isNew: true });
        body.insertBefore(entry, addCookieBtn);
        entry.querySelector<HTMLInputElement>('.mw-ce__input--name')?.focus();
        entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    body.appendChild(addCookieBtn);
    setupDragReorder(body);

    // Footer
    const footer = createEl('footer', 'mw-ce__footer');
    const footerLeft = createEl('span', 'mw-ce__footer-left');
    const footerRight = createEl('span', 'mw-ce__footer-right');
    const cancelBtn = createEl('button', 'mw-ce__cancel-btn');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    const acceptBtn = createEl('button', 'mw-ce__accept-btn');
    acceptBtn.type = 'button';
    acceptBtn.textContent = 'Accept';
    acceptBtn.disabled = true;
    footerRight.append(cancelBtn, acceptBtn);
    footer.append(footerLeft, footerRight);

    panel.append(header, body, footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Dirty tracking
    let dirty = false;

    const updateFooter = () => {
        const n = body.querySelectorAll('.mw-ce__entry').length;
        const countText = `${n} ${n === 1 ? 'cookie' : 'cookies'}`;
        if (dirty) {
            footerLeft.innerHTML = `${countText} <span style="color:#4f46e5">· unsaved changes</span>`;
        } else {
            footerLeft.textContent = countText;
        }
    };

    const markDirty = () => {
        if (!dirty) {
            dirty = true;
            unsavedBadge.style.display = '';
            acceptBtn.disabled = false;
        }
        updateFooter();
    };

    updateFooter();

    const observer = new MutationObserver(markDirty);
    observer.observe(body, { childList: true, subtree: true });
    body.addEventListener('input', markDirty);

    function destroy() {
        observer.disconnect();
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
    }

    function handleEscape(e: KeyboardEvent) {
        if (e.key === 'Escape') destroy();
    }

    document.addEventListener('keydown', handleEscape);
    closeBtn.addEventListener('click', destroy);
    cancelBtn.addEventListener('click', destroy);

    acceptBtn.addEventListener('click', () => {
        const newConfig = collectAndValidate(body);
        if (!newConfig) return;
        updateCookies(newConfig);
        onSave();
        const newUrl = generateBookmarkletUrl(newConfig);
        if (newUrl) {
            showBookmarkUpdater(panel, newUrl, destroy);
        } else {
            destroy();
        }
    });
}

function showBookmarkUpdater(panel: HTMLDivElement, newUrl: string, onClose: () => void): void {
    panel.innerHTML = '';

    const header = createEl('header', 'mw-ce__header');
    const headerLeft = createEl('div', 'mw-ce__header-left');
    const title = createEl('h2', 'mw-ce__title');
    title.textContent = 'Update your bookmark';
    headerLeft.appendChild(title);
    header.appendChild(headerLeft);

    const body = createEl('div', 'mw-ce__body');

    const info = createEl('p', 'mw-ce__updater-info');
    info.textContent =
        'Config saved for this session. To use it on every page and in incognito, copy the URL below and replace your bookmark with it.';

    const urlBox = createEl('textarea', 'mw-ce__updater-url');
    urlBox.readOnly = true;
    urlBox.value = newUrl;
    urlBox.rows = 4;
    urlBox.addEventListener('focus', () => urlBox.select());

    const copyBtn = createEl('button', 'mw-ce__updater-copy-btn');
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy to clipboard';
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(newUrl).then(() => {
            copyBtn.textContent = '✓ Copied';
            copyBtn.classList.add('mw-ce__updater-copy-btn--copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy to clipboard';
                copyBtn.classList.remove('mw-ce__updater-copy-btn--copied');
            }, 1600);
        });
    });

    body.append(info, urlBox, copyBtn);

    const footer = createEl('footer', 'mw-ce__footer');
    const footerLeft = createEl('span', 'mw-ce__footer-left');
    const footerRight = createEl('span', 'mw-ce__footer-right');
    const doneBtn = createEl('button', 'mw-ce__accept-btn');
    doneBtn.type = 'button';
    doneBtn.textContent = 'Done';
    doneBtn.addEventListener('click', onClose);
    footerRight.appendChild(doneBtn);
    footer.append(footerLeft, footerRight);

    panel.append(header, body, footer);
}
