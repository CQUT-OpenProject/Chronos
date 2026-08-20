export type { CqutCampusId } from '@chronos/plugin-source-cqut';
export {
	CQUT_CAMPUSES,
	CQUT_CAMPUS_IDS,
	DEFAULT_CQUT_CAMPUS_ID,
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES,
	CQUT_DEFAULT_CAMPUS_PERIOD_TIMES as CQUT_CAMPUS_DEFAULT_PERIOD_TIMES,
	getCampusApiName,
	getCampusDefaultPeriodTimes,
	isCqutCampusId,
	resolveCampusIdFromApiName,
	inferCampusIdFromCourses,
	campusIdToShareIndex,
	shareIndexToCampusId,
	resolveShareCampusId
} from '@chronos/plugin-source-cqut';
