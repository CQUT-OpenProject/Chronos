/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import zlib from 'node:zlib';
import type { Course } from '../packages/core/src/index.ts';
import { TimetableImportSource, createTimetable } from '../apps/web/src/lib/models/timetable.ts';
import { encodeTimetableToBinary } from '../apps/web/src/lib/parsers/share-link/chronos-share-binary.ts';
import { appendCrc32 } from '../apps/web/src/lib/parsers/share-link/crc32.ts';
import {
	brotliCompressShare,
	brotliDecompressShare,
	ensureShareLinkBrotliReady
} from '../apps/web/src/lib/parsers/share-link/share-link-brotli.ts';
import { deflateSync, inflateSync } from 'fflate';

interface BenchmarkCase {
	label: string;
	binary: Uint8Array;
}

interface BenchmarkResult {
	algorithm: string;
	compressedBytes: number;
	payloadChars: number;
	ratio: number;
	encodeMs: number;
	decodeMs: number;
}

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function payloadChars(bytes: Uint8Array): number {
	return 2 + bytesToBase64Url(bytes).length;
}

function bench(
	algorithm: string,
	encode: (input: Uint8Array) => Uint8Array,
	decode: (input: Uint8Array) => Uint8Array,
	input: Uint8Array
): BenchmarkResult {
	const encodeStart = performance.now();
	const compressed = encode(input);
	const encodeMs = performance.now() - encodeStart;

	const decodeStart = performance.now();
	const restored = decode(compressed);
	const decodeMs = performance.now() - decodeStart;

	if (restored.length !== input.length) {
		throw new Error(`${algorithm}: round-trip length mismatch`);
	}
	for (let index = 0; index < input.length; index += 1) {
		if (restored[index] !== input[index]) {
			throw new Error(`${algorithm}: round-trip byte mismatch at ${index}`);
		}
	}

	return {
		algorithm,
		compressedBytes: compressed.length,
		payloadChars: payloadChars(compressed),
		ratio: compressed.length / input.length,
		encodeMs,
		decodeMs
	};
}

function brotliBench(level: number, input: Uint8Array): BenchmarkResult {
	return bench(
		`brotli:${level}`,
		(data) =>
			zlib.brotliCompressSync(Buffer.from(data), {
				params: { [zlib.constants.BROTLI_PARAM_QUALITY]: level }
			}),
		(data) => new Uint8Array(zlib.brotliDecompressSync(Buffer.from(data))),
		input
	);
}

function zstdBench(level: number, input: Uint8Array): BenchmarkResult {
	return bench(
		`zstd:${level}`,
		(data) =>
			zlib.zstdCompressSync(Buffer.from(data), {
				params: { [zlib.constants.ZSTD_c_compressionLevel]: level }
			}),
		(data) => new Uint8Array(zlib.zstdDecompressSync(Buffer.from(data))),
		input
	);
}

function lzmaBench(preset: string, input: Uint8Array): BenchmarkResult {
	return bench(
		`lzma/xz:${preset}`,
		(data) => {
			const compressed = execFileSync('xz', [`-${preset}`, '--keep', '--stdout'], {
				input: Buffer.from(data),
				maxBuffer: 10 * 1024 * 1024
			});
			return new Uint8Array(compressed);
		},
		(data) => {
			const restored = execFileSync('xz', ['--decompress', '--keep', '--stdout'], {
				input: Buffer.from(data),
				maxBuffer: 10 * 1024 * 1024
			});
			return new Uint8Array(restored);
		},
		input
	);
}

function runCase(testCase: BenchmarkCase): BenchmarkResult[] {
	const input = testCase.binary;
	const results: BenchmarkResult[] = [];

	results.push(
		bench(
			'brotli:11 (current)',
			(data) => brotliCompressShare(data),
			(data) => brotliDecompressShare(data),
			input
		)
	);

	results.push(
		bench(
			'deflate:9',
			(data) => deflateSync(data, { level: 9 }),
			(data) => inflateSync(data),
			input
		)
	);

	for (const level of [1, 6] as const) {
		results.push(
			bench(
				`deflate:${level}`,
				(data) => deflateSync(data, { level }),
				(data) => inflateSync(data),
				input
			)
		);
	}

	for (const level of [1, 4, 6, 9]) {
		results.push(brotliBench(level, input));
	}
	results.push(brotliBench(11, input));

	for (const level of [1, 3, 6, 9, 15, 19, 22]) {
		results.push(zstdBench(level, input));
	}

	for (const preset of ['6', '9', '9e']) {
		results.push(lzmaBench(preset, input));
	}

	return results.sort((left, right) => left.payloadChars - right.payloadChars);
}

