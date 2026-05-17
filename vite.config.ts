import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
    const isFirefox = mode === 'firefox';
    const outFile = isFirefox ? 'bookmarklet-firefox.js' : 'bookmarklet.js';
    return {
        test: {
            environment: 'jsdom',
            setupFiles: ['./src/__tests__/setup.ts'],
        },
        define: {
            __FIREFOX__: isFirefox,
        },
        build: {
            lib: {
                entry: 'src/app.ts',
                formats: ['iife'],
                name: 'CookieManager',
                fileName: () => outFile,
            },
            emptyOutDir: false,
            minify: 'terser',
            terserOptions: {
                format: {
                    ascii_only: true,
                    comments: false,
                    preamble: 'javascript:',
                }
            },
            cssCodeSplit: false,
            rollupOptions: {
                treeshake: { moduleSideEffects: false },
                output: {
                    inlineDynamicImports: true,
                    assetFileNames: () => outFile.replace('.js', '.css'),
                }
            }
        }
    };
});
