<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'filled',
		tone = 'default',
		disabled = false,
		href,
		onclick,
		children,
		class: className = '',
		...props
	}: {
		variant?: 'filled' | 'outlined' | 'text' | 'danger';
		tone?: 'default' | 'inverse';
		disabled?: boolean;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		class?: string;
	} & HTMLButtonAttributes &
		HTMLAnchorAttributes = $props();

	const variantClasses = $derived({
		filled: 'ui-btn-filled',
		outlined: 'ui-btn-outlined',
		text:
			tone === 'inverse'
				? 'text-inverse-primary hover:underline focus-visible:ring-inverse-primary'
				: 'ui-btn-text',
		danger: 'ui-btn-danger'
	});
</script>

{#if href}
	<a
		{href}
		{onclick}
		{...props}
		class="ui-btn {variantClasses[variant]} {disabled
			? 'pointer-events-none opacity-40'
			: ''} {className}"
	>
		{@render children?.()}
	</a>
{:else}
	<button
		type="button"
		{disabled}
		{onclick}
		{...props}
		class="ui-btn {variantClasses[variant]} {className}"
	>
		{@render children?.()}
	</button>
{/if}
