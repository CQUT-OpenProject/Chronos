<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';
	import ShellTabPanels from '$lib/components/shell/ShellTabPanels.svelte';
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';
	import { ensureEngineReady } from '$lib/services/app-engine';
	import { isShellRoute } from '$lib/navigation/routes';
	import { secondaryTransitionGate } from '$lib/navigation/secondary-transition-gate.svelte';

	const shellTab = getContext<ShellTabController>('shellTab');
	const gate = secondaryTransitionGate;

	let ready = $state(false);
	let markedVisible = false;

	onMount(async () => {
		await ensureEngineReady();
		ready = true;
	});

	$effect(() => {
		if (!ready) return;
		const pathname = page.url.pathname;
		if (isShellRoute(pathname)) {
			gate.syncRoute(pathname);
			shellTab.init();
			if (!markedVisible && typeof performance !== 'undefined') {
				markedVisible = true;
				performance.mark('chronos-timetable-visible');
			}
			return;
		}

		if (gate.shellHostEnabled) {
			if (!gate.transitioning) gate.syncRoute(pathname);
			return;
		}

		return scheduleIdle(() => {
			gate.enableShellHost();
			shellTab.init();
			if (!gate.transitioning) gate.syncRoute(pathname);
		});
	});

	function scheduleIdle(callback: () => void): () => void {
		if (typeof requestIdleCallback === 'function') {
			const id = requestIdleCallback(callback);
			return () => cancelIdleCallback(id);
		}
		const id = setTimeout(callback, 0);
		return () => clearTimeout(id);
	}

	// Drive snackbar clearance from the same gate that hides the tab bar.
	$effect(() => {
		if (!browser) return;
		const painted = gate.shellHostEnabled && !gate.skipPaint;
		document.documentElement.style.setProperty(
			'--snackbar-bottom-offset',
			painted ? 'var(--bottom-bar-height)' : 'var(--tabbar-safe)'
		);
	});
</script>

{#if browser && gate.shellHostEnabled}
	<div class="shell-page min-h-dvh bg-canvas text-ink">
		<div class="pb-[var(--bottom-bar-height)]">
			<ShellTabPanels {ready} frozen={gate.frozen} />
		</div>
		<div class="shell-tab-bar" class:hidden={gate.skipPaint} inert={gate.frozen}>
			<BottomTabBar />
		</div>
	</div>
{/if}
