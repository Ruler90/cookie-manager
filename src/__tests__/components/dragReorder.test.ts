import { describe, it, expect, vi, afterEach } from 'vitest';
import { setupDragReorder } from '../../components/CookieEditor/dragReorder';

function makeEntry(body: HTMLElement, label: string): HTMLElement {
    const entry = document.createElement('div');
    entry.classList.add('mw-ce__entry');
    entry.innerHTML = `<div class="mw-ce__drag-handle"></div><span>${label}</span>`;
    body.appendChild(entry);
    return entry;
}

function dragSequence(
    body: HTMLElement,
    dragged: HTMLElement,
    target: HTMLElement,
    clientY: number,
    targetTop = 100,
    targetHeight = 60,
) {
    const handle = dragged.querySelector<HTMLElement>('.mw-ce__drag-handle')!;
    const dt = new DataTransfer();

    handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    dragged.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));

    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
        top: targetTop, height: targetHeight, bottom: targetTop + targetHeight,
        left: 0, right: 200, width: 200, x: 0, y: targetTop, toJSON: () => ({}),
    } as DOMRect);

    target.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: new DataTransfer(), clientY }));
    body.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: new DataTransfer() }));
    dragged.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
}

describe('setupDragReorder', () => {
    afterEach(() => vi.restoreAllMocks());

    it('moves a dragged entry before another when dropped above midpoint', () => {
        const body = document.createElement('div');
        const entry1 = makeEntry(body, 'First');
        const entry2 = makeEntry(body, 'Second');
        setupDragReorder(body);

        // Drag entry2, drop above midpoint of entry1 (midpoint = 100 + 30 = 130, clientY = 110)
        dragSequence(body, entry2, entry1, 110);

        const entries = body.querySelectorAll('.mw-ce__entry');
        expect(entries[0]).toBe(entry2);
        expect(entries[1]).toBe(entry1);
    });

    it('moves a dragged entry after another when dropped below midpoint', () => {
        const body = document.createElement('div');
        const entry1 = makeEntry(body, 'First');
        const entry2 = makeEntry(body, 'Second');
        setupDragReorder(body);

        // Drag entry1, drop below midpoint of entry2 (midpoint = 130, clientY = 150)
        dragSequence(body, entry1, entry2, 150);

        const entries = body.querySelectorAll('.mw-ce__entry');
        expect(entries[0]).toBe(entry2);
        expect(entries[1]).toBe(entry1);
    });

    it('adds the dragging class during drag and removes it on dragend', () => {
        const body = document.createElement('div');
        const entry1 = makeEntry(body, 'First');
        const entry2 = makeEntry(body, 'Second');
        setupDragReorder(body);

        const handle = entry1.querySelector<HTMLElement>('.mw-ce__drag-handle')!;
        const dt = new DataTransfer();

        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        entry1.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
        expect(entry1.classList.contains('mw-ce__entry--dragging')).toBe(true);

        entry1.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
        expect(entry1.classList.contains('mw-ce__entry--dragging')).toBe(false);

        void entry2; // suppress unused warning
    });

    it('does not start a drag when mousedown is on the entry but not the handle', () => {
        const body = document.createElement('div');
        const entry1 = makeEntry(body, 'First');
        setupDragReorder(body);

        // Click directly on the entry span text, not the handle
        const span = entry1.querySelector('span')!;
        span.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(entry1.draggable).toBe(false);
    });

    it('sets draggable=true on the entry when mousedown hits the handle', () => {
        const body = document.createElement('div');
        const entry1 = makeEntry(body, 'First');
        setupDragReorder(body);

        const handle = entry1.querySelector<HTMLElement>('.mw-ce__drag-handle')!;
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(entry1.draggable).toBe(true);
    });

    it('resets draggable=false after dragend', () => {
        const body = document.createElement('div');
        const entry1 = makeEntry(body, 'First');
        const entry2 = makeEntry(body, 'Second');
        setupDragReorder(body);

        const dt = new DataTransfer();
        const handle = entry1.querySelector<HTMLElement>('.mw-ce__drag-handle')!;
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        entry1.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
        entry1.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));

        expect(entry1.draggable).toBe(false);

        void entry2;
    });

    it('adds and removes the drop indicator class on dragover / drop', () => {
        const body = document.createElement('div');
        const entry1 = makeEntry(body, 'First');
        const entry2 = makeEntry(body, 'Second');
        setupDragReorder(body);

        const handle = entry1.querySelector<HTMLElement>('.mw-ce__drag-handle')!;
        const dt = new DataTransfer();
        handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        entry1.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));

        vi.spyOn(entry2, 'getBoundingClientRect').mockReturnValue({
            top: 100, height: 60, bottom: 160, left: 0, right: 200, width: 200, x: 0, y: 100, toJSON: () => ({}),
        } as DOMRect);

        // dragover — indicator class should be added
        entry2.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: new DataTransfer(), clientY: 110 }));
        const hasIndicator =
            entry2.classList.contains('mw-ce__entry--drop-above') ||
            entry2.classList.contains('mw-ce__entry--drop-below');
        expect(hasIndicator).toBe(true);

        // drop — indicator class should be cleared
        body.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: new DataTransfer() }));
        expect(entry2.classList.contains('mw-ce__entry--drop-above')).toBe(false);
        expect(entry2.classList.contains('mw-ce__entry--drop-below')).toBe(false);

        entry1.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    });
});
