<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		variant = 'elevated',
		children,
		class: className = '',
		...props
	}: {
		variant?: 'elevated' | 'outlined' | 'filled';
		children?: Snippet;
		class?: string;
	} & HTMLAttributes<HTMLDivElement> = $props();

	const variantClasses = {
		elevated: 'bg-surface text-on-surface shadow-xs border border-border/60',
		outlined: 'border border-border/60 bg-surface text-on-surface',
		filled: 'bg-surface-variant/50 text-on-surface'
	};
</script>

<div
	{...props}
	class="w-full rounded-[24px] p-4 transition-shadow {variantClasses[variant]} {className}"
>
	{@render children?.()}
</div>
