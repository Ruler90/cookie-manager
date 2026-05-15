import { describe, it, expect } from 'vitest';
import { findCookieValue } from '../../utils/cookieUtils';
import type { siteCookie } from '../../types/types';

const cookies: siteCookie[] = [
    { name: 'foo', value: 'bar' },
    { name: 'token', value: 'abc=def==' },
    { name: 'empty', value: '' },
];

describe('findCookieValue', () => {
    it('returns value for an existing cookie', () => {
        expect(findCookieValue('foo', cookies)).toBe('bar');
    });

    it('returns null for a non-existent cookie', () => {
        expect(findCookieValue('missing', cookies)).toBeNull();
    });

    it('returns null for an empty cookie array', () => {
        expect(findCookieValue('foo', [])).toBeNull();
    });

    it('returns the full value when it contains =', () => {
        expect(findCookieValue('token', cookies)).toBe('abc=def==');
    });

    it('returns empty string for a cookie with an empty value', () => {
        expect(findCookieValue('empty', cookies)).toBe('');
    });

    it('does not match on partial name prefix', () => {
        expect(findCookieValue('fo', cookies)).toBeNull();
    });

    it('does not match on partial name suffix', () => {
        expect(findCookieValue('foobar', cookies)).toBeNull();
    });

    it('returns the first match when names are unique', () => {
        const list: siteCookie[] = [
            { name: 'a', value: '1' },
            { name: 'b', value: '2' },
            { name: 'a', value: '3' },
        ];
        expect(findCookieValue('a', list)).toBe('1');
    });
});
