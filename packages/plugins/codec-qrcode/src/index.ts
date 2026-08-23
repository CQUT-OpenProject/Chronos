import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	Course,
	ExportResult,
	ConfigSchema
} from '@chronos/core';
import {
	type ChronosMountable,
	createTimetable,
	createCourse,
	deriveWeekendViewPrefs
} from '@chronos/core';
import {
	base64ToBytes,
	bitmaskToWeeks,
	bytesToBase64,
	deflateRaw,
	inflateRaw,
	StringInterner,
	weeksToBitmask
} from '@chronos/codec-kit';
import { generateQrSvg, generateQrMatrix } from './qr/qr-encode';
import { decodeQrFromBlob } from './qr/qr-decode';
import QrCodeImportTab from './QrCodeImportTab.svelte';
import { mountableSvelteComponent } from '@chronos/ui-kit';
import {
	createQrCodeImportSchema,
	QR_CODEC_MESSAGES,
	qrCodecLabels,
	type QrCodecLabels
} from './messages';

export interface V2CompactQrPayload {
	v: 2;
	n: string; // name
	d?: string; // termStartDate
	w?: [number, number]; // [startWeek, endWeek]
	p?: Array<[number, string, string]>; // periodTimes
	s: string[]; // string pool
	c: Array<[number, number, number, number, number, number, number, number?, number?]>;
	// [nameIdx, teacherIdx, locationIdx, dayOfWeek, startPeriod, endPeriod, weekBitmask, remarkIdx?, colorIdx?]
}

export async function serializeTimetableForQr(timetable: Timetable): Promise<string> {
	const interner = new StringInterner();

	const coursesData: V2CompactQrPayload['c'] = timetable.courses.map((course) => {
		const nameIdx = interner.intern(course.name);
		const teacherIdx = interner.intern(course.teacher);
		const locationIdx = interner.intern(course.location);
		const remarkIdx = interner.intern(course.remark);
		const colorIdx = interner.intern(course.color);
		const weekBitmask = weeksToBitmask(course.weeks);

		const item: V2CompactQrPayload['c'][number] = [
			nameIdx,
			teacherIdx,
			locationIdx,
			course.dayOfWeek,
			course.startPeriod,
			course.endPeriod,
			weekBitmask
		];
		if (remarkIdx >= 0 || colorIdx >= 0) {
			item.push(remarkIdx >= 0 ? remarkIdx : -1);
		}
		if (colorIdx >= 0) {
			item.push(colorIdx);
		}
		return item;
	});

	const payload: V2CompactQrPayload = {
		v: 2,
		n: timetable.name,
		s: interner.strings,
		c: coursesData
	};

	if (timetable.academicConfig?.termStartDate) {
		payload.d = timetable.academicConfig.termStartDate;
	}
	if (
		timetable.academicConfig?.startWeek !== undefined ||
		timetable.academicConfig?.endWeek !== undefined
	) {
		payload.w = [timetable.academicConfig.startWeek ?? 1, timetable.academicConfig.endWeek ?? 20];
	}
	if (timetable.academicConfig?.periodTimes?.length) {
		payload.p = timetable.academicConfig.periodTimes.map((p) => [p.index, p.startTime, p.endTime]);
	}

	const json = JSON.stringify(payload);
	const rawBytes = new TextEncoder().encode(json);
	const compressedBytes = await deflateRaw(rawBytes);

	return `chronos-qr:v2:${bytesToBase64(compressedBytes)}`;
}

