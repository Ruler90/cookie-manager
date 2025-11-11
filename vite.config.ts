import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/app.ts',
            formats: ['iife'],
            name: 'getProducts',
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
