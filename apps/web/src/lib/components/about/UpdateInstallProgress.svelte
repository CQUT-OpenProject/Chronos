<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { InstallPhase } from '$lib/content/releases/update-state.svelte';

	let {
		phase,
		percent
	}: {
		phase: InstallPhase;
		percent: number;
	} = $props();

	const clampedPercent = $derived(Math.max(0, Math.min(100, percent)));

	const phaseLabel = $derived.by(() => {
		switch (phase) {
			case 'downloading':
				return hostT('about.update.phase.downloading');
			case 'installing':
				return hostT('about.update.phase.installing');
			case 'restarting':
				return hostT('about.update.phase.restarting');
			default:
				return hostT('about.update.installing');
		}
	});
</script>

<div class="flex flex-col gap-3 rounded-2xl bg-surface-container px-4 py-5">
	<div class="flex items-center justify-between gap-3">
		<p class="text-body-medium text-on-surface">{phaseLabel}</p>
		<span class="text-caption font-mono text-primary">{clampedPercent}%</span>
	</div>
	<div
		class="h-1.5 overflow-hidden rounded-full bg-surface-variant/80"
		role="progressbar"
		aria-valuenow={clampedPercent}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label={phaseLabel}
	>
		<div
			class="h-full rounded-full bg-primary transition-[width] duration-200"
			style:width="{clampedPercent}%"
		></div>
	</div>
</div>
