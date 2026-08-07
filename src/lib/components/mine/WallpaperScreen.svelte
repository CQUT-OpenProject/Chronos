<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import TimetableGrid from '$lib/components/timetable/TimetableGrid.svelte';
	import { BuildVisibleTimetableGridUseCase } from '$lib/domain/usecases/build-visible-timetable-grid';
	import { BuildTimetableCourseDisplayModelsUseCase } from '$lib/domain/usecases/build-timetable-course-display-models';
	import { CalculateAcademicWeekUseCase } from '$lib/domain/usecases/calculate-academic-week';
	import { SystemTimeProvider } from '$lib/domain/services/time-provider';
	import { Button } from 'm3-svelte';
	import { LayersClearFill, PhotoLibraryFill } from '$lib/icons';

	let {
		shell
	}: {
		shell: AppShellController;
	} = $props();

	const buildVisibleTimetableGrid = new BuildVisibleTimetableGridUseCase();
	const buildTimetableCourseDisplayModels = new BuildTimetableCourseDisplayModelsUseCase();
	const calculateAcademicWeek = new CalculateAcademicWeekUseCase();
	const timeProvider = new SystemTimeProvider();

	const appState = $derived(shell.state.appState);
	const timetable = $derived(appState.currentTimetable);
	const today = $derived(timeProvider.today());
	const academicWeek = $derived(calculateAcademicWeek.invoke(today, timetable?.academicConfig));
	const gridModel = $derived(
		timetable ? buildVisibleTimetableGrid.invoke(today, academicWeek, timetable) : null
	);
	const courseDisplayModels = $derived(
		timetable && gridModel
			? buildTimetableCourseDisplayModels.invoke(
					timetable,
					new Set(gridModel.visibleDays.map((day) => day.dayOfWeek)),
					academicWeek,
					today
				)
			: []
	);

	let fileInput: HTMLInputElement | undefined = $state();

	async function onPickWallpaper() {
		fileInput?.click();
	}

	async function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const uri = await readFileAsDataUrl(file);
		await shell.setWallpaper(uri);
		input.value = '';
	}

	async function clearWallpaper() {
		await shell.setWallpaper(null);
	}

	function readFileAsDataUrl(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(file);
		});
	}
</script>

<div class="m3-stack">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={onFileChange}
	/>

	{#if shell.state.hasWallpaper && timetable && gridModel}
		<div
			class="relative min-h-[420px] overflow-hidden rounded-xl border border-outline dark:border-outline-variant"
			style:background-image={appState.wallpaperUri ? `url('${appState.wallpaperUri}')` : undefined}
			style:background-size="cover"
			style:background-position="center"
		>
			<div class="absolute inset-0">
				<TimetableGrid
					displayedWeek={academicWeek}
					isCurrentWeek={true}
					{gridModel}
					{courseDisplayModels}
					hasWallpaper={true}
					isDark={shell.state.isDark}
					bottomContentPadding="0px"
				/>
			</div>
		</div>
	{:else}
		<p class="m3-body-medium text-on-surface-variant">选择壁纸后，可在此预览课表叠加效果。</p>
	{/if}

	<div class="m3-actions">
		{#if shell.state.hasWallpaper}
			<Button variant="outlined" iconType="left" onclick={clearWallpaper}>
				<LayersClearFill />
				清除壁纸
			</Button>
		{/if}
		<Button variant="outlined" iconType="left" onclick={onPickWallpaper}>
			<PhotoLibraryFill />
			{shell.state.hasWallpaper ? '重新选择' : '选择壁纸'}
		</Button>
	</div>
</div>
