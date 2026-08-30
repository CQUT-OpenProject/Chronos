import type { LocalizedText } from '../types/slots';
import {
	type BottomTabIconOverride,
	type IconThemeContribution,
	isShellIconDescriptor,
	type ShellIconDescriptor
} from './icon-theme';

export interface IconThemeJson {
	id: string;
	name: Record<string, string> | string;
	description?: Record<string, string> | string;
	bottomTabIcons?: Record<string, BottomTabIconOverride>;
}

function validateDescriptor(descriptor: ShellIconDescriptor, path: string): ShellIconDescriptor {
	if (!isShellIconDescriptor(descriptor)) {
		throw new Error(`Invalid icon descriptor at ${path}`);
	}
	if (descriptor.type === 'svg' && typeof descriptor.markup === 'string') {
		if (descriptor.markup.includes('<script')) {
			throw new Error(`Invalid SVG at ${path}: script tags not allowed`);
		}
	}
	return descriptor;
}

export function parseIconThemeJson(raw: unknown): IconThemeJson {
	if (!raw || typeof raw !== 'object') {
		throw new Error('Invalid icon theme JSON: root must be an object');
	}
	const data = raw as Record<string, unknown>;
	if (typeof data.id !== 'string' || !data.id) {
		throw new Error('Invalid icon theme JSON: missing id');
	}
	return data as unknown as IconThemeJson;
}

export function createIconThemeFromJson(json: IconThemeJson): IconThemeContribution {
	const bottomTabIcons: Record<string, BottomTabIconOverride> | undefined = json.bottomTabIcons
		? {}
		: undefined;

	if (json.bottomTabIcons && bottomTabIcons) {
		for (const [tabId, override] of Object.entries(json.bottomTabIcons)) {
			const entry: BottomTabIconOverride = {};
			if (override.icon) {
				entry.icon = validateDescriptor(override.icon, `bottomTabIcons.${tabId}.icon`);
			}
			if (override.iconFill) {
				entry.iconFill = validateDescriptor(override.iconFill, `bottomTabIcons.${tabId}.iconFill`);
			}
			bottomTabIcons[tabId] = entry;
		}
	}

	const name: LocalizedText = json.name;
	const description: LocalizedText | undefined = json.description;

	return {
		id: json.id,
		name,
		description,
		bottomTabIcons
	};
}
