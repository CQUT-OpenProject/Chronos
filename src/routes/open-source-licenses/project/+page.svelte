<script lang="ts">
	import { onMount } from 'svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';

	let licenseText = $state('加载中…');

	onMount(async () => {
		const response = await fetch('/licenses/project_license.txt');
		licenseText = response.ok ? await response.text() : '无法加载许可证文本';
	});
</script>

<SecondaryPageShell title="本项目许可证" backHref="/open-source-licenses">
	<pre
		class="text-xs leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{licenseText}</pre>
</SecondaryPageShell>
