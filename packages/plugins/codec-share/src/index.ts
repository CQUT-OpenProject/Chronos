import type { ChronosPlugin, ChronosContext, Timetable, ExportResult } from '@chronos/core';
import { createTimetable, defineSchema } from '@chronos/core';
import {
	decodeSharePayload,
	encodeShareLink,
	ensureShareLinkBrotliReady,
	estimateShareLinkLength,
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
		placeholder: () => '粘贴课表分享链接或口令文本',
		description: () => '支持直接粘贴完整链接或口令文本',
		required: true
	}
});

export function exportTimetableToJson(timetable: Timetable): string {
	return JSON.stringify(timetable, null, 2);
}

export function parseTimetableFromJson(jsonStr: string): Timetable {
	const raw = JSON.parse(jsonStr);
	if (!raw || typeof raw !== 'object') {
		throw new Error('无效的 JSON 课表数据');
	}
	const timetable = createTimetable(raw);
	if (!raw.viewPrefs) {
		timetable.viewPrefs = {
			showSaturday: timetable.courses.some((c) => c.dayOfWeek === 6),
			showSunday: timetable.courses.some((c) => c.dayOfWeek === 7),
			showNonCurrentWeekCourses: false
		};
	}
	return timetable;
}

const shareLinkCodec = { estimatePayloadLength: estimateShareLinkLength };

export const shareCodecPlugin: ChronosPlugin = {
	id: 'codec-share',
	name: () => 'Share & Backup Codec',
	version: '1.0.0',
	description: () => '课表分享短链与 JSON 备份',
	category: 'codec',
	order: 30,
	author: 'CQUT OpenProject',
	homepage: 'https://github.com/CQUT-OpenProject/Chronos',

	async apply(ctx: ChronosContext) {
		await ensureShareLinkBrotliReady();

		ctx.registerSlot('import.source.tab', {
			id: 'share-link',
			title: () => '分享链接',
			order: 15,
			inputSchema: shareLinkImportSchema,
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
			id: 'share-json',
			title: () => 'JSON 结构化备份',
			order: 10,
			async export(timetable: Timetable): Promise<ExportResult> {
				const content = exportTimetableToJson(timetable);
				return {
					filename: `${timetable.name || 'timetable'}.json`,
					mimeType: 'application/json',
					content
				};
			}
		});

		ctx.registerSlot('export.action', {
			id: 'share-link',
			title: () => '复制课表分享链接',
			order: 5,
			async export(timetable: Timetable): Promise<ExportResult> {
				const link = await encodeShareLink(timetable);
				const clipboardText = formatShareClipboardText(timetable.name, link);
				void shareLinkCodec.estimatePayloadLength(timetable);
				return {
					filename: 'share-link.txt',
					mimeType: 'application/x-chronos-share-link',
					content: clipboardText
				};
			}
		});

		void shareLinkCodec;
	}
};

export {
	decodeSharePayload,
	encodeShareLink,
	estimateShareLinkLength,
	extractSharePayloadFromLocation,
	extractSharePayloadFromText,
	formatShareClipboardText,
	SHARE_LINK_WARNING_LENGTH
} from './share-link';
