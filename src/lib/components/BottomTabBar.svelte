<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { CalendarMonth, CalendarMonthFill, Person, PersonFill } from '$lib/icons';

	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');

	const tabs = [
		{ href: '/', label: '课表', Icon: CalendarMonth, IconFill: CalendarMonthFill },
		{ href: '/mine', label: '我的', Icon: Person, IconFill: PersonFill }
	] as const;

	const activeTabHref = $derived(page.url.pathname === '/mine' ? '/mine' : '/');

	function isActive(href: string) {
		return activeTabHref === href;
	}

	function vibrate() {
		navigator.vibrate?.(10);
	}

	function onTimetableTabClick(event: MouseEvent) {
		vibrate();
		timetableScreen.jumpToCurrentWeek();
		if (page.url.pathname === '/') {
			event.preventDefault();
		}
	}
</script>

<div class="bottom-bar w-full flex-col justify-center">
	<nav class="flex w-full max-w-md items-center justify-around">
		{#each tabs as tab (tab.href)}
			{@const active = isActive(tab.href)}
			<a
				href={resolve(tab.href)}
				class="flex h-16 min-w-24 flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-on-surface-variant transition-colors hover:text-on-surface"
				onclick={tab.href === '/' ? onTimetableTabClick : vibrate}
			>
				<span
					class="flex h-8 w-14 items-center justify-center rounded-full transition-colors {active
						? 'bg-secondary-container text-on-secondary-container'
						: ''}"
				>
					{#if active}
						<tab.IconFill class="size-6" />
					{:else}
						<tab.Icon class="size-6" />
					{/if}
				</span>
				<span
					class="text-xs {active ? 'font-semibold text-on-secondary-container' : 'font-medium'}"
				>
					{tab.label}
				</span>
			</a>
		{/each}
	</nav>
</div>
