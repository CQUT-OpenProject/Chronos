import {
	resolveLocalizedText,
	type ImportKind,
	type ImportTabSlotContribution
} from '@chronos/core';
import { hostText } from '$lib/i18n/host-text';

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
	if (slot.importKind === 'online') {
		return hostText('transfer.import.method.onlineTitle', { title });
	}
	return hostText('transfer.import.method.title', { title });
}

export function defaultImportMethodSubtitle(slot: ImportTabSlotContribution): string {
	const custom = resolveSlotSupportingText(slot);
	if (custom) return custom;

	switch (slot.importKind) {
		case 'online':
			return hostText('transfer.import.method.onlineSubtitle');
		case 'file':
			return hostText('transfer.import.method.fileSubtitle');
		case 'link':
		default:
			return hostText('transfer.import.method.linkSubtitle');
	}
}

function buildCapabilityLabels(slots: ReadonlyArray<ImportTabSlotContribution>): string[] {
	const parts: string[] = [];
	for (const slot of slots) {
		if (slot.importKind === 'online') {
			parts.push(hostText('transfer.import.capability.online', { title: resolveSlotTitle(slot) }));
		}
	}
	if (slotsHaveImportKind(slots, 'link')) {
		parts.push(hostText('transfer.import.capability.shareCode'));
	}
	if (slotsHaveImportKind(slots, 'file')) {
		parts.push(hostText('transfer.import.capability.htmlFile'));
	}
	return parts;
}

export function buildImportDescription(slots: ReadonlyArray<ImportTabSlotContribution>): string {
	const onlineSlots = slots.filter((slot) => slot.importKind === 'online');
	const hasLink = slotsHaveImportKind(slots, 'link');
	const hasFile = slotsHaveImportKind(slots, 'file');

	if (onlineSlots.length === 0 && !hasLink && !hasFile) {
		return hostText('transfer.import.description.linkOnly');
	}

	const parts: string[] = [];
	for (const slot of onlineSlots) {
		parts.push(hostText('transfer.import.capability.online', { title: resolveSlotTitle(slot) }));
	}
	if (hasLink) parts.push(hostText('transfer.import.capability.shareCode'));
	if (hasFile) parts.push(hostText('transfer.import.description.htmlPart'));

	if (hasLink && !hasFile && onlineSlots.length === 0) {
		return hostText('transfer.import.description.linkOnly');
	}

	return hostText('transfer.import.description.full', { parts: parts.join('、') });
}

export function buildOnboardingImportHighlight(
	slots: ReadonlyArray<ImportTabSlotContribution>
): string {
	const parts = buildCapabilityLabels(slots);
	if (parts.length === 0) return hostText('transfer.import.onboarding.highlightFallback');
	const suffix = slotsHaveImportKind(slots, 'online')
		? hostText('transfer.import.onboarding.suffix.online')
		: hostText('transfer.import.onboarding.suffix.default');
	return hostText('transfer.import.onboarding.highlight', { parts: parts.join('、'), suffix });
}
