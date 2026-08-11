<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import MineScreen from '$lib/components/mine/MineScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<MineScreen {shell} />
