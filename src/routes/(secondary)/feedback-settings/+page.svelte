<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import FeedbackSettingsScreen from '$lib/components/mine/FeedbackSettingsScreen.svelte';

	const shell = getContext<AppShellController>('appShell');
</script>

<SecondaryPageShell title="反馈设置" backHref="/mine">
	<FeedbackSettingsScreen {shell} />
</SecondaryPageShell>
