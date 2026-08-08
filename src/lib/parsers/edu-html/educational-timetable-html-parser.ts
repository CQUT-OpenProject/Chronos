import type { Course } from '$lib/models/course';
import { TimetableImportSource, type Timetable } from '$lib/models/timetable';
import type { EducationalTimetableHtmlParser as EducationalTimetableHtmlParserInterface } from '$lib/domain/interfaces/educational-timetable-html-parser';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';
import { SystemTimeProvider, type TimeProvider } from '$lib/domain/services/time-provider';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	coursePalette,
	kotlinStringHashCode,
	normalizedCourseName
} from '$lib/parsers/course-palette';
import { parseHtmlDocument } from './dom';

const WHITESPACE_REGEX = /\s+/g;

type WeekParity = 'ALL' | 'ODD' | 'EVEN';

export class EducationalTimetableHtmlParser implements EducationalTimetableHtmlParserInterface {
	constructor(
		private readonly academicCalendarService = new AcademicCalendarService(),
		private readonly timeProvider: TimeProvider = new SystemTimeProvider()
	) {}

	parse(content: string): AppResult<Timetable | null> {
		return this.parseDocument(parseHtmlDocument(content));
	}

	parseBytes(contentBytes: Uint8Array): AppResult<Timetable | null> {
		const content = new TextDecoder().decode(contentBytes);
		return this.parse(content);
	}

	private parseDocument(document: Document): AppResult<Timetable | null> {
		const table =
			document.querySelector('#kbgrid_table_0') ??
			document.querySelector('table.timetable1') ??
			document.querySelector('table[id*="kbgrid"]');
		if (!table) return success(null);

		const titleContainer = table.querySelector('.timetable_title');
		const term = normalizeWhitespace(
			titleContainer?.querySelector('h6.pull-left')?.textContent ?? ''
		);
		const studentName = normalizeWhitespace(extractOwnText(titleContainer)).replace(/的课表$/, '');

		const courses = [...table.querySelectorAll('td.td_wrap[id]')].flatMap((cell) =>
			this.parseCellCourses(cell)
		);

		if (courses.length === 0) {
			return failure(AppError.validation('HTML 中未找到可导入的课程数据'));
		}

		const now = this.timeProvider.currentTimeMillis();
		const maxWeek = Math.max(20, ...courses.flatMap((course) => course.weeks));

		return success({
			id: crypto.randomUUID(),
			name: studentName ? `${studentName}的课表` : term || '导入课表',
			courses,
			createdAt: now,
			updatedAt: now,
			academicConfig: {
				termStartDate: this.academicCalendarService.normalizeTermStartDate(
					term,
					this.timeProvider.today()
				),
				startWeek: 1,
				endWeek: maxWeek,
				periodTimes: []
			},
			importMetadata: { source: TimetableImportSource.FILE_HTML },
			viewPrefs: {
				showSaturday: courses.some((course) => course.dayOfWeek === 6),
				showSunday: courses.some((course) => course.dayOfWeek === 7),
				showNonCurrentWeekCourses: false
			}
		});
	}

	private parseCellCourses(cell: Element): Course[] {
		const [dayRaw, periodRaw] = (cell.getAttribute('id') ?? '').split('-');
		const dayOfWeek = Number.parseInt(dayRaw ?? '', 10);
		const startPeriod = Number.parseInt(periodRaw ?? '', 10);
		if (Number.isNaN(dayOfWeek) || Number.isNaN(startPeriod)) return [];

		const rowspan = Number.parseInt(cell.getAttribute('rowspan') ?? '1', 10);
		const endPeriod = startPeriod + (Number.isNaN(rowspan) ? 1 : rowspan) - 1;

		return [...cell.children]
			.filter((child) => child.classList.contains('timetable_con'))
			.map((block, blockIndex) => {
				const rawTitle = normalizeWhitespace(block.querySelector('.title')?.textContent ?? '');
				if (!rawTitle) return null;

				const metadata = new Map<string, string>();
				for (const paragraph of block.querySelectorAll('p')) {
					const titleSpan = paragraph.querySelector('[title]');
					const key = normalizeWhitespace(titleSpan?.getAttribute('title') ?? '');
					if (!key) continue;

					const val = normalizeWhitespace(
						[...paragraph.childNodes]
							.filter((node) => node !== titleSpan)
							.map((node) => node.textContent ?? '')
							.join('')
					);
					if (!val) continue;

					const existing = metadata.get(key);
					metadata.set(key, existing ? `${existing}, ${val}` : val);
				}

				const normalizedName = normalizedCourseName(rawTitle);
				const [background, foreground] = coursePalette(normalizedName);
				return {
					id: buildParsedCourseId(dayOfWeek, startPeriod, endPeriod, blockIndex, rawTitle),
					name: normalizedName,
					teacher: metadata.get('教师') ?? '',
					location: metadata.get('上课地点') ?? '',
					dayOfWeek,
					startPeriod,
					endPeriod,
					color: background,
					textColor: foreground,
					weeks: parseWeeks(metadata.get('节/周') ?? ''),
					remark: ''
				} satisfies Course;
			})
			.filter((course): course is Course => course != null);
	}
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

function buildParsedCourseId(
	dayOfWeek: number,
	startPeriod: number,
	endPeriod: number,
	blockIndex: number,
	rawTitle: string
): string {
	return `${dayOfWeek}-${startPeriod}-${endPeriod}-${blockIndex}-${kotlinStringHashCode(rawTitle)}`;
}

function normalizeWhitespace(value: string): string {
	return value.trim().replace(WHITESPACE_REGEX, ' ');
}

function extractOwnText(element: Element | null | undefined): string {
	if (!element) return '';
	return [...element.childNodes]
		.filter((node) => node.nodeType === 3)
		.map((node) => node.textContent ?? '')
		.join('');
}
