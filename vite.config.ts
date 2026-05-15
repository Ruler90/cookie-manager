import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
    },
    build: {
        lib: {
            entry: 'src/app.ts',
            formats: ['iife'],
            name: 'CookieManager',
            fileName: () => 'bookmarklet.js'
        },
        minify: 'terser',
        terserOptions: {
            format: {
                ascii_only: true,
                comments: false,
                preamble: 'javascript:'
            }
        },
        cssCodeSplit: false,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                assetFileNames: () => 'bookmarklet.css'
            }
        }
    }
});
