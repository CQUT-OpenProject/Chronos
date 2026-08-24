import { hostT } from '$lib/i18n/host-i18n.svelte';
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
	if (slot.importKind === 'online') {
		return hostT('transfer.import.method.onlineTitle', { title });
	}
	return hostT('transfer.import.method.title', { title });
}

export function defaultImportMethodSubtitle(slot: ImportTabSlotContribution): string {
	const custom = resolveSlotSupportingText(slot);
	if (custom) return custom;

	switch (slot.importKind) {
		case 'online':
			return hostT('transfer.import.method.onlineSubtitle');
		case 'file':
			return hostT('transfer.import.method.fileSubtitle');
		case 'link':
		default:
			return hostT('transfer.import.method.linkSubtitle');
	}
}

function buildCapabilityLabels(slots: ReadonlyArray<ImportTabSlotContribution>): string[] {
	const parts: string[] = [];
	for (const slot of slots) {
		if (slot.importKind === 'online') {
			parts.push(hostT('transfer.import.capability.online', { title: resolveSlotTitle(slot) }));
		}
	}
	if (slotsHaveImportKind(slots, 'link')) {
		parts.push(hostT('transfer.import.capability.shareCode'));
	}
	if (slotsHaveImportKind(slots, 'file')) {
		parts.push(hostT('transfer.import.capability.htmlFile'));
	}
	return parts;
}

export function buildImportDescription(slots: ReadonlyArray<ImportTabSlotContribution>): string {
	const onlineSlots = slots.filter((slot) => slot.importKind === 'online');
	const hasLink = slotsHaveImportKind(slots, 'link');
	const hasFile = slotsHaveImportKind(slots, 'file');

	if (onlineSlots.length === 0 && !hasLink && !hasFile) {
		return hostT('transfer.import.description.linkOnly');
	}

	const parts: string[] = [];
	for (const slot of onlineSlots) {
		parts.push(hostT('transfer.import.capability.online', { title: resolveSlotTitle(slot) }));
	}
	if (hasLink) parts.push(hostT('transfer.import.capability.shareCode'));
	if (hasFile) parts.push(hostT('transfer.import.description.htmlPart'));

	if (hasLink && !hasFile && onlineSlots.length === 0) {
		return hostT('transfer.import.description.linkOnly');
	}

	return hostT('transfer.import.description.full', { parts: parts.join('、') });
}

export function buildOnboardingImportHighlight(
	slots: ReadonlyArray<ImportTabSlotContribution>
): string {
	const parts = buildCapabilityLabels(slots);
	if (parts.length === 0) return hostT('transfer.import.onboarding.highlightFallback');
	const suffix = slotsHaveImportKind(slots, 'online')
		? hostT('transfer.import.onboarding.suffix.online')
		: hostT('transfer.import.onboarding.suffix.default');
	return hostT('transfer.import.onboarding.highlight', { parts: parts.join('、'), suffix });
}
