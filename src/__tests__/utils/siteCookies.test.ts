import { describe, it, expect, beforeEach } from 'vitest';
import { getSiteCookies } from '../../utils/siteCookies';

function clearAllCookies() {
    document.cookie.split(';').forEach((c) => {
        const name = c.split('=')[0]?.trim();
        if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
}

describe('getSiteCookies', () => {
    beforeEach(clearAllCookies);

    it('returns an empty array when no cookies are set', () => {
        expect(getSiteCookies()).toEqual([]);
    });

    it('does not produce a phantom empty-name entry from an empty cookie string', () => {
        const result = getSiteCookies();
        expect(result.every((c) => c.name !== '')).toBe(true);
    });

    it('parses a single cookie', () => {
        document.cookie = 'mycookie=hello';
        expect(getSiteCookies()).toContainEqual({ name: 'mycookie', value: 'hello' });
    });

    it('parses multiple cookies', () => {
        document.cookie = 'a=1';
        document.cookie = 'b=2';
        const result = getSiteCookies();
        expect(result).toContainEqual({ name: 'a', value: '1' });
        expect(result).toContainEqual({ name: 'b', value: '2' });
    });

    it('preserves = signs within cookie values (e.g. base64)', () => {
        document.cookie = 'token=abc=def==';
        expect(getSiteCookies()).toContainEqual({ name: 'token', value: 'abc=def==' });
    });

    it('handles a cookie with an empty value', () => {
        document.cookie = 'flag=';
        expect(getSiteCookies()).toContainEqual({ name: 'flag', value: '' });
    });
});
