import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { openCookieEditor } from '../../components/CookieEditor/CookieEditor.component';
import { updateCookies } from '../../utils/cookieStorage';
import type { devCookie } from '../../types/types';

const testCookies: devCookie[] = [
    { name: 'feature_a', values: ['on', 'off'], description: 'Feature A' },
    { name: 'theme', values: ['dark', 'light'], description: '' },
];

beforeEach(() => {
    updateCookies(testCookies);
    window.__CM_BOOKMARKLET_TEMPLATE__ = '/* app */';
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockResolvedValue(undefined) },
        configurable: true,
        writable: true,
    });
});

afterEach(() => {
    // Ensure any open editor is closed (removes document-level keydown listener)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    delete window.__CM_BOOKMARKLET_TEMPLATE__;
    vi.restoreAllMocks();
});

// ─── helpers ──────────────────────────────────────────────────────────────────

function getAcceptBtn() {
    return document.querySelector<HTMLButtonElement>('.mw-ce__accept-btn')!;
}

function makeDirty() {
    const input = document.querySelector<HTMLInputElement>('.mw-ce__input--name')!;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

// ─── opening ──────────────────────────────────────────────────────────────────

describe('opening the editor', () => {
    it('appends the editor overlay to document.body', () => {
        openCookieEditor(vi.fn());
        expect(document.querySelector('.mw-ce-overlay')).not.toBeNull();
    });

    it('renders one entry per configured cookie', () => {
        openCookieEditor(vi.fn());
        expect(document.querySelectorAll('.mw-ce__entry').length).toBe(testCookies.length);
    });

    it('populates the name input of the first entry', () => {
        openCookieEditor(vi.fn());
        const nameInput = document.querySelector<HTMLInputElement>('.mw-ce__input--name');
        expect(nameInput?.value).toBe('feature_a');
    });

    it('populates the description input', () => {
        openCookieEditor(vi.fn());
        const descInput = document.querySelector<HTMLInputElement>('.mw-ce__input--desc');
        expect(descInput?.value).toBe('Feature A');
    });

    it('renders a pill for each preset value', () => {
        openCookieEditor(vi.fn());
        const firstEntry = document.querySelector('.mw-ce__entry')!;
        const pills = firstEntry.querySelectorAll('.mw-ce__pill');
        expect(pills.length).toBe(2); // 'on' and 'off'
    });

    it('shows the cookie count in the footer', () => {
        openCookieEditor(vi.fn());
        const footerLeft = document.querySelector('.mw-ce__footer-left');
        expect(footerLeft?.textContent).toContain(testCookies.length.toString());
        expect(footerLeft?.textContent?.toLowerCase()).toContain('cookie');
    });
});

// ─── dirty / unsaved state ────────────────────────────────────────────────────

describe('unsaved changes state', () => {
    it('Accept button is disabled initially (no changes)', () => {
        openCookieEditor(vi.fn());
        expect(getAcceptBtn().disabled).toBe(true);
    });

    it('Accept button is enabled after typing in a field', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        expect(getAcceptBtn().disabled).toBe(false);
    });

    it('unsaved badge is hidden initially', () => {
        openCookieEditor(vi.fn());
        const badge = document.querySelector<HTMLElement>('.mw-ce__unsaved-badge')!;
        expect(badge.style.display).toBe('none');
    });

    it('unsaved badge becomes visible after making changes', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        const badge = document.querySelector<HTMLElement>('.mw-ce__unsaved-badge')!;
        expect(badge.style.display).not.toBe('none');
    });

    it('footer shows "unsaved changes" label after an edit', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        const footerLeft = document.querySelector('.mw-ce__footer-left');
        expect(footerLeft?.innerHTML).toContain('unsaved changes');
    });
});

// ─── closing without saving ───────────────────────────────────────────────────

