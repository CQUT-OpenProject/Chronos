import {
	AddHomeFill,
	CalendarMonth,
	CalendarMonthFill,
	DownloadFill,
	EventFill,
	InfoFill,
	IosShareFill,
	ListAltFill,
	MobileVibrateFill,
	PaletteFill,
	Person,
	PersonFill,
	WallpaperFill,
	CodeFill
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
	info: InfoFill
} as const satisfies Record<string, Component<{ class?: string }>>;

/** Resolves string icon keys declared on mine.item slot contributions. */
export const MINE_ITEM_ICON_MAP = {
	'list-alt': ListAltFill,
	download: DownloadFill,
	share: IosShareFill,
	palette: PaletteFill,
	vibrate: MobileVibrateFill,
	wallpaper: WallpaperFill,
	code: CodeFill,
	event: EventFill,
	'add-home': AddHomeFill,
	info: InfoFill
} as const satisfies Record<string, Component<{ class?: string }>>;