function printResults(testCase: BenchmarkCase, results: BenchmarkResult[]): void {
	const baseline = results.find((entry) => entry.algorithm === 'brotli:11 (current)');
	console.log(`\n=== ${testCase.label} ===`);
	console.log(`raw binary (+CRC): ${testCase.binary.length} bytes`);
	if (baseline) {
		console.log(
			`baseline payload: ${baseline.payloadChars} chars (${baseline.compressedBytes} B compressed)`
		);
	}
	console.log('');
	console.log(
		[
			'algorithm'.padEnd(22),
			'compressed'.padStart(10),
			'payload'.padStart(8),
			'saved'.padStart(8),
			'ratio'.padStart(7),
			'enc ms'.padStart(8),
			'dec ms'.padStart(8)
		].join(' ')
	);
	console.log('-'.repeat(81));

	for (const result of results) {
		const saved =
			baseline && result.algorithm !== baseline.algorithm
				? `${(((baseline.payloadChars - result.payloadChars) / baseline.payloadChars) * 100).toFixed(1)}%`
				: '—';
		console.log(
			[
				result.algorithm.padEnd(22),
				String(result.compressedBytes).padStart(10),
				String(result.payloadChars).padStart(8),
				saved.padStart(8),
				result.ratio.toFixed(3).padStart(7),
				result.encodeMs.toFixed(2).padStart(8),
				result.decodeMs.toFixed(2).padStart(8)
			].join(' ')
		);
	}
}

function course(id: string, name: string, teacher: string, overrides: Partial<Course> = {}) {
	return {
		id,
		name,
		teacher,
		location: 'A101',
		dayOfWeek: 1,
		startPeriod: 1,
		endPeriod: 2,
		color: '#EADDFF',
		textColor: '#21005D',
		weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
		remark: '',
		...overrides
	};
}

function sampleTimetable() {
	return createTimetable({
		id: 't1',
		name: '2025-2026学年第2学期',
		courses: [
			course('c1', '编译原理', '张老师', {
				location: 'B201',
				dayOfWeek: 6,
				remark: '带教材第 3 版',
				weeks: [1, 2, 3]
			})
		],
		createdAt: 1,
		updatedAt: 1,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: TimetableImportSource.SHARED_JSON }
	});
}

function createLargeTimetable(count: number) {
	const teachers = ['张老师', '李老师', '王老师', '赵老师', '刘老师'];
	const locations = [
		'两江校区 弘远楼A0401',
		'两江校区 弘远楼A0402',
		'两江校区 弘远楼A0409',
		'两江校区 弘远楼B0315',
		'两江校区 弘远楼D0429'
	];
	const names = [
		'编译原理',
		'数据结构',
		'操作系统',
		'计算机网络',
		'数据库原理',
		'软件工程',
		'人工智能',
		'机器学习',
		'线性代数',
		'概率统计',
		'大学英语',
		'马克思主义',
		'体育',
		'形势与政策',
		'创新创业'
	];

	return createTimetable({
		id: 'large',
		name: '2025-2026学年第2学期',
		courses: Array.from({ length: count }, (_, index) =>
			course(
				`c${index + 1}`,
				names[index] ?? `课程${index + 1}`,
				teachers[index % teachers.length]!,
				{
					location: locations[index % locations.length]!,
					dayOfWeek: (index % 7) + 1,
					startPeriod: (index % 8) + 1,
					endPeriod: (index % 8) + 2,
					weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
				}
			)
		),
		createdAt: 1,
		updatedAt: 1,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: TimetableImportSource.SHARED_JSON }
	});
}