export async function deserializeTimetableFromQr(
	rawText: string,
	labels: Pick<
		QrCodecLabels,
		'import.error.corrupt' | 'timetable.unnamedCourse' | 'timetable.defaultName'
	> = qrCodecLabels('zh-cn')
): Promise<Timetable> {
	const content = rawText.trim();

	if (!content.startsWith('chronos-qr:v2:')) {
		throw new Error(labels['import.error.corrupt']);
	}

	const base64 = content.slice('chronos-qr:v2:'.length);
	const compressedBytes = base64ToBytes(base64);
	const decompressedBytes = await inflateRaw(compressedBytes);
	const jsonStr = new TextDecoder().decode(decompressedBytes);
	const data = JSON.parse(jsonStr) as V2CompactQrPayload;

	const pool = data.s ?? [];
	const courses: Course[] = (data.c ?? []).map((tuple, idx) => {
		const name = (tuple[0] >= 0 ? pool[tuple[0]] : null) ?? labels['timetable.unnamedCourse'];
		const teacher = (tuple[1] >= 0 ? pool[tuple[1]] : null) ?? '';
		const location = (tuple[2] >= 0 ? pool[tuple[2]] : null) ?? '';
		const dayOfWeek = tuple[3] ?? 1;
		const startPeriod = tuple[4] ?? 1;
		const endPeriod = tuple[5] ?? 1;
		const weeks = bitmaskToWeeks(tuple[6] ?? 1);
		const safeWeeks = weeks.length > 0 ? weeks : [1];
		const remark = tuple[7] !== undefined && tuple[7] >= 0 ? pool[tuple[7]] : undefined;
		const color = tuple[8] !== undefined && tuple[8] >= 0 ? pool[tuple[8]] : undefined;

		return createCourse({
			id: `c-qr-${idx + 1}-${Date.now().toString(36)}`,
			name,
			teacher,
			location,
			dayOfWeek,
			startPeriod,
			endPeriod,
			weeks: safeWeeks,
			remark,
			color
		});
	});

	return createTimetable({
		id: `t-qr-${Date.now().toString(36)}`,
		name: data.n || labels['timetable.defaultName'],
		academicConfig: {
			termStartDate: data.d ?? '',
			startWeek: data.w?.[0] ?? 1,
			endWeek: data.w?.[1] ?? 20,
			periodTimes: (data.p ?? []).map((p) => ({
				index: p[0],
				startTime: p[1],
				endTime: p[2]
			}))
		},
		viewPrefs: {
			...deriveWeekendViewPrefs(courses),
			showNonCurrentWeekCourses: false
		},
		courses
	});
}

export type { QrCodeImportForm } from './messages';

export interface CreateQrCodecPluginOptions {
	importComponent?: ChronosMountable;
}

export function createQrCodecPlugin(options: CreateQrCodecPluginOptions = {}): ChronosPlugin {
	const { importComponent = mountableSvelteComponent(QrCodeImportTab) } = options;
	let translate: ((key: string) => string) | undefined;

	return {
		id: 'tool-qrcode',
		name: () => translate?.('plugin.name') ?? QR_CODEC_MESSAGES['zh-cn']['plugin.name'],
		version: '1.0.0',
		description: () =>
			translate?.('plugin.description') ?? QR_CODEC_MESSAGES['zh-cn']['plugin.description'],
		category: 'tool',
		order: 35,
		author: 'CQUT OpenProject',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',

		async apply(ctx: ChronosContext) {
			ctx.i18n.registerMessages(QR_CODEC_MESSAGES);
			const t = (key: string) => ctx.i18n.t(key);
			translate = t;
			const labels = qrCodecLabels(ctx.i18n.locale);
			const qrCodeImportSchema = createQrCodeImportSchema(t);

			ctx.registerSlot('import.source.tab', {
				id: 'qrcode',
				title: () => t('import.tab.title'),
				order: 25,
				importKind: 'file',
				badge: () => t('import.tab.badge'),
				supportingText: () => t('import.tab.supporting'),
				component: importComponent,
				inputSchema: qrCodeImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
				async executeImport(inputs: Record<string, unknown>) {
					const content =
						(inputs.content as string | undefined) ?? (inputs.fileContent as string | undefined);
					if (!content?.trim()) {
						throw new Error(t('import.error.empty'));
					}
					return deserializeTimetableFromQr(content, labels);
				}
			});

			ctx.registerSlot('export.action', {
				id: 'qrcode',
				title: () => t('export.action.title'),
				order: 20,
				disposition: 'download',
				isPrimary: false,
				description: () => t('export.action.description'),
				async export(timetable: Timetable, exportCtx?: ChronosContext): Promise<ExportResult> {
					const targetTimetable = timetable ?? exportCtx?.state.currentTimetable;
					if (!targetTimetable) {
						throw new Error(t('export.error.noTimetable'));
					}
					const payload = await serializeTimetableForQr(targetTimetable);
					const svg = generateQrSvg(payload, { margin: 2 });
					const safeName = (targetTimetable.name || 'timetable').replace(/[/\\?%*:|"<>]/g, '_');
					return {
						filename: `${safeName}-qrcode.svg`,
						mimeType: 'image/svg+xml',
						content: svg,
						disposition: 'download',
						successMessage: () => t('export.success')
					};
				}
			});
		}
	};
}

export const qrCodecPlugin = createQrCodecPlugin();

export { generateQrSvg, generateQrMatrix, decodeQrFromBlob, QrCodeImportTab };
