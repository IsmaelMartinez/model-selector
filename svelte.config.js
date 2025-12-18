import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: null,
			precompress: false,
			strict: true
		}),
		paths: {
			// Base path for GitHub Pages deployment
			base: process.env.NODE_ENV === 'production' ? '/ai-model-advisor' : ''
		}
	}
};

export default config;