<script lang="ts">
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';

	let { children } = $props();
</script>

<div class="shell-page min-h-dvh bg-canvas text-ink">
	<div class="pb-[var(--bottom-bar-height)]">
		{@render children()}
	</div>
	<div class="shell-tab-bar">
		<BottomTabBar />
	</div>
</div>
