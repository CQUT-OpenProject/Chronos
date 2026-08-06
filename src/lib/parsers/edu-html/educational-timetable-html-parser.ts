import type { Course } from '$lib/models/course';
import { TimetableImportSource, type Timetable } from '$lib/models/timetable';
import type { EducationalTimetableHtmlParser as EducationalTimetableHtmlParserInterface } from '$lib/domain/interfaces/educational-timetable-html-parser';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';
import { SystemTimeProvider, type TimeProvider } from '$lib/domain/services/time-provider';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { parseHtmlDocument } from './dom';

const COURSE_PALETTE: [string, string][] = [
	['#EADDFF', '#21005D'],
	['#FFDBC9', '#311100'],
	['#C4EED0', '#072711'],
	['#F9DEDC', '#410E0B'],
	['#D3E3FD', '#041E49'],
	['#FFD8E4', '#31111D']
];
const WHITESPACE_REGEX = /\s+/g;
const WEEK_TOKEN = /\d+(?:-\d+)?周(?:\((?:单|双)\))?/g;

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
		const table = document.querySelector('#kbgrid_table_0');
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
					'',
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
					const key = normalizeWhitespace(
						paragraph.querySelector('[title]')?.getAttribute('title') ?? ''
					);
					if (!key) continue;
					metadata.set(key, normalizeWhitespace(paragraph.textContent ?? ''));
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
	for (const match of raw.replace(WHITESPACE_REGEX, '').matchAll(WEEK_TOKEN)) {
		const token = match[0] ?? '';
		const parity: WeekParity = token.includes('(单)')
			? 'ODD'
			: token.includes('(双)')
				? 'EVEN'
				: 'ALL';
		const normalized = token.replace(/周/g, '').replace('(单)', '').replace('(双)', '');
		const separatorIndex = normalized.indexOf('-');
		const start = Number.parseInt(
			separatorIndex >= 0 ? normalized.slice(0, separatorIndex) : normalized,
			10
		);
		const end = Number.parseInt(
			separatorIndex >= 0 ? normalized.slice(separatorIndex + 1) : normalized,
			10
		);
		if (Number.isNaN(start)) continue;
		const last = Number.isNaN(end) ? start : end;
		for (let week = start; week <= last; week += 1) {
			if (parity === 'ALL' || (parity === 'ODD' ? week % 2 === 1 : week % 2 === 0)) {
				weeks.add(week);
			}
		}
	}
	return [...weeks].sort((left, right) => left - right);
}

function coursePalette(name: string): [string, string] {
	const hash = kotlinStringHashCode(name);
	const index = Math.abs(hash % COURSE_PALETTE.length);
	return COURSE_PALETTE[index] ?? COURSE_PALETTE[0]!;
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

function normalizedCourseName(value: string): string {
	return value
		.replace(/^【调】/, '')
		.replace(/★$/, '')
		.replace(/☆$/, '')
		.replace(/〇$/, '')
		.replace(/■$/, '')
		.replace(/◆$/, '')
		.trim()
		.replace(WHITESPACE_REGEX, ' ');
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

function kotlinStringHashCode(value: string): number {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) | 0;
	}
	return hash;
}
