<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getContext } from 'svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';
	import ShellTabPanels from '$lib/components/shell/ShellTabPanels.svelte';
	import { ensureEngineReady } from '$lib/services/app-engine';

	const screen = getContext<TimetableScreenController>('timetableScreen');
	const shellTab = getContext<ShellTabController>('shellTab');

	let ready = $state(false);

	onMount(async () => {
		await ensureEngineReady();
		shellTab.init();
		ready = true;
		if (typeof performance !== 'undefined') {
			performance.mark('chronos-timetable-visible');
		}
		screen.refresh();
	});
</script>

{#if browser}
	<ShellTabPanels {ready} />
{/if}