describe('closing without saving', () => {
    it('Cancel button removes the editor overlay', () => {
        openCookieEditor(vi.fn());
        document.querySelector<HTMLButtonElement>('.mw-ce__cancel-btn')!.click();
        expect(document.querySelector('.mw-ce-overlay')).toBeNull();
    });

    it('x close button removes the editor overlay', () => {
        openCookieEditor(vi.fn());
        document.querySelector<HTMLButtonElement>('.mw-ce__close-btn')!.click();
        expect(document.querySelector('.mw-ce-overlay')).toBeNull();
    });

    it('pressing Escape removes the editor overlay', () => {
        openCookieEditor(vi.fn());
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.querySelector('.mw-ce-overlay')).toBeNull();
    });
});

// ─── accepting / saving ───────────────────────────────────────────────────────

describe('accepting changes', () => {
    it('calls the onSave callback once when Accept is clicked with valid data', () => {
        const onSave = vi.fn();
        openCookieEditor(onSave);
        makeDirty();
        getAcceptBtn().click();
        expect(onSave).toHaveBeenCalledOnce();
    });

    it('does not call onSave when validation fails', () => {
        const onSave = vi.fn();
        openCookieEditor(onSave);
        // Clear the name of the first entry to make it invalid
        const nameInput = document.querySelector<HTMLInputElement>('.mw-ce__input--name')!;
        nameInput.value = '';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        getAcceptBtn().click();
        expect(onSave).not.toHaveBeenCalled();
    });

    it('shows the bookmark updater panel after a successful Accept', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        getAcceptBtn().click();
        expect(document.querySelector('.mw-ce__updater-url')).not.toBeNull();
    });

    it('the updater URL textarea contains a javascript: URL', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        getAcceptBtn().click();
        const textarea = document.querySelector<HTMLTextAreaElement>('.mw-ce__updater-url');
        expect(textarea?.value).toMatch(/^javascript:/);
    });

    it('shows the "Update your bookmark" heading in the updater screen', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        getAcceptBtn().click();
        expect(document.querySelector('.mw-ce__title')?.textContent).toBe('Update your bookmark');
    });

    it('Done button closes the editor after Accept', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        getAcceptBtn().click(); // Accept → bookmark updater shown
        getAcceptBtn().click(); // Done button (same class on the updater screen)
        expect(document.querySelector('.mw-ce-overlay')).toBeNull();
    });
});

// ─── clipboard copy ───────────────────────────────────────────────────────────

describe('clipboard copy in updater screen', () => {
    it('Copy button calls navigator.clipboard.writeText with the javascript: URL', () => {
        openCookieEditor(vi.fn());
        makeDirty();
        getAcceptBtn().click();

        const copyBtn = document.querySelector<HTMLButtonElement>('.mw-ce__updater-copy-btn')!;
        copyBtn.click();

        expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            expect.stringMatching(/^javascript:/),
        );
    });
});

// ─── adding a cookie ──────────────────────────────────────────────────────────

describe('adding a cookie entry', () => {
    it('+ Add cookie increases the entry count by one', async () => {
        openCookieEditor(vi.fn());
        const before = document.querySelectorAll('.mw-ce__entry').length;

        document.querySelector<HTMLButtonElement>('.mw-ce__header-add-btn')!.click();
        await Promise.resolve(); // flush MutationObserver microtask

        expect(document.querySelectorAll('.mw-ce__entry').length).toBe(before + 1);
    });

    it('the new entry has an empty name input', async () => {
        openCookieEditor(vi.fn());
        document.querySelector<HTMLButtonElement>('.mw-ce__header-add-btn')!.click();
        await Promise.resolve();

        const entries = document.querySelectorAll('.mw-ce__entry');
        const newEntry = entries[0]!;
        expect(newEntry.querySelector<HTMLInputElement>('.mw-ce__input--name')?.value).toBe('');
    });

    it('adding a cookie marks the editor dirty', async () => {
        openCookieEditor(vi.fn());
        document.querySelector<HTMLButtonElement>('.mw-ce__header-add-btn')!.click();
        await Promise.resolve();

        expect(getAcceptBtn().disabled).toBe(false);
    });
});

// ─── deleting a cookie ────────────────────────────────────────────────────────

