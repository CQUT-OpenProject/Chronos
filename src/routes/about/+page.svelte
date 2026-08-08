<script lang="ts">
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import AboutScreen from '$lib/components/about/AboutScreen.svelte';
</script>

<SecondaryPageShell title="关于" backHref="/mine">
	<AboutScreen />
</SecondaryPageShell>
