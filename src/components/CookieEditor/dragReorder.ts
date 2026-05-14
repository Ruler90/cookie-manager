export function setupDragReorder(body: HTMLElement): void {
    let dragged: HTMLElement | null = null;
    let indicator: HTMLElement | null = null;
    let dropAbove = true;
    let pendingDraggable: HTMLElement | null = null;

    body.addEventListener('mousedown', (e) => {
        const handle = (e.target as HTMLElement).closest<HTMLElement>('.mw-ce__drag-handle');
        if (!handle) return;
        const entry = handle.closest<HTMLElement>('.mw-ce__entry');
        if (entry) { entry.draggable = true; pendingDraggable = entry; }
    });

    body.addEventListener('mouseup', () => {
        if (pendingDraggable && !dragged) pendingDraggable.draggable = false;
        pendingDraggable = null;
    });

    body.addEventListener('dragstart', (e) => {
        const entry = (e.target as HTMLElement).closest<HTMLElement>('.mw-ce__entry');
        if (!entry?.draggable) { e.preventDefault(); return; }
        dragged = entry;
        entry.classList.add('mw-ce__entry--dragging');
        e.dataTransfer!.effectAllowed = 'move';
    });

    body.addEventListener('dragover', (e) => {
        e.preventDefault();
        const entry = (e.target as HTMLElement).closest<HTMLElement>('.mw-ce__entry');
        if (!entry || entry === dragged) return;
        clearIndicator();
        const rect = entry.getBoundingClientRect();
        dropAbove = e.clientY < rect.top + rect.height / 2;
        indicator = entry;
        entry.classList.add(dropAbove ? 'mw-ce__entry--drop-above' : 'mw-ce__entry--drop-below');
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
        if (dragged) { dragged.classList.remove('mw-ce__entry--dragging'); dragged.draggable = false; dragged = null; }
        pendingDraggable = null;
        clearIndicator();
    });

    function clearIndicator() {
        if (indicator) {
            indicator.classList.remove('mw-ce__entry--drop-above', 'mw-ce__entry--drop-below');
            indicator = null;
        }
    }
}
