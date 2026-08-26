import {
	defineChronosPlugin,
	ImportSlotError,
	registerImportTab,
	type ChronosMountable,
	type ExportResult,
	type Timetable
} from '@chronos/core';
import {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromLocation,
	extractSharePayloadFromText,
	formatShareClipboardText,
	type ShareClipboardLabels,
	type ShareDecodeLabels
} from './share-link';
import ShareLinkImportTab from './ShareLinkImportTab.svelte';
import { mountableSvelteComponent } from '@chronos/ui-kit';
import {
	createShareLinkImportSchema,
	SHARE_CODEC_MESSAGES,
	type ShareLinkImportForm
} from './messages';

export type { ShareLinkImportForm } from './messages';

export interface CreateShareCodecPluginOptions {
	shareComponent?: ChronosMountable;
}

export function createShareCodecPlugin(options: CreateShareCodecPluginOptions = {}) {
	const { shareComponent = mountableSvelteComponent(ShareLinkImportTab) } = options;

	return defineChronosPlugin({
		id: 'codec-share',
		messages: SHARE_CODEC_MESSAGES,
		nameKey: 'plugin.name',
		descriptionKey: 'plugin.description',
		category: 'codec',
		order: 30,
		author: 'CQUT OpenProject',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		async apply(ctx, t) {
			const shareLinkImportSchema = createShareLinkImportSchema(t);
			const decodeLabels: ShareDecodeLabels = {
				'share.error.corrupted': t('share.error.corrupted'),
				'share.error.unsupported': t('share.error.unsupported'),
				'share.error.parseFailed': t('share.error.parseFailed')
			};
			const clipboardLabels: ShareClipboardLabels = {
				'share.clipboard.unnamed': t('share.clipboard.unnamed'),
				'share.clipboard.template': t('share.clipboard.template')
			};

			registerImportTab<ShareLinkImportForm>(ctx, {
				id: 'share-link',
				title: () => t('import.tab.title'),
				order: 15,
				importKind: 'link',
				component: shareComponent,
				inputSchema: shareLinkImportSchema,
				deepLink: {
					fromLocation(location) {
						const payload = extractSharePayloadFromLocation(location as Location);
						return payload ? { content: payload, fileContent: payload } : null;
					}
				},
				async executeImport(inputs) {
					const content =
						(inputs.content as string | undefined) ?? (inputs.fileContent as string | undefined);
					if (!content?.trim()) {
						throw new ImportSlotError('no-data', t('import.error.empty'));
					}
					const payload = extractSharePayloadFromText(content);
					if (!payload) {
						throw new ImportSlotError('no-data', t('import.error.empty'));
					}
					const result = await decodeSharePayload(payload, decodeLabels);
					if (!result.ok) {
						const kind =
							result.errorMessage === decodeLabels['share.error.unsupported']
								? 'unsupported'
								: 'invalid-data';
						throw new ImportSlotError(kind, result.errorMessage);
					}
					return result.value;
				}
			});

			ctx.registerSlot('export.action', {
				id: 'share-link',
				title: () => t('export.action.title'),
				order: 5,
				disposition: 'clipboard',
				isPrimary: true,
				description: () => t('export.action.description'),
				async export(timetable: Timetable): Promise<ExportResult> {
					const link = await encodeShareLink(timetable);
					const clipboardText = formatShareClipboardText(timetable.name, link, clipboardLabels);
					return {
						filename: 'share-link.txt',
						mimeType: 'application/x-chronos-share-link',
						content: clipboardText,
						disposition: 'clipboard',
						successMessage: () => t('export.success')
					};
				},
				estimateLength: estimateShareLinkLength,
				async checkWarning(timetable: Timetable): Promise<string | null> {
					if (!timetable.courses?.length) return null;
					try {
						const length = await estimateShareLinkLength(timetable);
						if (length > 2000) {
							return t('export.warning.large');
						}
						return null;
					} catch {
						return null;
					}
				}
			});
		}
	});
}

export const shareCodecPlugin = createShareCodecPlugin();

export {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromLocation,
	extractSharePayloadFromText,
	formatShareClipboardText,
	SHARE_LINK_WARNING_LENGTH
} from './share-link';
