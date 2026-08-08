<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { CalendarMonth, CalendarMonthFill, Person, PersonFill } from '$lib/icons';
	import { NavCMLX } from 'm3-svelte';

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

<div
	class="flex h-[calc(var(--spacing-tabbar)+var(--tabbar-safe))] flex-col items-center justify-center border-t border-outline-variant/40 bg-surface-container px-4 pb-[var(--tabbar-safe)]"
>
	<NavCMLX variant="compact">
		{#each tabs as tab (tab.href)}
			{@const active = isActive(tab.href)}
			<a
				href={resolve(tab.href)}
				class="m3-layer flex h-16 min-w-24 flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-on-surface-variant"
				onclick={tab.href === '/' ? onTimetableTabClick : vibrate}
			>
				<span
					class="flex h-8 w-14 items-center justify-center rounded-full {active
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
	</NavCMLX>
</div>
