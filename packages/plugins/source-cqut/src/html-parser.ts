import type { Timetable, Course } from '@chronos/core';
import {
	AcademicCalendarService,
	ImportSlotError,
	createCourse,
	createTimetable,
	deriveWeekendViewPrefs,
	normalizedCourseName
} from '@chronos/core';
import {
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	DEFAULT_CQUT_CAMPUS_ID,
	type CqutCampusId
} from './campus-period-times';

const WHITESPACE_REGEX = /\s+/g;
type WeekParity = 'ALL' | 'ODD' | 'EVEN';

export interface HtmlImportForm {
	file?: string;
}

export interface HtmlConfirmForm {
	campusId?: CqutCampusId;
	termStartDate?: string;
}

const calendarService = new AcademicCalendarService();

export function finalizeHtmlPreview(
	preview: Timetable,
	confirmInputs: HtmlConfirmForm,
	t: (key: string) => string,
	referenceDate = new Date().toISOString().slice(0, 10)
): Timetable {
	const campusId = confirmInputs.campusId ?? DEFAULT_CQUT_CAMPUS_ID;
	const rawTermStartDate = confirmInputs.termStartDate?.trim() ?? '';
	if (!rawTermStartDate) {
		throw new ImportSlotError('invalid-data', t('import.html.error.termStartRequired'));
	}

	const termStartDate = calendarService.normalizeTermStartDate(rawTermStartDate, referenceDate);
	const periodTimes = CQUT_DEFAULT_CAMPUS_PERIOD_TIMES[campusId].map((period) => ({ ...period }));

	return {
		...preview,
		academicConfig: {
			...preview.academicConfig,
			termStartDate,
			periodTimes
		},
		importMetadata: {
			...preview.importMetadata,
			source: 'FILE_HTML',
			campusId
		},
		customMetadata: {
			...preview.customMetadata,
			'source-cqut': {
				...(preview.customMetadata?.['source-cqut'] as Record<string, unknown> | undefined),
				source: 'FILE_HTML',
				campusId
			}
		}
	};
}

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
		t?: (key: string) => string;
	}
): Timetable {
	const t = options?.t ?? ((key: string) => key);
	const doc = options?.customDocParser ? options.customDocParser(html) : parseHtmlDoc(html);
	const table =
		doc.querySelector('#kbgrid_table_0') ??
		doc.querySelector('table.timetable1') ??
		doc.querySelector('table[id*="kbgrid"]');

	if (!table) {
		throw new ImportSlotError('invalid-data', t('import.html.error.tableNotFound'));
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

			const normalizedName = normalizedCourseName(rawTitle);

			courses.push(
				createCourse({
					id: `html-${dayOfWeek}-${startPeriod}-${endPeriod}-${blockIndex}-${courses.length}`,
					name: normalizedName,
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
		throw new ImportSlotError('no-data', t('import.html.error.noCourses'));
	}

	let maxWeek = 20;
	for (const course of courses) {
		for (const week of course.weeks) {
			if (week > maxWeek) maxWeek = week;
		}
	}

	return createTimetable({
		id: `html_${Date.now()}`,
		name: studentName
			? `${studentName}${t('timetable.studentSuffix')}`
			: term || t('import.html.timetableDefaultName'),
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
			...deriveWeekendViewPrefs(courses),
			showNonCurrentWeekCourses: false
		},
		importMetadata: options?.campusId
			? { source: 'FILE_HTML', campusId: options.campusId }
			: undefined,
		customMetadata: {
			'source-cqut': {
				source: 'FILE_HTML',
				...(options?.campusId ? { campusId: options.campusId } : {})
			}
		}
	});
}
