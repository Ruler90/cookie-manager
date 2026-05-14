import { devCookie } from '../../types/types';

export function collectAndValidate(body: HTMLElement): devCookie[] | null {
    body.querySelectorAll('.mw-ce__error').forEach((e) => {
        e.textContent = '';
        e.classList.remove('mw-ce__error--visible');
    });
    body.querySelectorAll('.mw-ce__input--error').forEach((i) => i.classList.remove('mw-ce__input--error'));
    body.querySelectorAll('.mw-ce__pills--error').forEach((p) => p.classList.remove('mw-ce__pills--error'));

    const entries = Array.from(body.querySelectorAll<HTMLElement>('.mw-ce__entry'));
    let valid = true;
    const cookies: devCookie[] = [];

    entries.forEach((entry) => {
        const nameInput = entry.querySelector<HTMLInputElement>('.mw-ce__input--name');
        const descInput = entry.querySelector<HTMLInputElement>('.mw-ce__input--desc');
        const pillsContainer = entry.querySelector<HTMLElement>('.mw-ce__pills');
        const errorSpan = entry.querySelector<HTMLElement>('.mw-ce__error');
        if (!nameInput || !descInput || !pillsContainer || !errorSpan) return;

        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const values = Array.from(pillsContainer.querySelectorAll<HTMLElement>('.mw-ce__pill'))
            .map((p) => p.dataset.value ?? '')
            .filter((v) => v);

        function showError(msg: string, input?: HTMLInputElement, pills?: HTMLElement) {
            if (!errorSpan) return;
            errorSpan.textContent = msg;
            errorSpan.classList.add('mw-ce__error--visible');
            if (input) input.classList.add('mw-ce__input--error');
            if (pills) pills.classList.add('mw-ce__pills--error');
            valid = false;
        }

        if (!name) { showError('Name is required', nameInput); return; }
        if (/[;,\s=]/.test(name)) { showError('Name must not contain spaces, semicolons, commas, or =', nameInput); return; }
        if (values.length === 0) { showError('At least one value is required', undefined, pillsContainer); return; }

        cookies.push({ name, description, values });
    });

    if (!valid) return null;

    const nameCounts = new Map<string, number>();
    cookies.forEach((c) => nameCounts.set(c.name, (nameCounts.get(c.name) ?? 0) + 1));
    entries.forEach((entry, i) => {
        const name = cookies[i]?.name;
        if (!name) return;
        if ((nameCounts.get(name) ?? 0) > 1) {
            const nameInput = entry.querySelector<HTMLInputElement>('.mw-ce__input--name');
            const errorSpan = entry.querySelector<HTMLElement>('.mw-ce__error');
            if (!nameInput || !errorSpan) return;
            errorSpan.textContent = 'Duplicate cookie name';
            errorSpan.classList.add('mw-ce__error--visible');
            nameInput.classList.add('mw-ce__input--error');
            valid = false;
        }
    });

    return valid ? cookies : null;
}
