import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        sveltekit(),
        nodePolyfills({
            include: ['buffer', 'process', 'util', 'stream', 'events'],
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
    ]
});
