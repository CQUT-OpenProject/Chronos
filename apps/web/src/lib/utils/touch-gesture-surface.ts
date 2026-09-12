import type { Attachment } from 'svelte/attachments';

/**
 * Suppress Chromium/Android system long-press (context menu + haptic) on surfaces
 * that implement custom pointer gestures. Pair with `touch-manipulation` so the
 * browser treats touches as potential pans instead of a long-press.
 */
export const touchGestureSurfaceAttach: Attachment<HTMLElement> = (node) => {
	const preventDefault = (event: Event) => event.preventDefault();
	node.addEventListener('contextmenu', preventDefault);
	node.addEventListener('selectstart', preventDefault);
	return () => {
		node.removeEventListener('contextmenu', preventDefault);
		node.removeEventListener('selectstart', preventDefault);
	};
};