function createCqutLargeTimetable() {
	const buildingCourses = [
		['数据库原理及应用', '朱烨华', '两江校区 弘远楼D0429', 1, 1, 2, [6, 7, 8, 9, 10, 11]],
		['数据库原理及应用', '朱烨华', '两江校区 弘远楼A0402', 3, 3, 4, [6, 7, 8, 9, 10, 11]],
		['移动开发技术及应用', '杨承玉', '两江校区 弘远楼A0409', 3, 3, 4, [15, 16, 17, 18]],
		['操作系统', '杨承玉', '两江校区 弘远楼A0213', 3, 5, 6, [6, 7, 8, 9, 10, 11, 12]],
		['物联网通信技术', '王东', '两江校区 弘远楼D0429', 3, 7, 8, [3, 4, 5, 6, 7, 8, 9, 10]],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0311', 3, 9, 10, [2, 3, 4, 5, 6, 7, 8, 9]],
		[
			'毛泽东思想和中国特色社会主义理论体系概论',
			'李老师',
			'两江校区 弘远楼B0315',
			4,
			3,
			4,
			[2, 3, 4, 5, 6]
		],
		['物联网感知与控制技术', '王东', '两江校区 弘远楼D0426', 4, 3, 4, [11, 12, 13, 14, 15]],
		[
			'数据库原理及应用',
			'朱烨华',
			'两江校区 弘远楼B0415',
			4,
			7,
			8,
			[2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
		],
		['物联网感知与控制技术', '王东', '两江校区 弘远楼A0409', 4, 7, 8, [16, 17, 18, 19]],
		['物联网通信技术', '王东', '两江校区 弘远楼D0236', 4, 9, 10, [2, 3, 4, 5, 6, 7, 8, 9]],
		[
			'数据库原理及应用',
			'朱烨华',
			'两江校区 弘远楼B0415',
			1,
			3,
			4,
			[2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
		],
		[
			'移动开发技术及应用',
			'杨承玉',
			'两江校区 弘远楼A0409',
			5,
			1,
			2,
			[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0409', 5, 3, 4, [2, 3, 4, 5]],
		[
			'移动开发技术及应用',
			'杨承玉',
			'两江校区 弘远楼D0425',
			5,
			3,
			4,
			[6, 7, 8, 9, 10, 11, 12, 13, 14]
		],
		[
			'操作系统',
			'杨承玉',
			'两江校区 弘远楼A0401',
			5,
			5,
			6,
			[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		[
			'操作系统',
			'杨承玉',
			'两江校区 弘远楼A0213',
			5,
			7,
			8,
			[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0311', 5, 9, 10, [2, 3, 4, 5]],
		[
			'物联网感知与控制技术',
			'王东',
			'两江校区 弘远楼D0426',
			2,
			3,
			4,
			[11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		['物联网通信技术', '王东', '两江校区 弘远楼D0236', 2, 3, 4, [2, 3, 4, 5, 6, 7, 8, 9]],
		[
			'毛泽东思想和中国特色社会主义理论体系概论',
			'李老师',
			'两江校区 弘远楼B0315',
			2,
			5,
			6,
			[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0311', 2, 7, 8, [6, 7, 8, 9]],
		[
			'物联网感知与控制技术',
			'王东',
			'两江校区 弘远楼A0409',
			2,
			7,
			8,
			[11, 12, 13, 14, 15, 16, 17, 18, 19]
		],
		['深度学习（双语）', '王伟', '两江校区 弘远楼A0409', 2, 9, 10, [6, 7, 8, 9]],
		['形势与政策5', '赵老师', '两江校区 弘远楼B0315', 3, 1, 2, [3, 4, 5, 6]]
	] as const;

	return createTimetable({
		id: 'cqut-large',
		name: '2026-2027-1',
		courses: buildingCourses.map(
			([name, teacher, location, dayOfWeek, startPeriod, endPeriod, weeks], index) =>
				course(`c${index + 1}`, name, teacher, {
					location,
					dayOfWeek,
					startPeriod,
					endPeriod,
					weeks: [...weeks]
				})
		),
		createdAt: 1,
		updatedAt: 1,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 21,
			periodTimes: []
		},
		importMetadata: { source: TimetableImportSource.SHARED_JSON }
	});
}

function toBinary(timetable: ReturnType<typeof createTimetable>): Uint8Array {
	return appendCrc32(encodeTimetableToBinary(timetable));
}

const cases: BenchmarkCase[] = [
	{ label: '1 course (sample)', binary: toBinary(sampleTimetable()) },
	{ label: '15 courses', binary: toBinary(createLargeTimetable(15)) },
	{ label: '25 courses (CQUT)', binary: toBinary(createCqutLargeTimetable()) }
];

await ensureShareLinkBrotliReady();
console.log('Chronos share-link compression benchmark');
console.log('payload chars = len("1." + base64url(compressed))');

for (const testCase of cases) {
	printResults(testCase, runCase(testCase));
}
