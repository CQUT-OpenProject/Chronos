import type { LocalizedText } from '../types/slots';

export const HOST_DEFAULT_ICON_THEME_ID = 'host-default';

export type ShellIconSize = 'default' | 'large';

export interface ShellIconDescriptor {
	type: 'registry' | 'svg' | 'url';
	id?: string;
	markup?: string;
	url?: string;
	size?: ShellIconSize;
	/** Clockwise rotation in degrees */
	rotation?: number;
	opacity?: number;
}

export function isShellIconDescriptor(value: unknown): value is ShellIconDescriptor {
	if (typeof value !== 'object' || value === null) return false;
	const d = value as ShellIconDescriptor;
	if (d.type !== 'registry' && d.type !== 'svg' && d.type !== 'url') return false;
	if (d.type === 'registry' && typeof d.id !== 'string') return false;
	if (d.type === 'svg' && typeof d.markup !== 'string') return false;
	if (d.type === 'url' && typeof d.url !== 'string') return false;
	return true;
}

export interface BottomTabIconOverride {
	icon?: ShellIconDescriptor;
	iconFill?: ShellIconDescriptor;
}

export interface IconThemeContribution {
	id: string;
	name: LocalizedText;
	description?: LocalizedText;
	bottomTabIcons?: Record<string, BottomTabIconOverride>;
}
