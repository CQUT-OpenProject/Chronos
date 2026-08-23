import type {
	ChronosPlugin,
	ChronosContext,
	Timetable,
	Course,
	ExportResult,
	ConfigSchema
} from '@chronos/core';
import { createTimetable, createCourse, defineSchema } from '@chronos/core';
import { generateQrSvg, generateQrMatrix } from './qr/qr-encode';
import { decodeQrFromBlob } from './qr/qr-decode';
import QrCodeImportTab from './QrCodeImportTab.svelte';

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

function uint8ArrayToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]!);
	}
	return typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
}

function base64ToUint8Array(base64: string): Uint8Array {
	const binary =
		typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

async function deflateCompress(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof CompressionStream !== 'undefined') {
		try {
			const cs = new CompressionStream('deflate-raw');
			const writer = cs.writable.getWriter();
			writer.write(bytes as unknown as BufferSource);
			writer.close();
			const response = new Response(cs.readable);
			const arrayBuffer = await response.arrayBuffer();
			return new Uint8Array(arrayBuffer);
		} catch {
			// fallback to uncompressed
		}
	}
	return bytes;
}

async function inflateDecompress(bytes: Uint8Array): Promise<Uint8Array> {
	if (typeof DecompressionStream !== 'undefined') {
		try {
			const ds = new DecompressionStream('deflate-raw');
			const writer = ds.writable.getWriter();
			writer.write(bytes as unknown as BufferSource);
			writer.close();
			const response = new Response(ds.readable);
			const arrayBuffer = await response.arrayBuffer();
			return new Uint8Array(arrayBuffer);
		} catch {
			// fallback
		}
	}
	return bytes;
}

function weeksToBitmask(weeks: number[]): number {
	let mask = 0;
	for (const w of weeks) {
		if (w >= 1 && w <= 31) {
			mask |= 1 << w;
		}
	}
	return mask;
}

function bitmaskToWeeks(mask: number): number[] {
	const weeks: number[] = [];
	for (let i = 1; i <= 31; i++) {
		if ((mask & (1 << i)) !== 0) {
			weeks.push(i);
		}
	}
	return weeks.length > 0 ? weeks : [1];
}

export async function serializeTimetableForQr(timetable: Timetable): Promise<string> {
	const stringPool: string[] = [];
	const stringMap = new Map<string, number>();

	function internString(str?: string | null): number {
		if (!str) return -1;
		const trimmed = str.trim();
		if (!trimmed) return -1;
		let idx = stringMap.get(trimmed);
		if (idx === undefined) {
			idx = stringPool.length;
			stringPool.push(trimmed);
			stringMap.set(trimmed, idx);
		}
		return idx;
	}

	const coursesData: V2CompactQrPayload['c'] = timetable.courses.map((course) => {
		const nameIdx = internString(course.name);
		const teacherIdx = internString(course.teacher);
		const locationIdx = internString(course.location);
		const remarkIdx = internString(course.remark);
		const colorIdx = internString(course.color);
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
		s: stringPool,
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
	const compressedBytes = await deflateCompress(rawBytes);

	return `chronos-qr:v2:${uint8ArrayToBase64(compressedBytes)}`;
}

export async function deserializeTimetableFromQr(rawText: string): Promise<Timetable> {
	let content = rawText.trim();

	// 1. Version 2 (Deflate + Dictionary + Bitmask)
	if (content.startsWith('chronos-qr:v2:')) {
		const base64 = content.slice('chronos-qr:v2:'.length);
		const compressedBytes = base64ToUint8Array(base64);
		const decompressedBytes = await inflateDecompress(compressedBytes);
		const jsonStr = new TextDecoder().decode(decompressedBytes);
		const data = JSON.parse(jsonStr) as V2CompactQrPayload;

		const pool = data.s ?? [];
		const courses: Course[] = (data.c ?? []).map((tuple, idx) => {
			const name = (tuple[0] >= 0 ? pool[tuple[0]] : null) ?? '未命名课程';
			const teacher = (tuple[1] >= 0 ? pool[tuple[1]] : null) ?? '';
			const location = (tuple[2] >= 0 ? pool[tuple[2]] : null) ?? '';
			const dayOfWeek = tuple[3] ?? 1;
			const startPeriod = tuple[4] ?? 1;
			const endPeriod = tuple[5] ?? 1;
			const weeks = bitmaskToWeeks(tuple[6] ?? 1);
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
				weeks,
				remark,
				color
			});
		});

		return createTimetable({
			id: `t-qr-${Date.now().toString(36)}`,
			name: data.n || '二维码导入课表',
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
			courses
		});
	}

	// 2. Version 1 (Uncompressed Base64 JSON)
	if (content.startsWith('chronos-qr:v1:')) {
		const base64 = content.slice('chronos-qr:v1:'.length);
		const bytes = base64ToUint8Array(base64);
		content = new TextDecoder().decode(bytes);
	}

	// 3. Fallback direct JSON parsing
	let data: unknown;
	try {
		data = JSON.parse(content);
	} catch {
		throw new Error('二维码数据格式损坏或无法解析为课表');
	}

	if (!data || typeof data !== 'object') {
		throw new Error('二维码内容不是合法的课表数据结构');
	}

	const legacy = data as Record<string, unknown>;
	if (Array.isArray(legacy.courses)) {
		return createTimetable({
			id: `t-qr-${Date.now().toString(36)}`,
			name: (legacy.name as string) || '二维码导入课表',
			academicConfig: legacy.academicConfig as Timetable['academicConfig'],
			courses: (legacy.courses as Course[]).map((c) => createCourse(c))
		});
	}

	throw new Error('二维码中未包含有效的课表课程数据');
}

