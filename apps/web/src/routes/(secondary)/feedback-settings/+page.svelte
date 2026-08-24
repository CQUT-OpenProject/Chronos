<script lang="ts">
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import FeedbackSettingsScreen from '$lib/components/mine/FeedbackSettingsScreen.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const shell = getContext<AppShellController>('appShell');
	const controller = getAppController();
</script>

<SecondaryPageShell title={hostTextRead(controller, 'route.feedbackSettings')} backHref="/mine">
	<FeedbackSettingsScreen {shell} />
</SecondaryPageShell>
