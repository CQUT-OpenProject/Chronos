<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import { ChevronRight } from '$lib/icons';

	export type MineIconTone = 'primary' | 'secondary' | 'tertiary' | 'neutral';

	let {
		title,
		href,
		onclick,
		icon: Icon,
		iconTone = 'neutral',
		supporting = '',
		trailing
	}: {
		title: string;
		href?: string;
		onclick?: () => void;
		icon?: Component<{ class?: string }>;
		iconTone?: MineIconTone;
		supporting?: string;
		trailing?: Snippet;
	} = $props();
</script>

{#if href}
	<a {href} class="m3-mine-row" {onclick}>
		{#if Icon}
			<span class="m3-leading-icon tone-{iconTone}">
				<Icon />
			</span>
		{/if}
		<div class="m3-mine-row-content">
			<span class="m3-body-large m3-mine-row-title">{title}</span>
			{#if supporting}
				<span class="m3-body-small m3-mine-row-supporting">{supporting}</span>
			{/if}
		</div>
		{#if trailing}
			{@render trailing()}
		{:else}
			<ChevronRight class="m3-mine-row-arrow" />
		{/if}
	</a>
{:else}
	<button type="button" class="m3-mine-row" {onclick}>
		{#if Icon}
			<span class="m3-leading-icon tone-{iconTone}">
				<Icon />
			</span>
		{/if}
		<div class="m3-mine-row-content">
			<span class="m3-body-large m3-mine-row-title">{title}</span>
			{#if supporting}
				<span class="m3-body-small m3-mine-row-supporting">{supporting}</span>
			{/if}
		</div>
		{#if trailing}
			{@render trailing()}
		{:else if onclick}
			<ChevronRight class="m3-mine-row-arrow" />
		{/if}
	</button>
{/if}