export interface QrCodeImportForm {
	content?: string;
	fileContent?: string;
}

export const qrCodeImportSchema = defineSchema<QrCodeImportForm>({
	content: {
		type: 'string',
		title: () => '二维码内容',
		placeholder: () => '二维码识别出的数据内容',
		required: true
	}
});

export interface CreateQrCodecPluginOptions {
	importComponent?: unknown;
}

export function createQrCodecPlugin(options: CreateQrCodecPluginOptions = {}): ChronosPlugin {
	const { importComponent = QrCodeImportTab } = options;

	return {
		id: 'tool-qrcode',
		name: () => '课表二维码',
		version: '1.0.0',
		description: () => '课表二维码生成与识别导入',
		category: 'tool',
		order: 35,
		author: 'CQUT OpenProject',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',

		async apply(ctx: ChronosContext) {
			ctx.registerSlot('import.source.tab', {
				id: 'qrcode',
				title: () => '二维码',
				order: 25,
				importKind: 'file',
				badge: () => '图片',
				supportingText: () => '选择或扫描课表二维码图片进行导入',
				component: importComponent,
				inputSchema: qrCodeImportSchema as unknown as ConfigSchema<Record<string, unknown>>,
				async executeImport(inputs: Record<string, unknown>) {
					const content =
						(inputs.content as string | undefined) ?? (inputs.fileContent as string | undefined);
					if (!content?.trim()) {
						throw new Error('未识别到有效的二维码内容');
					}
					return deserializeTimetableFromQr(content);
				}
			});

			ctx.registerSlot('export.action', {
				id: 'qrcode',
				title: () => '课表二维码',
				order: 20,
				disposition: 'download',
				isPrimary: false,
				description: () => '生成分享二维码矢量图并保存',
				async export(timetable: Timetable, exportCtx?: ChronosContext): Promise<ExportResult> {
					const targetTimetable = timetable ?? exportCtx?.state.currentTimetable;
					if (!targetTimetable) {
						throw new Error('无可导出的课表');
					}
					const payload = await serializeTimetableForQr(targetTimetable);
					const svg = generateQrSvg(payload, { margin: 2 });
					const safeName = (targetTimetable.name || 'timetable').replace(/[/\\?%*:|"<>]/g, '_');
					return {
						filename: `${safeName}-qrcode.svg`,
						mimeType: 'image/svg+xml',
						content: svg,
						disposition: 'download',
						successMessage: () => '已生成并下载课表二维码'
					};
				}
			});
		}
	};
}

export const qrCodecPlugin = createQrCodecPlugin();

export { generateQrSvg, generateQrMatrix, decodeQrFromBlob, QrCodeImportTab };
