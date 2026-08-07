<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import WallpaperScreen from '$lib/components/mine/WallpaperScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<SecondaryPageShell title="课表壁纸" backHref="/mine">
	<WallpaperScreen {shell} onBack={() => goto(resolve('/mine'))} />
</SecondaryPageShell>
