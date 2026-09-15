<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		variant = 'elevated',
		flush = false,
		children,
		class: className = '',
		...props
	}: {
		variant?: 'elevated' | 'outlined' | 'filled';
		flush?: boolean;
		children?: Snippet;
		class?: string;
	} & HTMLAttributes<HTMLDivElement> = $props();

	const variantClasses = {
		elevated: 'bg-surface text-on-surface shadow-raised',
		outlined: 'border border-border/60 bg-surface text-on-surface',
		filled: 'bg-surface-variant/50 text-on-surface'
	};
</script>

<div
	{...props}
	class={[
		'w-full rounded-3xl transition-shadow',
		!flush && 'p-4',
		variantClasses[variant],
		className
	]}
>
	{@render children?.()}
</div>
