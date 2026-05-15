import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadCookies, updateCookies, generateBookmarkletUrl } from '../../utils/cookieStorage';
import type { devCookie } from '../../types/types';

const sample: devCookie[] = [
    { name: 'feature', values: ['on', 'off'], description: 'Feature flag' },
];

describe('updateCookies / loadCookies', () => {
    it('loadCookies reflects the array passed to updateCookies', () => {
        updateCookies(sample);
        expect(loadCookies()).toEqual(sample);
    });

    it('loadCookies returns the exact same reference set by updateCookies', () => {
        const arr: devCookie[] = [{ name: 'x', values: ['1'], description: '' }];
        updateCookies(arr);
        expect(loadCookies()).toBe(arr);
    });

    it('subsequent calls to updateCookies replace the previous config', () => {
        updateCookies([{ name: 'old', values: ['v'], description: '' }]);
        updateCookies(sample);
        expect(loadCookies()).toEqual(sample);
    });
});

describe('generateBookmarkletUrl', () => {
    const TEMPLATE = 'console.log("app")';

    beforeEach(() => {
        window.__CM_BOOKMARKLET_TEMPLATE__ = TEMPLATE;
    });

    afterEach(() => {
        delete window.__CM_BOOKMARKLET_TEMPLATE__;
    });

    it('returns null when the template is not set', () => {
        delete window.__CM_BOOKMARKLET_TEMPLATE__;
        expect(generateBookmarkletUrl(sample)).toBeNull();
    });

    it('returns a string starting with javascript:', () => {
        expect(generateBookmarkletUrl(sample)).toMatch(/^javascript:/);
    });

    it('embeds the config as JSON in _C', () => {
        const url = generateBookmarkletUrl(sample)!;
        expect(url).toContain(`_C=${JSON.stringify(sample)}`);
    });

    it('embeds the template source as a JSON string in _S', () => {
        const url = generateBookmarkletUrl(sample)!;
        expect(url).toContain(`_S=${JSON.stringify(TEMPLATE)}`);
    });

    it('includes the raw template code as executable JS at the end', () => {
        const url = generateBookmarkletUrl(sample)!;
        expect(url).toContain(TEMPLATE);
    });

    it('handles cookies with characters that need JSON escaping', () => {
        const tricky: devCookie[] = [
            { name: 'test', values: ['"quoted"', 'it\'s'], description: '<b>x</b>' },
        ];
        const url = generateBookmarkletUrl(tricky);
        expect(url).not.toBeNull();
        expect(url).toMatch(/^javascript:/);
    });
});
