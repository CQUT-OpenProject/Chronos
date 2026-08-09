<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'filled',
		disabled = false,
		href,
		onclick,
		children,
		class: className = '',
		...props
	}: {
		variant?: 'filled' | 'outlined' | 'text' | 'tonal' | 'danger';
		disabled?: boolean;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		class?: string;
	} & HTMLButtonAttributes &
		HTMLAnchorAttributes = $props();

	const variantClasses = {
		filled: 'bg-brand text-white hover:shadow-xs active:opacity-90',
		outlined: 'border border-outline text-brand hover:bg-brand/10 active:bg-brand/20',
		text: 'text-brand hover:bg-brand/10 active:bg-brand/20',
		tonal:
			'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 active:opacity-90',
		danger:
			'bg-error-container text-on-error-container hover:opacity-90 active:opacity-90 focus-visible:ring-error'
	};
</script>

{#if href}
	<a
		{href}
		{onclick}
		{...props}
		class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand {disabled
			? 'pointer-events-none opacity-40'
			: ''} {variantClasses[variant]} {className}"
	>
		{@render children?.()}
	</a>
{:else}
	<button
		type="button"
		{disabled}
		{onclick}
		{...props}
		class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-40 {variantClasses[
			variant
		]} {className}"
	>
		{@render children?.()}
	</button>
{/if}
