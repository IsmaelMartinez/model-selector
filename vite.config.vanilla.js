import { defineConfig } from 'vite';

export default defineConfig({
	root: './',
	publicDir: 'public',
	optimizeDeps: {
		exclude: ['@huggingface/transformers']
	},
	server: {
		port: 5174,
		fs: {
			// Allow serving files from the transformers.js package
			allow: ['..']
		},
		headers: {
			// Required for WebGPU and SharedArrayBuffer
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin'
		}
	},
	build: {
		outDir: 'dist-vanilla',
		rollupOptions: {
			input: {
				main: './test-local-model.html',
				multiple: './test-multiple-slms.html'
			}
		}
	}
});
