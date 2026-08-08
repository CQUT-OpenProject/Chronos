<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { ListItem } from 'm3-svelte';
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
		onclick?: () => void;
		label?: boolean;
		icon?: Component<{ class?: string }>;
		iconTone?: MineIconTone;
		supporting?: string;
		trailing?: Snippet;
	} & HTMLAnchorAttributes &
		HTMLButtonAttributes = $props();

	const trailingContent = trailing;
</script>

<ListItem
	{href}
	label={label ? true : undefined}
	onclick={href || label ? undefined : onclick}
	headline={title}
	supporting={supporting || undefined}
	{...props}
>
	{#snippet leading()}
		{#if Icon}
			<span class="m3-leading-icon tone-{iconTone}">
				<Icon />
			</span>
		{/if}
	{/snippet}
	{#snippet trailing()}
		{#if trailingContent}
			{@render trailingContent()}
		{:else}
			<ChevronRight class="text-on-surface-variant" style="width:1.125rem;height:1.125rem" />
		{/if}
	{/snippet}
</ListItem>
