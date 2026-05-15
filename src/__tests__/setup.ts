import { afterEach } from 'vitest';

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = () => {};

// jsdom does not implement DataTransfer / DragEvent — provide minimal stubs
class DataTransferStub {
    effectAllowed = '';
    dropEffect = '';
}

class DragEventStub extends MouseEvent {
    dataTransfer: DataTransferStub | null;
    constructor(type: string, init: MouseEventInit & { dataTransfer?: DataTransferStub; clientY?: number } = {}) {
        super(type, { ...init, clientY: init.clientY });
        this.dataTransfer = init.dataTransfer ?? null;
    }
}

(globalThis as Record<string, unknown>).DataTransfer = DataTransferStub;
(globalThis as Record<string, unknown>).DragEvent = DragEventStub;

afterEach(() => {
    document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0]?.trim();
        if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    document.body.innerHTML = '';
});
