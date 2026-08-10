<script lang="ts">
	import { onMount } from 'svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	let loading = $state(true);
	let licenseText = $state('');

	onMount(async () => {
		const response = await fetch('/licenses/project_license.txt');
		licenseText = response.ok ? await response.text() : '无法加载许可证文本';
		loading = false;
	});
</script>

<SecondaryPageShell title="本项目许可证" backHref="/open-source-licenses">
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<LoadingIndicator />
		</div>
	{:else}
		<pre
			class="text-xs leading-relaxed whitespace-pre-wrap text-on-surface-variant">{licenseText}</pre>
	{/if}
</SecondaryPageShell>
