import { devCookie } from '../../types/types';
import { loadCookies, updateCookies, generateBookmarkletUrl } from '../../utils/cookieStorage';

const CE = 'mw-ce';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (className) element.classList.add(...className.split(' '));
    return element;
}

function buildPill(value: string): HTMLDivElement {
    const pill = el('div', `${CE}__pill`);
    pill.dataset.value = value;

    const text = el('span', `${CE}__pill-text`);
    text.textContent = value;

    const removeBtn = el('button', `${CE}__pill-remove`);
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `Remove ${value}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => pill.remove());

    pill.append(text, removeBtn);
    return pill;
}

function buildDragHandle(): HTMLDivElement {
    const handle = el('div', `${CE}__drag-handle`);
    handle.setAttribute('aria-label', 'Drag to reorder');
    handle.innerHTML = `<svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor" aria-hidden="true">
        <circle cx="3" cy="3" r="1.5"/><circle cx="9" cy="3" r="1.5"/>
        <circle cx="3" cy="9" r="1.5"/><circle cx="9" cy="9" r="1.5"/>
        <circle cx="3" cy="15" r="1.5"/><circle cx="9" cy="15" r="1.5"/>
    </svg>`;
    return handle;
}

function buildEntry(cookie: devCookie): HTMLDivElement {
    const entry = el('div', `${CE}__entry`);

    // Name
    const nameField = el('div', `${CE}__field`);
    const nameLabel = el('label', `${CE}__label`);
    nameLabel.textContent = 'Name';
    const nameInput = el('input', `${CE}__input ${CE}__input--name`);
    nameInput.type = 'text';
    nameInput.value = cookie.name;
    nameField.append(nameLabel, nameInput);

    // Description
    const descField = el('div', `${CE}__field`);
    const descLabel = el('label', `${CE}__label`);
    descLabel.textContent = 'Description';
    const descInput = el('input', `${CE}__input ${CE}__input--desc`);
    descInput.type = 'text';
    descInput.value = cookie.description;
    descField.append(descLabel, descInput);

    // Values — pill container
    const valuesSection = el('div', `${CE}__values-section`);
    const valuesLabel = el('label', `${CE}__label`);
    valuesLabel.textContent = 'Values';

    const pillsContainer = el('div', `${CE}__pills`);

    const pillInput = el('input', `${CE}__pill-input`);
    pillInput.type = 'text';
    pillInput.placeholder = 'Add value…';

    const confirmPill = () => {
        const value = pillInput.value.trim();
        if (!value) return;
        pillsContainer.insertBefore(buildPill(value), pillInput);
        pillInput.value = '';
        pillsContainer.classList.remove(`${CE}__pills--error`);
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
    const errorSpan = el('span', `${CE}__error`);

    // Delete entry
    const deleteBtn = el('button', `${CE}__delete-btn`);
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete cookie';
    deleteBtn.addEventListener('click', () => entry.remove());

    const content = el('div', `${CE}__entry-content`);
    content.append(nameField, descField, valuesSection, errorSpan, deleteBtn);
    entry.append(buildDragHandle(), content);
    return entry;
}

function setupDragReorder(body: HTMLElement): void {
    let dragged: HTMLElement | null = null;
    let indicator: HTMLElement | null = null;
    let dropAbove = true;
    let pendingDraggable: HTMLElement | null = null;

    body.addEventListener('mousedown', (e) => {
        const handle = (e.target as HTMLElement).closest<HTMLElement>(`.${CE}__drag-handle`);
        if (!handle) return;
        const entry = handle.closest<HTMLElement>(`.${CE}__entry`);
        if (entry) { entry.draggable = true; pendingDraggable = entry; }
    });

    body.addEventListener('mouseup', () => {
        if (pendingDraggable && !dragged) pendingDraggable.draggable = false;
        pendingDraggable = null;
    });

    body.addEventListener('dragstart', (e) => {
        const entry = (e.target as HTMLElement).closest<HTMLElement>(`.${CE}__entry`);
        if (!entry?.draggable) { e.preventDefault(); return; }
        dragged = entry;
        entry.classList.add(`${CE}__entry--dragging`);
        e.dataTransfer!.effectAllowed = 'move';
    });

    body.addEventListener('dragover', (e) => {
        e.preventDefault();
        const entry = (e.target as HTMLElement).closest<HTMLElement>(`.${CE}__entry`);
        if (!entry || entry === dragged) return;
        clearIndicator();
        const rect = entry.getBoundingClientRect();
        dropAbove = e.clientY < rect.top + rect.height / 2;
        indicator = entry;
        entry.classList.add(dropAbove ? `${CE}__entry--drop-above` : `${CE}__entry--drop-below`);
        e.dataTransfer!.dropEffect = 'move';
    });

    body.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!dragged || !indicator) return;
        if (dropAbove) body.insertBefore(dragged, indicator);
        else indicator.after(dragged);
        clearIndicator();
    });

    body.addEventListener('dragend', () => {
        if (dragged) { dragged.classList.remove(`${CE}__entry--dragging`); dragged.draggable = false; dragged = null; }
        pendingDraggable = null;
        clearIndicator();
    });

    function clearIndicator() {
        if (indicator) {
            indicator.classList.remove(`${CE}__entry--drop-above`, `${CE}__entry--drop-below`);
            indicator = null;
        }
    }
}

function collectAndValidate(body: HTMLElement): devCookie[] | null {
    // Clear previous error state
    body.querySelectorAll(`.${CE}__error`).forEach((e) => {
        e.textContent = '';
        e.classList.remove(`${CE}__error--visible`);
    });
    body.querySelectorAll(`.${CE}__input--error`).forEach((i) => i.classList.remove(`${CE}__input--error`));
    body.querySelectorAll(`.${CE}__pills--error`).forEach((p) => p.classList.remove(`${CE}__pills--error`));

    const entries = Array.from(body.querySelectorAll<HTMLElement>(`.${CE}__entry`));
    let valid = true;
    const cookies: devCookie[] = [];

    entries.forEach((entry) => {
        const nameInput = entry.querySelector<HTMLInputElement>(`.${CE}__input--name`);
        const descInput = entry.querySelector<HTMLInputElement>(`.${CE}__input--desc`);
        const pillsContainer = entry.querySelector<HTMLElement>(`.${CE}__pills`);
        const errorSpan = entry.querySelector<HTMLElement>(`.${CE}__error`);
        if (!nameInput || !descInput || !pillsContainer || !errorSpan) return;

        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const values = Array.from(pillsContainer.querySelectorAll<HTMLElement>(`.${CE}__pill`))
            .map((p) => p.dataset.value ?? '')
            .filter((v) => v);

        function showError(msg: string, input?: HTMLInputElement, pills?: HTMLElement) {
            if (!errorSpan) return;
            errorSpan.textContent = msg;
            errorSpan.classList.add(`${CE}__error--visible`);
            if (input) input.classList.add(`${CE}__input--error`);
            if (pills) pills.classList.add(`${CE}__pills--error`);
            valid = false;
        }

        if (!name) { showError('Name is required', nameInput); return; }
        if (/[;,\s=]/.test(name)) { showError('Name must not contain spaces, semicolons, commas, or =', nameInput); return; }
        if (values.length === 0) { showError('At least one value is required', undefined, pillsContainer); return; }

        cookies.push({ name, description, values });
    });

    if (!valid) return null;

    // Duplicate name check — mark every occurrence, not just the second
    const nameCounts = new Map<string, number>();
    cookies.forEach((c) => nameCounts.set(c.name, (nameCounts.get(c.name) ?? 0) + 1));
    entries.forEach((entry, i) => {
        const name = cookies[i]?.name;
        if (!name) return;
        if ((nameCounts.get(name) ?? 0) > 1) {
            const nameInput = entry.querySelector<HTMLInputElement>(`.${CE}__input--name`);
            const errorSpan = entry.querySelector<HTMLElement>(`.${CE}__error`);
            if (!nameInput || !errorSpan) return;
            errorSpan.textContent = 'Duplicate cookie name';
            errorSpan.classList.add(`${CE}__error--visible`);
            nameInput.classList.add(`${CE}__input--error`);
            valid = false;
        }
    });

    return valid ? cookies : null;
}

export function openCookieEditor(onSave: () => void): void {
    const overlay = el('div', `${CE}-overlay`);
    const panel = el('div', CE);

    // Header
    const header = el('header', `${CE}__header`);
    const title = el('h2', `${CE}__title`);
    title.textContent = 'Configure Cookies';
    const closeBtn = el('button', `${CE}__close-btn`);
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close editor');
    closeBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M27.9808 2.01923L2.01929 27.9808" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.01929 2.01923L27.9808 27.9808" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
    header.append(title, closeBtn);

    // Body
    const body = el('div', `${CE}__body`);
    loadCookies().forEach((cookie) => body.appendChild(buildEntry(cookie)));

    const addCookieBtn = el('button', `${CE}__add-cookie-btn`);
    addCookieBtn.type = 'button';
    addCookieBtn.textContent = '+ Add cookie';
    addCookieBtn.addEventListener('click', () => {
        const entry = buildEntry({ name: '', values: [], description: '' });
        body.insertBefore(entry, addCookieBtn);
        entry.querySelector<HTMLInputElement>(`.${CE}__input--name`)?.focus();
        entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    body.appendChild(addCookieBtn);
    setupDragReorder(body);

    // Footer
    const footer = el('footer', `${CE}__footer`);
    const cancelBtn = el('button', `${CE}__cancel-btn`);
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    const acceptBtn = el('button', `${CE}__accept-btn`);
    acceptBtn.type = 'button';
    acceptBtn.textContent = 'Accept';
    footer.append(cancelBtn, acceptBtn);

    panel.append(header, body, footer);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function destroy() {
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

    const header = el('header', `${CE}__header`);
    const title = el('h2', `${CE}__title`);
    title.textContent = 'Update your bookmark';
    header.appendChild(title);

    const body = el('div', `${CE}__body`);

    const info = el('p', `${CE}__updater-info`);
    info.textContent =
        'Config saved for this session. To use it on every page and in incognito, copy the URL below and replace your bookmark with it.';

    const urlBox = el('textarea', `${CE}__updater-url`);
    urlBox.readOnly = true;
    urlBox.value = newUrl;
    urlBox.rows = 4;

    const copyBtn = el('button', `${CE}__updater-copy-btn`);
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy to clipboard';
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(newUrl).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => { copyBtn.textContent = 'Copy to clipboard'; }, 2000);
        });
    });

    body.append(info, urlBox, copyBtn);

    const footer = el('footer', `${CE}__footer`);
    const closeBtn = el('button', `${CE}__accept-btn`);
    closeBtn.type = 'button';
    closeBtn.textContent = 'Done';
    closeBtn.addEventListener('click', onClose);
    footer.appendChild(closeBtn);

    panel.append(header, body, footer);
}
