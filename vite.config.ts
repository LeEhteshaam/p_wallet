import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
	plugins: [
		sveltekit(),
		nodePolyfills({ 
			include: ['buffer', 'process', 'util', 'stream'],
			globals: {
				Buffer: true,
				global: true,
				process: true,
			}
		})
	]
});
