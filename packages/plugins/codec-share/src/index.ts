import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	ExportResult,
	ConfigSchema
} from '@chronos/core';
import { type ChronosMountable } from '@chronos/core';
import {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromLocation,
	extractSharePayloadFromText,
	formatShareClipboardText
} from './share-link';
import ShareLinkImportTab from './ShareLinkImportTab.svelte';
import { mountableSvelteComponent } from '@chronos/ui-kit';
import { createShareLinkImportSchema, SHARE_CODEC_MESSAGES } from './messages';

export type { ShareLinkImportForm } from './messages';

export interface CreateShareCodecPluginOptions {
	shareComponent?: ChronosMountable;
}

export function createShareCodecPlugin(options: CreateShareCodecPluginOptions = {}): ChronosPlugin {
	const { shareComponent = mountableSvelteComponent(ShareLinkImportTab) } = options;

	return {
		id: 'codec-share',
		name: () => 'Share Codec',
		version: '1.0.0',
		description: () => '课表分享短链编解码',
		category: 'codec',
		order: 30,
		author: 'CQUT OpenProject',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',

		async apply(ctx: ChronosContext) {
			ctx.i18n.registerMessages(SHARE_CODEC_MESSAGES);
			const t = (key: string) => ctx.i18n.t(key);
			const shareLinkImportSchema = createShareLinkImportSchema(t);

			ctx.registerSlot('import.source.tab', {
				id: 'share-link',
				title: () => t('import.tab.title'),
				order: 15,
				importKind: 'link',
				component: shareComponent,
				inputSchema: shareLinkImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
				deepLink: {
					fromLocation(location) {
						const payload = extractSharePayloadFromLocation(location as Location);
						return payload ? { content: payload, fileContent: payload } : null;
					}
				},
				async executeImport(inputs: Record<string, unknown>) {
					const content =
						(inputs.content as string | undefined) ?? (inputs.fileContent as string | undefined);
					if (!content?.trim()) {
						throw new Error(t('import.error.empty'));
					}
					const payload = extractSharePayloadFromText(content);
					if (!payload) {
						throw new Error(t('import.error.empty'));
					}
					const result = await decodeSharePayload(payload);
					if (!result.ok) {
						throw new Error(result.errorMessage);
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
					const clipboardText = formatShareClipboardText(timetable.name, link);
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
	};
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
