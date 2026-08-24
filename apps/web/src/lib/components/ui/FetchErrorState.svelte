<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { InfoFill, WifiOffFill } from '$lib/icons';
	import { offlineCopy } from '$lib/platform/offline-copy';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

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

	const controller = getAppController();
	const resolvedTitle = $derived(
		title ?? (offline ? offlineCopy.fetchTitle : hostTextRead(controller, 'ui.fetch.failed.title'))
	);
	const resolvedDescription = $derived(
		description ??
			(offline ? offlineCopy.fetchDescription : hostTextRead(controller, 'ui.fetch.failed.desc'))
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
		<Button variant="text" onclick={onRetry}>
			{hostTextRead(controller, 'ui.fetch.retry')}
		</Button>
	{/if}
</Card>
