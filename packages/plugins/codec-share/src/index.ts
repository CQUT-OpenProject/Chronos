import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	ExportResult,
	ConfigSchema
} from '@chronos/core';
import { createTimetable, defineSchema } from '@chronos/core';

export interface ShareImportForm {
	content?: string;
	file?: string;
}

export const shareImportSchema = defineSchema<ShareImportForm>({
	content: {
		type: 'string',
		title: () => '粘贴 JSON 数据',
		placeholder: () => '在此粘贴课表 JSON 备份数据',
		required: false
	},
	file: {
		type: 'file',
		title: () => '或上传 JSON 备份文件',
		accept: '.json,application/json',
		required: false
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
	return createTimetable(raw);
}

export const shareCodecPlugin: ChronosPlugin = {
	id: 'codec-share',
	name: () => '课表 JSON 备份与分享编解码器',
	version: '1.0.0',
	description: () => '支持 Chronos 课表 JSON 备份文件的导入与导出',

	apply(ctx: ChronosContext) {
		async function doImport(inputs: Record<string, unknown>): Promise<Timetable> {
			const rawContent =
				(inputs.file as string | undefined) ??
				(inputs.content as string | undefined) ??
				(inputs.fileContent as string | undefined);

			if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
				throw new Error('请输入或上传有效的 JSON 课表数据');
			}
			return parseTimetableFromJson(rawContent.trim());
		}

		// 1. Register import tab slot for JSON backup / pasted data
		ctx.registerSlot('import.source.tab', {
			id: 'share-json',
			title: () => 'JSON 备份',
			order: 20,
			inputSchema: shareImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
			executeImport: (inputs: Record<string, unknown>) => doImport(inputs)
		});

		// 2. Register export action slot for JSON download
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
	}
};
