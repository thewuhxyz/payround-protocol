import { sveltekit } from '@sveltejs/kit/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),
		nodePolyfills({
			// Whether to polyfill `node:` protocol imports.
			protocolImports: true
		})
	]
};

export default config;
