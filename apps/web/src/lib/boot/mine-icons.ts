import {
	AddHomeFill,
	CalendarMonth,
	CalendarMonthFill,
	CalendarTodayFill,
	DownloadFill,
	EventFill,
	InfoFill,
	IosShareFill,
	ListAltFill,
	MobileVibrateFill,
	PaletteFill,
	Person,
	PersonFill,
	Today,
	WallpaperFill,
	CodeFill,
	History,
	ScheduleFill
} from '$lib/icons';
import type { Component } from 'svelte';

/** Host icon registry for shell.bottom-bar.tab, mine.item, and theme shell overrides. */
export const SHELL_ICON_MAP = {
	'calendar-month': CalendarMonth,
	'calendar-month-fill': CalendarMonthFill,
	person: Person,
	'person-fill': PersonFill,
	'list-alt': ListAltFill,
	download: DownloadFill,
	share: IosShareFill,
	palette: PaletteFill,
	vibrate: MobileVibrateFill,
	wallpaper: WallpaperFill,
	code: CodeFill,
	'add-home': AddHomeFill,
	info: InfoFill,
	today: Today,
	'calendar-today': CalendarTodayFill,
	event: EventFill,
	history: History,
	schedule: ScheduleFill
} as const satisfies Record<string, Component<{ class?: string }>>;
