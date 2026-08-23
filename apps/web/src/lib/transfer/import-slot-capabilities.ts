import {
	resolveLocalizedText,
	type ImportKind,
	type ImportTabSlotContribution
} from '@chronos/core';

function resolveSlotTitle(slot: ImportTabSlotContribution): string {
	return resolveLocalizedText(slot.title);
}

function resolveSlotSupportingText(slot: ImportTabSlotContribution): string | undefined {
	if (!slot.supportingText) return undefined;
	return resolveLocalizedText(slot.supportingText);
}

export function slotsHaveImportKind(
	slots: ReadonlyArray<ImportTabSlotContribution>,
	kind: ImportKind
): boolean {
	return slots.some((slot) => slot.importKind === kind);
}

export function formatImportMethodTitle(slot: ImportTabSlotContribution): string {
	const title = resolveSlotTitle(slot);
	if (slot.importKind === 'online') return `${title}在线导入`;
	return `${title}导入`;
}

export function defaultImportMethodSubtitle(slot: ImportTabSlotContribution): string {
	const custom = resolveSlotSupportingText(slot);
	if (custom) return custom;

	switch (slot.importKind) {
		case 'online':
			return '输入账号密码，获取在线课表';
		case 'file':
			return '从教务系统导出课表页面后，导入该 HTML 文件';
		case 'link':
		default:
			return '粘贴他人分享的课表链接即可导入';
	}
}

function buildCapabilityLabels(slots: ReadonlyArray<ImportTabSlotContribution>): string[] {
	const parts: string[] = [];
	for (const slot of slots) {
		if (slot.importKind === 'online') {
			parts.push(`${resolveSlotTitle(slot)}在线导入`);
		}
	}
	if (slotsHaveImportKind(slots, 'link')) {
		parts.push('分享链接');
	}
	if (slotsHaveImportKind(slots, 'file')) {
		parts.push('HTML 文件');
	}
	return parts;
}

export function buildImportDescription(slots: ReadonlyArray<ImportTabSlotContribution>): string {
	const onlineSlots = slots.filter((slot) => slot.importKind === 'online');
	const hasLink = slotsHaveImportKind(slots, 'link');
	const hasFile = slotsHaveImportKind(slots, 'file');

	if (onlineSlots.length === 0 && !hasLink && !hasFile) {
		return '支持分享链接导入课表。';
	}

	const parts: string[] = [];
	for (const slot of onlineSlots) {
		parts.push(`${resolveSlotTitle(slot)}在线导入`);
	}
	if (hasLink) parts.push('分享链接');
	if (hasFile) parts.push('教务系统导出的 HTML 文件');

	if (hasLink && !hasFile && onlineSlots.length === 0) {
		return '支持分享链接导入课表。';
	}

	return `支持${parts.join('、')}。`;
}

export function buildOnboardingImportHighlight(
	slots: ReadonlyArray<ImportTabSlotContribution>
): string {
	const parts = buildCapabilityLabels(slots);
	if (parts.length === 0) return '分享链接可导入';
	const suffix = slotsHaveImportKind(slots, 'online') ? '均可' : '均可导入';
	return `${parts.join('、')}${suffix}`;
}
