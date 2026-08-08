<script lang="ts">
	import BottomTabBar from '$lib/components/BottomTabBar.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-dvh flex-col">
	<div class="flex-1 pb-[calc(var(--spacing-tabbar)+var(--tabbar-safe))]">
		{@render children()}
	</div>
	<div class="tab-bar-wrapper">
		<BottomTabBar />
	</div>
</div>
