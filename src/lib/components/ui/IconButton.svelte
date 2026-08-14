<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	let {
		variant = 'standard',
		size = 'md',
		href,
		ariaLabel,
		disabled = false,
		onclick,
		children,
		class: className = '',
		...props
	}: {
		variant?: 'standard' | 'tonal' | 'danger';
		size?: 'md' | 'sm';
		href?: string;
		ariaLabel: string;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		class?: string;
	} & HTMLButtonAttributes &
		HTMLAnchorAttributes = $props();

	const variantClasses = {
		standard: 'text-on-surface hover:bg-surface-variant/50 active:bg-surface-variant/80',
		tonal: 'text-on-surface-variant hover:bg-surface-variant',
		danger: 'text-error hover:bg-error/10 active:bg-error/20'
	};

	const sizeClasses = {
		md: 'size-10',
		sm: 'p-1.5'
	};

	const focusRingClass = $derived(
		variant === 'danger' ? 'focus-visible:ring-error' : 'focus-visible:ring-brand'
	);

	const baseClass = $derived(
		`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 ${focusRingClass}`
	);
</script>

{#if href}
	<a
		{href}
		{onclick}
		aria-label={ariaLabel}
		{...props}
		class="{baseClass} {variantClasses[variant]} {sizeClasses[size]} {disabled
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
		aria-label={ariaLabel}
		{...props}
		class="{baseClass} {variantClasses[variant]} {sizeClasses[
			size
		]} disabled:pointer-events-none disabled:opacity-40 {className}"
	>
		{@render children?.()}
	</button>
{/if}
