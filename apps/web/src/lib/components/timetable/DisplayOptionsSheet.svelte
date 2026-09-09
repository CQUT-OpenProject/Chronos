<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import type { TimetableViewPrefs } from '@chronos/core';
	import { getAppController } from '$lib/services/app-engine';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import { createViewPrefsSaver } from '$lib/timetable/view-prefs-save';

	let {
		open = $bindable(false)
	}: {
		open?: boolean;
	} = $props();

	const shell = getContext<AppShellController>('appShell');
	const persistedPrefs = $derived(shell.controller.currentTimetable?.viewPrefs);
	let localPrefs = $state<TimetableViewPrefs | null>(null);
	const viewPrefs = $derived(localPrefs ?? persistedPrefs);

	const saver = createViewPrefsSaver(async (prefs) => {
		await getAppController().saveCurrentTimetableDetails({ viewPrefs: prefs });
	});

	function setPref<K extends keyof TimetableViewPrefs>(key: K, next: boolean) {
		const base = viewPrefs;
		if (!base) return;
		localPrefs = saver.apply(base, { [key]: next });
	}

	function handleOpenChangeComplete(isOpen: boolean) {
		if (!isOpen) localPrefs = null;
	}
</script>

<BottomSheet
	bind:open
	title={hostT('timetable.details.section.display')}
	onOpenChangeComplete={handleOpenChangeComplete}
>
	{#if viewPrefs}
		<div class="p-4">
			<div class="ui-section-surface">
				<MineRow label title={hostT('timetable.details.showSaturday')}>
					{#snippet trailing()}
						<Switch
							checked={viewPrefs.showSaturday}
							onCheckedChange={(checked) => setPref('showSaturday', checked)}
						/>
					{/snippet}
				</MineRow>
				<MineRow label title={hostT('timetable.details.showSunday')}>
					{#snippet trailing()}
						<Switch
							checked={viewPrefs.showSunday}
							onCheckedChange={(checked) => setPref('showSunday', checked)}
						/>
					{/snippet}
				</MineRow>
				<MineRow label title={hostT('timetable.details.showNonCurrentWeek')}>
					{#snippet trailing()}
						<Switch
							checked={viewPrefs.showNonCurrentWeekCourses}
							onCheckedChange={(checked) => setPref('showNonCurrentWeekCourses', checked)}
						/>
					{/snippet}
				</MineRow>
			</div>
		</div>
	{/if}
</BottomSheet>
