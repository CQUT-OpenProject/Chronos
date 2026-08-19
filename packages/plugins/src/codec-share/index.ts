import type { ChronosPlugin, ChronosContext, Timetable, ExportResult } from '@chronos/core';
import { createTimetable } from '@chronos/core';

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
		ctx.registerSource({
			id: 'share-json',
			title: () => 'JSON 课表备份',
			authType: 'file',
			async fetchSchedule({ fileContent }: { fileContent?: string }) {
				if (!fileContent || typeof fileContent !== 'string') {
					throw new Error('文件内容不能为空');
				}
				return parseTimetableFromJson(fileContent);
			}
		});

		ctx.registerExporter({
			id: 'share-json',
			title: () => 'JSON 课表备份',
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
