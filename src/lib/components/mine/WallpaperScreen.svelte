<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import TimetableGrid from '$lib/components/timetable/TimetableGrid.svelte';
	import { BuildVisibleTimetableGridUseCase } from '$lib/domain/usecases/build-visible-timetable-grid';
	import { BuildTimetableCourseDisplayModelsUseCase } from '$lib/domain/usecases/build-timetable-course-display-models';
	import { CalculateAcademicWeekUseCase } from '$lib/domain/usecases/calculate-academic-week';
	import { SystemTimeProvider } from '$lib/domain/services/time-provider';
	import Button from '$lib/components/ui/Button.svelte';
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

<div class="flex h-full min-h-0 flex-1 flex-col">
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={onFileChange}
	/>

	{#if shell.state.hasWallpaper && timetable && gridModel}
		<div
			class="relative min-h-0 flex-1 overflow-hidden"
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
		<p class="m3-body-medium flex-1 py-4 text-center text-on-surface-variant">
			选择壁纸后，可在此预览课表叠加效果。
		</p>
	{/if}

	<div
		class="flex h-[calc(var(--spacing-tabbar)+var(--tabbar-safe))] shrink-0 items-center gap-3 border-t border-outline-variant/40 bg-surface-container px-4 pb-[var(--tabbar-safe)]"
	>
		{#if shell.state.hasWallpaper}
			<Button variant="outlined" class="w-full flex-1" onclick={clearWallpaper}>
				<LayersClearFill class="size-5" />
				清除壁纸
			</Button>
		{/if}
		<Button variant="filled" class="w-full flex-1" onclick={onPickWallpaper}>
			<PhotoLibraryFill class="size-5" />
			{shell.state.hasWallpaper ? '重新选择' : '选择壁纸'}
		</Button>
	</div>
</div>
