<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { InfoFill, WifiOffFill } from '$lib/icons';
	import { offlineCopy } from '$lib/platform/offline-copy';

	let {
		offline = false,
		title,
		description,
		onRetry
	}: {
		offline?: boolean;
		title?: string;
		description?: string;
		onRetry?: () => void;
	} = $props();

	const resolvedTitle = $derived(title ?? (offline ? offlineCopy.fetchTitle : '加载失败'));
	const resolvedDescription = $derived(
		description ?? (offline ? offlineCopy.fetchDescription : '加载失败，请稍后重试。')
	);
</script>

<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
	{#if offline}
		<WifiOffFill class="size-8 text-on-surface-variant" aria-hidden="true" />
	{:else}
		<InfoFill class="size-8 text-on-surface-variant" aria-hidden="true" />
	{/if}
	<div class="flex flex-col gap-1">
		<p class="m3-title-small font-semibold text-on-surface">{resolvedTitle}</p>
		<p class="m3-body-medium text-on-surface-variant">{resolvedDescription}</p>
	</div>
	{#if onRetry}
		<Button variant="text" onclick={onRetry}>重试</Button>
	{/if}
</Card>
