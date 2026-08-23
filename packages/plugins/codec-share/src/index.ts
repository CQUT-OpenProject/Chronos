import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	ExportResult,
	ConfigSchema
} from '@chronos/core';
import { type ChronosMountable, defineSchema } from '@chronos/core';
import {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromLocation,
	extractSharePayloadFromText,
	formatShareClipboardText
} from './share-link';

export interface ShareLinkImportForm {
	content?: string;
}

export const shareLinkImportSchema = defineSchema<ShareLinkImportForm>({
	content: {
		type: 'string',
		title: () => '分享链接或口令',
		placeholder: () => '粘贴课表分享链接或完整口令',
		required: true
	}
});

import ShareLinkImportTab from './ShareLinkImportTab.svelte';
import { mountableSvelteComponent } from '@chronos/ui-kit';

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
			// 压缩引擎按需加载，首包不再阻塞插件初始化（deflate 优先，brotli 懒加载）

			ctx.registerSlot('import.source.tab', {
				id: 'share-link',
				title: () => '分享链接',
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
						throw new Error('未识别到有效的课表分享链接');
					}
					const payload = extractSharePayloadFromText(content);
					if (!payload) {
						throw new Error('未识别到有效的课表分享链接');
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
				title: () => '复制课表分享链接',
				order: 5,
				disposition: 'clipboard',
				isPrimary: true,
				description: () => '生成紧凑分享口令并复制到剪贴板',
				async export(timetable: Timetable): Promise<ExportResult> {
					const link = await encodeShareLink(timetable);
					const clipboardText = formatShareClipboardText(timetable.name, link);
					return {
						filename: 'share-link.txt',
						mimeType: 'application/x-chronos-share-link',
						content: clipboardText,
						disposition: 'clipboard',
						successMessage: () => '已复制课表链接'
					};
				},
				estimateLength: estimateShareLinkLength,
				async checkWarning(timetable: Timetable): Promise<string | null> {
					if (!timetable.courses?.length) return null;
					try {
						const length = await estimateShareLinkLength(timetable);
						if (length > 2000) {
							return '课表较大，部分应用可能截断链接内容，请注意核对导入结果';
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
