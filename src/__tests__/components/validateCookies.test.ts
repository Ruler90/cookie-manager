import { describe, it, expect } from 'vitest';
import { collectAndValidate } from '../../components/CookieEditor/validateCookies';

function makeEntry(name: string, description: string, values: string[]): HTMLElement {
    const entry = document.createElement('div');
    entry.classList.add('mw-ce__entry');
    entry.innerHTML = `
        <input class="mw-ce__input mw-ce__input--name" value="${name}" />
        <input class="mw-ce__input mw-ce__input--desc" value="${description}" />
        <div class="mw-ce__pills">
            ${values.map((v) => `<div class="mw-ce__pill" data-value="${v}"></div>`).join('')}
        </div>
        <span class="mw-ce__error"></span>
    `;
    return entry;
}

function makeBody(...entries: HTMLElement[]): HTMLElement {
    const body = document.createElement('div');
    entries.forEach((e) => body.appendChild(e));
    return body;
}

describe('collectAndValidate', () => {
    describe('valid inputs', () => {
        it('returns an array for a single valid cookie', () => {
            const result = collectAndValidate(makeBody(makeEntry('my_cookie', 'Desc', ['on', 'off'])));
            expect(result).toEqual([{ name: 'my_cookie', description: 'Desc', values: ['on', 'off'] }]);
        });

        it('returns cookies in DOM order', () => {
            const body = makeBody(
                makeEntry('first', '', ['1']),
                makeEntry('second', '', ['2']),
                makeEntry('third', '', ['3']),
            );
            expect(collectAndValidate(body)?.map((c) => c.name)).toEqual(['first', 'second', 'third']);
        });

        it('trims whitespace from the name', () => {
            const entry = makeEntry('  trimmed  ', '', ['v']);
            (entry.querySelector('.mw-ce__input--name') as HTMLInputElement).value = '  trimmed  ';
            const result = collectAndValidate(makeBody(entry));
            expect(result?.[0]?.name).toBe('trimmed');
        });

        it('accepts an empty description (it is optional)', () => {
            const result = collectAndValidate(makeBody(makeEntry('cookie', '', ['val'])));
            expect(result).not.toBeNull();
            expect(result?.[0]?.description).toBe('');
        });

        it('returns an empty array when the body has no entries', () => {
            expect(collectAndValidate(document.createElement('div'))).toEqual([]);
        });
    });

    describe('invalid name', () => {
        it('returns null for an empty name', () => {
            expect(collectAndValidate(makeBody(makeEntry('', '', ['val'])))).toBeNull();
        });

        it('shows a visible error for an empty name', () => {
            const entry = makeEntry('', '', ['val']);
            collectAndValidate(makeBody(entry));
            const error = entry.querySelector('.mw-ce__error');
            expect(error?.classList.contains('mw-ce__error--visible')).toBe(true);
            expect(error?.textContent).toBe('Name is required');
        });

        it('adds the error class to the name input for an empty name', () => {
            const entry = makeEntry('', '', ['val']);
            collectAndValidate(makeBody(entry));
            expect(entry.querySelector('.mw-ce__input--name')?.classList.contains('mw-ce__input--error')).toBe(true);
        });

        it('returns null for a name with a space', () => {
            expect(collectAndValidate(makeBody(makeEntry('bad name', '', ['v'])))).toBeNull();
        });

        it('returns null for a name with a semicolon', () => {
            expect(collectAndValidate(makeBody(makeEntry('bad;name', '', ['v'])))).toBeNull();
        });

        it('returns null for a name with a comma', () => {
            expect(collectAndValidate(makeBody(makeEntry('bad,name', '', ['v'])))).toBeNull();
        });

        it('returns null for a name containing =', () => {
            expect(collectAndValidate(makeBody(makeEntry('bad=name', '', ['v'])))).toBeNull();
        });
    });

    describe('invalid values', () => {
        it('returns null when the cookie has no values', () => {
            expect(collectAndValidate(makeBody(makeEntry('name', '', [])))).toBeNull();
        });

        it('adds the error class to the pills container when no values', () => {
            const entry = makeEntry('valid', '', []);
            collectAndValidate(makeBody(entry));
            expect(entry.querySelector('.mw-ce__pills')?.classList.contains('mw-ce__pills--error')).toBe(true);
        });
    });

    describe('duplicate names', () => {
        it('returns null when two cookies share the same name', () => {
            const body = makeBody(makeEntry('dup', '', ['1']), makeEntry('dup', '', ['2']));
            expect(collectAndValidate(body)).toBeNull();
        });

        it('marks ALL entries with a duplicate name — not just the second', () => {
            const e1 = makeEntry('dup', '', ['1']);
            const e2 = makeEntry('dup', '', ['2']);
            const e3 = makeEntry('dup', '', ['3']);
            collectAndValidate(makeBody(e1, e2, e3));
            [e1, e2, e3].forEach((e) => {
                expect(e.querySelector('.mw-ce__error')?.classList.contains('mw-ce__error--visible')).toBe(true);
                expect(e.querySelector('.mw-ce__error')?.textContent).toBe('Duplicate cookie name');
            });
        });

        it('does not mark unique names when other entries are duplicates', () => {
            const unique = makeEntry('unique', '', ['u']);
            const dup1 = makeEntry('dup', '', ['1']);
            const dup2 = makeEntry('dup', '', ['2']);
            collectAndValidate(makeBody(unique, dup1, dup2));
            expect(unique.querySelector('.mw-ce__error')?.classList.contains('mw-ce__error--visible')).toBe(false);
        });
    });

    describe('error cleanup between validations', () => {
        it('clears error classes from a previous failed validation', () => {
            const entry = makeEntry('', '', ['val']);
            const body = makeBody(entry);
            collectAndValidate(body);
            const nameInput = entry.querySelector<HTMLInputElement>('.mw-ce__input--name')!;
            expect(nameInput.classList.contains('mw-ce__input--error')).toBe(true);

            nameInput.value = 'fixed';
            collectAndValidate(body);

            expect(nameInput.classList.contains('mw-ce__input--error')).toBe(false);
            expect(entry.querySelector('.mw-ce__error')?.classList.contains('mw-ce__error--visible')).toBe(false);
        });
    });
});
