<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes, HTMLAttributes } from 'svelte/elements';
	import { ChevronRight } from '$lib/icons';

	export type MineIconTone = 'primary' | 'secondary' | 'tertiary' | 'neutral';

	let {
		title,
		href,
		onclick,
		label,
		icon: Icon,
		iconTone = 'neutral',
		supporting = '',
		trailing,
		...props
	}: {
		title: string;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		label?: boolean;
		icon?: Component<{ class?: string }>;
		iconTone?: MineIconTone;
		supporting?: string;
		trailing?: Snippet;
	} & HTMLAnchorAttributes &
		HTMLButtonAttributes &
		HTMLAttributes<HTMLLabelElement> = $props();
</script>

{#snippet rowContent()}
	{#if Icon}
		<span class="ui-leading-icon tone-{iconTone}" aria-hidden="true">
			<Icon />
		</span>
	{/if}
	<div class="flex min-w-0 flex-1 flex-col justify-center text-left">
		<span class="text-body-large line-clamp-1 font-normal text-on-surface">{title}</span>
		{#if supporting}
			<span class="text-body-small line-clamp-1 text-on-surface-variant">{supporting}</span>
		{/if}
	</div>
	{#if trailing}
		{@render trailing()}
	{:else}
		<ChevronRight aria-hidden="true" class="size-4.5 shrink-0 text-on-surface-variant" />
	{/if}
{/snippet}

{#if href}
	<a
		{href}
		{onclick}
		{...props}
		class="relative flex h-16 w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-surface-variant/40 active:bg-surface-variant/60"
	>
		{@render rowContent()}
	</a>
{:else if label}
	<label
		{onclick}
		{...props}
		class="relative flex h-16 w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-surface-variant/40 active:bg-surface-variant/60"
	>
		{@render rowContent()}
	</label>
{:else}
	<button
		type="button"
		{onclick}
		{...props}
		class="relative flex h-16 w-full cursor-pointer items-center gap-4 rounded-2xl border-none bg-transparent px-4 py-3 text-left transition-colors hover:bg-surface-variant/40 active:bg-surface-variant/60"
	>
		{@render rowContent()}
	</button>
{/if}
