/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const isFirefox = process.argv.includes('firefox');
const filename = isFirefox ? 'bookmarklet-firefox.js' : 'bookmarklet.js';

const bookmarkletPath = join(root, 'dist', filename);
const defaultConfigPath = join(root, 'src', 'config', 'defaultCookies.json');

const raw = readFileSync(bookmarkletPath, 'utf-8').trim();
const defaultConfig = JSON.parse(readFileSync(defaultConfigPath, 'utf-8'));

// Vite + Terser produces: "javascript:\n!function(){...}();"
// Strip the "javascript:\n" preamble to get the inner code.
const PREAMBLE = 'javascript:\n';
if (!raw.startsWith(PREAMBLE)) {
    console.error('Unexpected bookmarklet format — preamble not found.');
    process.exit(1);
}
const innerCode = raw.slice(PREAMBLE.length);

const configJson = JSON.stringify(defaultConfig);

let wrapped;
if (isFirefox) {
    wrapped = `javascript:(()=>{window.__CM_CONFIG__=${configJson};${innerCode}})()`;
} else {
    const innerCodeStr = JSON.stringify(innerCode);
    wrapped =
        `javascript:(()=>{const _C=${configJson};const _S=${innerCodeStr};` +
        `window.__CM_CONFIG__=_C;window.__CM_BOOKMARKLET_TEMPLATE__=_S;${innerCode}})()`;
}

writeFileSync(bookmarkletPath, wrapped, 'utf-8');

const kb = (wrapped.length / 1024).toFixed(1);
console.log(`Bookmarklet wrapped successfully. Final size: ${kb} KB`);

if (!isFirefox) {
    // Write the inner code as a plain JS file so the dev server can serve it.
    // index.html loads this synchronously, enabling the real "Update your bookmark"
    // flow during local development.
    const innerCodeStr = JSON.stringify(innerCode);
    const templatePath = join(root, 'public', 'bookmarklet-template.js');
    writeFileSync(
        templatePath,
        'window.__CM_BOOKMARKLET_TEMPLATE__ = ' + innerCodeStr + ';',
        'utf-8',
    );
    console.log('Dev template written to public/bookmarklet-template.js');
}
