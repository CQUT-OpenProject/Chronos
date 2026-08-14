import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { CQUT_CAMPUS_IDS, getCampusApiName, type CqutCampusId } from '$lib/models/cqut-campus';
import type { PeriodTime } from '$lib/models/timetable';
import {
	mapCampusTimeInfoToPeriodTimes,
	resolveUserCampusId,
	type CampusTimeInfoRow
} from '$lib/timetable/timetable-mappers';
import { GET_CAMPUS_TIME_INFO_URL, GET_USER_INFO_URL, JSON_MEDIA_TYPE } from './config';
import type { CookieJar } from './cookie-jar';
import { requestStep } from './http-client';

export interface CampusTimeFetchOverrides {
	getUserInfoUrl?: string;
	getCampusTimeInfoUrl?: string;
}

export interface CampusTimesForImport {
	campusId: CqutCampusId;
	campusPeriodTimes: Record<CqutCampusId, PeriodTime[]>;
}

export async function fetchUserCampusName(
	jar: CookieJar,
	signal?: AbortSignal,
	overrides?: CampusTimeFetchOverrides
): Promise<AppResult<CqutCampusId>> {
	const responseResult = await requestStep(
		jar,
		overrides?.getUserInfoUrl ?? GET_USER_INFO_URL,
		{
			method: 'POST',
			headers: { 'Content-Type': JSON_MEDIA_TYPE },
			body: '{}'
		},
		{ signal },
		'获取用户校区信息'
	);
	if (!responseResult.ok) return responseResult;

	let parsed: unknown;
	try {
		parsed = await responseResult.value.json();
	} catch {
		return failure(AppError.dataFormat('用户信息响应格式错误'));
	}

	const campusName = extractUserCampusName(parsed);
	return success(resolveUserCampusId(campusName));
}

export async function fetchCampusTimeInfo(
	jar: CookieJar,
	campusId: CqutCampusId,
	signal?: AbortSignal,
	overrides?: CampusTimeFetchOverrides
): Promise<AppResult<PeriodTime[]>> {
	const responseResult = await requestStep(
		jar,
		overrides?.getCampusTimeInfoUrl ?? GET_CAMPUS_TIME_INFO_URL,
		{
			method: 'POST',
			headers: { 'Content-Type': JSON_MEDIA_TYPE },
			body: JSON.stringify({ campusName: getCampusApiName(campusId) })
		},
		{ signal },
		'获取校区节次时间'
	);
	if (!responseResult.ok) return responseResult;

	let parsed: unknown;
	try {
		parsed = await responseResult.value.json();
	} catch {
		return failure(AppError.dataFormat('校区节次时间响应格式错误'));
	}

	const rows = parseCampusTimeInfoRows(parsed);
	if (!rows.ok) return rows;

	const periods = mapCampusTimeInfoToPeriodTimes(rows.value);
	if (periods.length === 0) {
		return failure(AppError.dataFormat('校区节次时间为空'));
	}

	return success(periods);
}

export async function fetchCampusTimesForImport(
	jar: CookieJar,
	signal?: AbortSignal
): Promise<AppResult<CampusTimesForImport>> {
	const campusIdResult = await fetchUserCampusName(jar, signal);
	if (!campusIdResult.ok) return campusIdResult;

	const campusResults = await Promise.all(
		CQUT_CAMPUS_IDS.map(async (campusId) => {
			const result = await fetchCampusTimeInfo(jar, campusId, signal);
			return { campusId, result };
		})
	);

	const campusPeriodTimes = {} as Record<CqutCampusId, PeriodTime[]>;
	for (const { campusId, result } of campusResults) {
		if (!result.ok) return result;
		campusPeriodTimes[campusId] = result.value;
	}

	return success({
		campusId: campusIdResult.value,
		campusPeriodTimes
	});
}

function extractUserCampusName(value: unknown): string | null {
	if (!value || typeof value !== 'object') return null;

	const root = value as Record<string, unknown>;
	const data = root.data;
	if (data && typeof data === 'object') {
		const fromData = readCampusNameFromSettings(
			(data as Record<string, unknown>).userCustomSetting
		);
		if (fromData) return fromData;
	}

	return readCampusNameFromSettings(root.userCustomSetting);
}

function readCampusNameFromSettings(value: unknown): string | null {
	if (!value || typeof value !== 'object') return null;
	const campusName = (value as Record<string, unknown>).campusName;
	return typeof campusName === 'string' ? campusName : null;
}

function parseCampusTimeInfoRows(value: unknown): AppResult<CampusTimeInfoRow[]> {
	if (!Array.isArray(value)) {
		return failure(AppError.dataFormat('校区节次时间响应格式错误'));
	}

	const rows: CampusTimeInfoRow[] = [];
	for (const item of value) {
		if (!item || typeof item !== 'object') {
			return failure(AppError.dataFormat('校区节次时间响应格式错误'));
		}
		const row = item as Record<string, unknown>;
		const sessionNum = row.sessionNum;
		const startTime = row.startTime;
		const endTime = row.endTime;
		const campusName = row.campusName;
		if (
			typeof sessionNum !== 'number' ||
			typeof startTime !== 'string' ||
			typeof endTime !== 'string' ||
			typeof campusName !== 'string'
		) {
			return failure(AppError.dataFormat('校区节次时间响应格式错误'));
		}
		rows.push({ campusName, sessionNum, startTime, endTime });
	}

	return success(rows);
}
