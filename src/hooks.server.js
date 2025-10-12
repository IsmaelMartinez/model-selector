/**
 * SvelteKit server hooks to enable WebGPU support
 * These headers are required for SharedArrayBuffer and WebGPU
 */

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const response = await resolve(event);

	// Add CORS headers required for WebGPU and SharedArrayBuffer
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

	return response;
}
