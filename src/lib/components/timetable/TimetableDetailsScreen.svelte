<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { TimetableSettingsDraft } from '$lib/models/drafts';
	import TimetableDetailsEditor from '$lib/components/timetable/TimetableDetailsEditor.svelte';
	import { toSettingsDraft } from '$lib/timetable/timetable-mappers';

	let {
		shell,
		onDone
	}: {
		shell: AppShellController;
		onDone: () => void;
	} = $props();

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
		onDone();
	}
</script>

{#if draft}
	<TimetableDetailsEditor bind:draft onSave={save} />
{:else}
	<p class="text-sm text-zinc-500">未找到当前课表</p>
{/if}
