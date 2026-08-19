import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import {
	CQUT_CAMPUS_DEFAULT_PERIOD_TIMES,
	campusIdToShareIndex,
	getCampusDefaultPeriodTimes,
	inferCampusIdFromCourses,
	resolveCampusIdFromApiName,
	resolveShareCampusId,
	shareIndexToCampusId
} from './cqut-campus';

function sampleCourse(location: string) {
	return createCourse({
		id: 'c1',
		name: '课程',
		teacher: '教师',
		location,
		dayOfWeek: 1,
		startPeriod: 1,
		endPeriod: 2,
		color: '#EADDFF'
	});
}

describe('cqut-campus', () => {
	it('provides ten period slots per campus', () => {
		expect(CQUT_CAMPUS_DEFAULT_PERIOD_TIMES.liangjiang).toHaveLength(10);
		expect(CQUT_CAMPUS_DEFAULT_PERIOD_TIMES.huaxi).toHaveLength(10);
		expect(getCampusDefaultPeriodTimes('liangjiang')[0]?.startTime).toBe('08:30');
		expect(getCampusDefaultPeriodTimes('huaxi')[0]?.startTime).toBe('08:20');
	});

	it('infers campus from course locations', () => {
		expect(
			inferCampusIdFromCourses([
				sampleCourse('花溪校区 至善楼A101'),
				sampleCourse('花溪校区 至善楼A102'),
				sampleCourse('两江校区 弘远楼B0315')
			])
		).toBe('huaxi');

		expect(inferCampusIdFromCourses([sampleCourse('花溪 A101')])).toBe('huaxi');

		expect(
			inferCampusIdFromCourses([
				sampleCourse('两江校区 弘远楼A0409'),
				sampleCourse('两江校区 弘远楼D0429')
			])
		).toBe('liangjiang');

		expect(inferCampusIdFromCourses([sampleCourse('B201')])).toBe('liangjiang');
	});

	it('resolves campus id from api name or campus id string', () => {
		expect(resolveCampusIdFromApiName('花溪校区')).toBe('huaxi');
		expect(resolveCampusIdFromApiName('两江校区')).toBe('liangjiang');
		expect(resolveCampusIdFromApiName('huaxi')).toBe('huaxi');
		expect(resolveCampusIdFromApiName('liangjiang')).toBe('liangjiang');
		expect(resolveCampusIdFromApiName('invalid')).toBe('liangjiang');
	});

	it('maps campus ids to share indices and back', () => {
		expect(campusIdToShareIndex('liangjiang')).toBe(0);
		expect(campusIdToShareIndex('huaxi')).toBe(1);
		expect(shareIndexToCampusId(0)).toBe('liangjiang');
		expect(shareIndexToCampusId(1)).toBe('huaxi');
		expect(shareIndexToCampusId(99)).toBe('liangjiang');
	});

	it('resolves share campus with explicit id taking priority', () => {
		const courses = [sampleCourse('两江校区 弘远楼A0409')];
		expect(resolveShareCampusId('huaxi', courses)).toBe('huaxi');
		expect(resolveShareCampusId(undefined, courses)).toBe('liangjiang');
		expect(resolveShareCampusId(null, [sampleCourse('B201')])).toBe('liangjiang');
	});
});
