import {
	AddHomeFill,
	CalendarMonth,
	CalendarMonthFill,
	DownloadFill,
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

export const BOTTOM_TAB_ICON_MAP: Record<
	string,
	{ icon: Component<{ class?: string }>; iconFill: Component<{ class?: string }> }
> = {
	timetable: { icon: CalendarMonth, iconFill: CalendarMonthFill },
	mine: { icon: Person, iconFill: PersonFill }
};

/** Resolves string icon keys declared on mine.item slot contributions. */
export const MINE_ITEM_ICON_MAP = {
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
