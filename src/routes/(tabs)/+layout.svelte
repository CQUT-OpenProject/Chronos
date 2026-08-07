<script lang="ts">
	let { children } = $props();
</script>

<div class="pb-[calc(var(--spacing-tabbar)+var(--tabbar-safe))]">
	{@render children()}
</div>
