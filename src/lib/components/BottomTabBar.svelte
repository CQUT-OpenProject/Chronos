<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { toAppPathname } from '$lib/navigation/app-pathname';
	import { CalendarMonth, CalendarMonthFill, Person, PersonFill } from '$lib/icons';
	import { haptic } from '$lib/haptic/haptic';

	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');

	const tabs = [
		{ href: '/', label: '课表', Icon: CalendarMonth, IconFill: CalendarMonthFill },
		{ href: '/mine', label: '我的', Icon: Person, IconFill: PersonFill }
	] as const;

	const appPathname = $derived(toAppPathname(page.url.pathname));
	const activeTabHref = $derived(appPathname === '/mine' ? '/mine' : '/');

	function isActive(href: string) {
		return activeTabHref === href;
	}

	function onTimetableTabClick(event: MouseEvent) {
		haptic.light();
		timetableScreen.jumpToCurrentWeek();
		if (appPathname === '/') {
			event.preventDefault();
		}
	}
</script>

<div class="bottom-bar w-full flex-col justify-center">
	<nav aria-label="主导航" class="flex w-full max-w-md items-center justify-around">
		{#each tabs as tab (tab.href)}
			{@const active = isActive(tab.href)}
			<a
				href={resolve(tab.href)}
				data-sveltekit-preload-data="off"
				aria-current={active ? 'page' : undefined}
				class="flex h-16 min-w-24 flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-on-surface-variant transition-colors hover:text-on-surface"
				onclick={tab.href === '/' ? onTimetableTabClick : () => haptic.light()}
			>
				<span
					aria-hidden="true"
					class="flex h-8 w-14 items-center justify-center rounded-full transition-colors {active
						? 'bg-primary-container text-on-primary-container'
						: ''}"
				>
					{#if active}
						<tab.IconFill class="size-6" />
					{:else}
						<tab.Icon class="size-6" />
					{/if}
				</span>
				<span class="m3-label-small {active ? 'text-on-surface' : 'text-on-surface-variant'}">
					{tab.label}
				</span>
			</a>
		{/each}
	</nav>
</div>
