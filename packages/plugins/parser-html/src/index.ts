import type { ChronosPlugin, ChronosContext, Timetable, Course, ConfigSchema } from '@chronos/core';
import { createCourse, createTimetable, defineSchema } from '@chronos/core';
import { CQUT_DEFAULT_CAMPUS_PERIOD_TIMES, type CqutCampusId } from '@chronos/plugin-source-cqut';

const WHITESPACE_REGEX = /\s+/g;
type WeekParity = 'ALL' | 'ODD' | 'EVEN';

export interface HtmlImportForm {
	file?: string;
	termStartDate?: string;
	campusId?: CqutCampusId;
}

export const htmlImportSchema = defineSchema<HtmlImportForm>({
	file: {
		type: 'file',
		title: () => '选择 HTML 文件',
		description: () => '请选择从教务系统导出的 HTML 课表文件',
		accept: '.html,.htm,text/html',
		required: true
	},
	termStartDate: {
		type: 'date',
		title: () => '学期起始日期',
		description: () => '用于计算当前教学周',
		required: true
	},
	campusId: {
		type: 'select',
		title: () => '所在校区',
		default: 'huaxi',
		options: [
			{ label: () => '花溪校区', value: 'huaxi' },
			{ label: () => '两江校区', value: 'liangjiang' }
		],
		required: true
	}
});

function parseHtmlDoc(html: string): Document {
	if (typeof DOMParser !== 'undefined') {
		return new DOMParser().parseFromString(html, 'text/html');
	}
	throw new Error('DOMParser is not available in current runtime');
}

function normalizeWhitespace(value: string): string {
	return value.trim().replace(WHITESPACE_REGEX, ' ');
}

function extractOwnText(element: Element | null | undefined): string {
	if (!element) return '';
	let text = '';
	for (let i = 0; i < element.childNodes.length; i += 1) {
		const node = element.childNodes[i]!;
		if (node.nodeType === 3 /* Node.TEXT_NODE */) {
			text += node.textContent ?? '';
		}
	}
	return text;
}

function parseWeeks(raw: string): number[] {
	const weeks = new Set<number>();
	const normalized = raw
		.replace(/（/g, '(')
		.replace(/）/g, ')')
		.replace(/~/g, '-')
		.replace(/第/g, '');

	const BLOCK_REGEX = /([\d,\-\s]+)周(?:\((?:单|双)\))?/g;
	for (const match of normalized.matchAll(BLOCK_REGEX)) {
		const rangeStr = match[1] ?? '';
		const fullMatch = match[0] ?? '';
		const parity: WeekParity = fullMatch.includes('(单)')
			? 'ODD'
			: fullMatch.includes('(双)')
				? 'EVEN'
				: 'ALL';

		const parts = rangeStr.split(',');
		for (const part of parts) {
			const trimmed = part.trim();
			if (!trimmed) continue;
			const sep = trimmed.indexOf('-');
			const start = Number.parseInt(sep >= 0 ? trimmed.slice(0, sep) : trimmed, 10);
			const end = Number.parseInt(sep >= 0 ? trimmed.slice(sep + 1) : trimmed, 10);
			if (Number.isNaN(start)) continue;
			const last = Number.isNaN(end) ? start : end;
			for (let w = Math.min(start, last); w <= Math.max(start, last); w += 1) {
				if (parity === 'ALL' || (parity === 'ODD' ? w % 2 === 1 : w % 2 === 0)) {
					weeks.add(w);
				}
			}
		}
	}
	return [...weeks].sort((left, right) => left - right);
}

