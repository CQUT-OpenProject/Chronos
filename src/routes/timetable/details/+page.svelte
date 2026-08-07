<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { TimetableSettingsDraft } from '$lib/models/drafts';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import TimetableDetailsEditor from '$lib/components/timetable/TimetableDetailsEditor.svelte';
	import { toSettingsDraft } from '$lib/timetable/timetable-mappers';

	const shell = getContext<AppShellController>('appShell');
	const timetable = $derived(shell.state.appState.currentTimetable);

	let draft = $state<TimetableSettingsDraft | null>(null);

	$effect(() => {
		if (timetable) {
			draft = toSettingsDraft(timetable);
		}
	});

	async function save() {
		if (!timetable || !draft) return;
		await shell.services.saveTimetableDetails.invoke(timetable.id, draft);
		goto(resolve('/'));
	}
</script>

<SecondaryPageShell title="编辑课表" backHref="/">
	{#if draft}
		<TimetableDetailsEditor bind:draft onSave={save} />
	{:else}
		<p class="text-sm text-zinc-500">未找到当前课表</p>
	{/if}
</SecondaryPageShell>
