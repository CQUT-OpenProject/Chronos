/** Type-check shim: Svelte components are compiled by Vite; tsgo only needs the module shape. */
declare module '*.svelte' {
	import type { Component } from 'svelte';
	const component: Component<Record<string, unknown>>;
	export default component;
}
