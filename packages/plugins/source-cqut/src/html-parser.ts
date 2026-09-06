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
import { parseWeeks } from './week-parser';
import { extractOwnText, normalizeWhitespace, parseHtmlDoc } from './html-dom-utils';

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