export function parseHtmlTimetable(
	html: string,
	options?: {
		customDocParser?: (html: string) => Document;
		termStartDate?: string;
		campusId?: CqutCampusId;
	}
): Timetable {
	const doc = options?.customDocParser ? options.customDocParser(html) : parseHtmlDoc(html);
	const table =
		doc.querySelector('#kbgrid_table_0') ??
		doc.querySelector('table.timetable1') ??
		doc.querySelector('table[id*="kbgrid"]');

	if (!table) {
		throw new Error('未找到教务课表表格结构');
	}

	const titleContainer = table.querySelector('.timetable_title');
	const term = normalizeWhitespace(
		titleContainer?.querySelector('h6.pull-left')?.textContent ?? ''
	);
	const studentName = normalizeWhitespace(extractOwnText(titleContainer)).replace(/的课表$/, '');

	const cells = table.querySelectorAll('td.td_wrap[id]');
	const courses: Course[] = [];

	cells.forEach((cell) => {
		const [dayRaw, periodRaw] = (cell.getAttribute('id') ?? '').split('-');
		const dayOfWeek = Number.parseInt(dayRaw ?? '', 10);
		const startPeriod = Number.parseInt(periodRaw ?? '', 10);
		if (Number.isNaN(dayOfWeek) || Number.isNaN(startPeriod)) return;

		const rowspan = Number.parseInt(cell.getAttribute('rowspan') ?? '1', 10);
		const endPeriod = startPeriod + (Number.isNaN(rowspan) ? 1 : rowspan) - 1;

		const blocks = cell.querySelectorAll('.timetable_con');
		blocks.forEach((block, blockIndex) => {
			const rawTitle = normalizeWhitespace(block.querySelector('.title')?.textContent ?? '');
			if (!rawTitle) return;

			const metadata = new Map<string, string>();
			const paragraphs = block.querySelectorAll('p');
			paragraphs.forEach((paragraph) => {
				const titleSpan = paragraph.querySelector('[title]');
				const key = normalizeWhitespace(titleSpan?.getAttribute('title') ?? '');
				if (!key) return;

				let rawValue = '';
				for (let i = 0; i < paragraph.childNodes.length; i += 1) {
					const node = paragraph.childNodes[i]!;
					if (node !== titleSpan) {
						rawValue += node.textContent ?? '';
					}
				}
				const val = normalizeWhitespace(rawValue);
				if (!val) return;

				const existing = metadata.get(key);
				metadata.set(key, existing ? `${existing}, ${val}` : val);
			});

			courses.push(
				createCourse({
					id: `html-${dayOfWeek}-${startPeriod}-${endPeriod}-${blockIndex}-${courses.length}`,
					name: rawTitle,
					teacher: metadata.get('教师') ?? '',
					location: metadata.get('上课地点') ?? '',
					dayOfWeek,
					startPeriod,
					endPeriod,
					weeks: parseWeeks(metadata.get('节/周') ?? '')
				})
			);
		});
	});

	if (courses.length === 0) {
		throw new Error('HTML 中未找到可导入的课程数据');
	}

	let maxWeek = 20;
	for (const course of courses) {
		for (const week of course.weeks) {
			if (week > maxWeek) maxWeek = week;
		}
	}

	return createTimetable({
		id: `html_${Date.now()}`,
		name: studentName ? `${studentName}的课表` : term || '导入的 HTML 课表',
		courses,
		academicConfig: {
			termStartDate: options?.termStartDate ?? '',
			startWeek: 1,
			endWeek: maxWeek,
			periodTimes: options?.campusId
				? CQUT_DEFAULT_CAMPUS_PERIOD_TIMES[options.campusId].map((period) => ({ ...period }))
				: []
		},
		viewPrefs: {
			showSaturday: courses.some((c) => c.dayOfWeek === 6),
			showSunday: courses.some((c) => c.dayOfWeek === 7),
			showNonCurrentWeekCourses: false
		},
		importMetadata: options?.campusId
			? { source: 'FILE_HTML', campusId: options.campusId }
			: undefined,
		customMetadata: {
			'core.import': {
				source: 'FILE_HTML',
				...(options?.campusId ? { campusId: options.campusId } : {})
			}
		}
	});
}

export const htmlParserPlugin: ChronosPlugin = {
	id: 'parser-html',
	name: () => '通用教务 HTML 解析器',
	version: '1.0.0',
	description: () => '解析国内高校教务系统导出的 HTML 课表文件',
	category: 'parser',
	order: 20,
	author: 'CQUT OpenProject',
	homepage: 'https://github.com/CQUT-OpenProject/Chronos',

	apply(ctx: ChronosContext) {
		async function doImport(inputs: Record<string, unknown>): Promise<Timetable> {
			const fileContent =
				(inputs.file as string | undefined) ?? (inputs.fileContent as string | undefined);
			if (!fileContent || typeof fileContent !== 'string') {
				throw new Error('请选择有效的 HTML 课表文件');
			}
			const termStartDate = inputs.termStartDate as string | undefined;
			const campusId = inputs.campusId as CqutCampusId | undefined;
			if (!termStartDate?.trim()) {
				throw new Error('请选择学期起始日期');
			}
			if (!campusId) {
				throw new Error('请选择校区');
			}
			return parseHtmlTimetable(fileContent, { termStartDate, campusId });
		}

		ctx.registerSlot('import.source.tab', {
			id: 'edu-html',
			title: () => 'HTML 文件',
			order: 30,
			inputSchema: htmlImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
			defaultInput: {
				campusId: 'huaxi'
			},
			executeImport: (inputs: Record<string, unknown>) => doImport(inputs)
		});
	}
};
