<script lang="ts">
	let { children } = $props();
</script>

<div class="pb-[var(--bottom-bar-height)]">
	{@render children()}
</div>