describe('deleting a cookie entry', () => {
    it('clicking "Delete cookie" shows the confirmation row', () => {
        openCookieEditor(vi.fn());
        document.querySelector<HTMLButtonElement>('.mw-ce__card-del')!.click();
        const entry = document.querySelector('.mw-ce__entry')!;
        expect(entry.classList.contains('mw-ce__entry--confirm-del')).toBe(true);
    });

    it('confirming deletion removes the correct entry from the DOM', async () => {
        openCookieEditor(vi.fn());

        const firstEntry = document.querySelector<HTMLElement>('.mw-ce__entry')!;
        const deletedName = firstEntry.querySelector<HTMLInputElement>('.mw-ce__input--name')!.value;

        firstEntry.querySelector<HTMLButtonElement>('.mw-ce__card-del')!.click();
        firstEntry.querySelector<HTMLButtonElement>('.mw-ce__mini-btn--danger')!.click();
        await Promise.resolve();

        const remaining = Array.from(document.querySelectorAll<HTMLInputElement>('.mw-ce__input--name'));
        expect(remaining.map((i) => i.value)).not.toContain(deletedName);
    });

    it('cancelling deletion keeps the entry in the DOM', () => {
        openCookieEditor(vi.fn());
        const before = document.querySelectorAll('.mw-ce__entry').length;

        document.querySelector<HTMLButtonElement>('.mw-ce__card-del')!.click();
        // Cancel button: the non-danger mini button
        const cancelDel = document.querySelector<HTMLButtonElement>('.mw-ce__mini-btn:not(.mw-ce__mini-btn--danger)')!;
        cancelDel.click();

        expect(document.querySelectorAll('.mw-ce__entry').length).toBe(before);
    });

    it('cancelling deletion hides the confirmation row', () => {
        openCookieEditor(vi.fn());
        const firstEntry = document.querySelector<HTMLElement>('.mw-ce__entry')!;

        document.querySelector<HTMLButtonElement>('.mw-ce__card-del')!.click();
        document.querySelector<HTMLButtonElement>('.mw-ce__mini-btn:not(.mw-ce__mini-btn--danger)')!.click();

        expect(firstEntry.classList.contains('mw-ce__entry--confirm-del')).toBe(false);
    });
});

// ─── pill values ──────────────────────────────────────────────────────────────

describe('pill value input', () => {
    it('pressing Enter in the pill input adds a new pill', () => {
        openCookieEditor(vi.fn());
        const firstEntry = document.querySelector('.mw-ce__entry')!;
        const pillInput = firstEntry.querySelector<HTMLInputElement>('.mw-ce__pill-input')!;
        const before = firstEntry.querySelectorAll('.mw-ce__pill').length;

        pillInput.value = 'newvalue';
        pillInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        expect(firstEntry.querySelectorAll('.mw-ce__pill').length).toBe(before + 1);
    });

    it('the new pill carries the entered value as data-value', () => {
        openCookieEditor(vi.fn());
        const firstEntry = document.querySelector('.mw-ce__entry')!;
        const pillInput = firstEntry.querySelector<HTMLInputElement>('.mw-ce__pill-input')!;

        pillInput.value = 'beta';
        pillInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        const pills = firstEntry.querySelectorAll<HTMLElement>('.mw-ce__pill');
        const values = Array.from(pills).map((p) => p.dataset.value);
        expect(values).toContain('beta');
    });

    it('clicking x on a pill removes that specific pill', () => {
        openCookieEditor(vi.fn());
        const firstEntry = document.querySelector('.mw-ce__entry')!;
        const firstPill = firstEntry.querySelector<HTMLElement>('.mw-ce__pill')!;
        const removedValue = firstPill.dataset.value!;

        firstPill.querySelector<HTMLButtonElement>('.mw-ce__pill-remove')!.click();

        const remaining = Array.from(firstEntry.querySelectorAll<HTMLElement>('.mw-ce__pill'))
            .map((p) => p.dataset.value);
        expect(remaining).not.toContain(removedValue);
    });
});
