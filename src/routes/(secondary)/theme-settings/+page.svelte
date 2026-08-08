<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import ThemeSettingsScreen from '$lib/components/mine/ThemeSettingsScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<SecondaryPageShell title="主题设置" backHref="/mine">
	<ThemeSettingsScreen {shell} />
</SecondaryPageShell>
