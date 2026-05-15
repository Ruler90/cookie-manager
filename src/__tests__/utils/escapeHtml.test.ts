import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../../utils/escapeHtml';

describe('escapeHtml', () => {
    it('escapes &', () => expect(escapeHtml('a & b')).toBe('a &amp; b'));
    it('escapes <', () => expect(escapeHtml('<div>')).toBe('&lt;div&gt;'));
    it('escapes >', () => expect(escapeHtml('a > b')).toBe('a &gt; b'));
    it('escapes "', () => expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;'));
    it('escapes \'', () => expect(escapeHtml('it\'s')).toBe('it&#39;s'));
    it('escapes all special chars in one string', () => {
        expect(escapeHtml('<script>alert("hello & \'world\'");</script>')).toBe(
            '&lt;script&gt;alert(&quot;hello &amp; &#39;world&#39;&quot;);&lt;/script&gt;'
        );
    });
    it('leaves strings without special chars unchanged', () => {
        expect(escapeHtml('hello world 123')).toBe('hello world 123');
    });
    it('handles empty string', () => expect(escapeHtml('')).toBe(''));
});
