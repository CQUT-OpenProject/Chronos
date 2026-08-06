import { describe, expect, it } from 'vite-plus/test';
import type { OnlineScheduleEvent, OnlineSchedulePayload } from '$lib/models/online-schedule';
import { mergeWeekPayloads, resolveWeeksToFetch } from './cqut-week-merge';

function basePayload(
	weekNum: string,
	weekList: string[] = ['1', '2', '3'],
	weekDayList: OnlineSchedulePayload['weekDayList'] = [],
	eventList: OnlineScheduleEvent[] = []
): OnlineSchedulePayload {
	return {
		yearTerm: '2025-2026-2',
		weekNum,
		nowMonth: '3',
		importSource: '',
		termStartDate: null,
		yearTermList: ['2025-2026-2'],
		weekList,
		weekDayList,
		eventList
	};
}

function courseEvent(overrides: Partial<OnlineScheduleEvent>): OnlineScheduleEvent {
	return {
		weekNum: '3',
		weekDay: '1',
		weekList: ['2', '3', '4'],
		weekCover: '',
		sessionList: ['1', '2'],
		sessionStart: '1',
		sessionLast: '2',
		eventName: '课程',
		address: '弘远楼B0216',
		memberName: '陈凯',
		remark: '',
		duplicateGroupType: '0',
		duplicateGroup: 0,
		eventType: '1',
		eventID: '',
		...overrides
	};
}

describe('resolveWeeksToFetch', () => {
	it('defaults to full term weeks', () => {
		const payload = basePayload('3', ['1', '2', '3', '4']);
		expect(resolveWeeksToFetch(payload, null)).toEqual(['1', '2', '3', '4']);
	});
});

describe('mergeWeekPayloads', () => {
	it('preserves base metadata and deduplicates merged events', () => {
		const currentWeek = basePayload(
			'3',
			['1', '2', '3', '4'],
			[
				{ weekDay: '一', weekDate: '03/16', today: false },
				{ weekDay: '二', weekDate: '03/17', today: false }
			],
			[
				courseEvent({
					weekNum: '3',
					weekDay: '1',
					weekList: ['2', '3', '4'],
					sessionStart: '1',
					sessionList: ['1', '2'],
					sessionLast: '2',
					eventName: '马克思主义基本原理',
					address: '弘远楼B0216',
					memberName: '陈凯'
				})
			]
		);
		const secondWeek = basePayload(
			'2',
			['1', '2', '3', '4'],
			[],
			[
				courseEvent({
					weekNum: '2',
					weekDay: '1',
					weekList: ['2', '3', '4'],
					sessionStart: '1',
					sessionList: ['1', '2'],
					sessionLast: '2',
					eventName: '马克思主义基本原理',
					address: '弘远楼B0216',
					memberName: '陈凯'
				}),
				courseEvent({
					weekNum: '2',
					weekDay: '1',
					weekList: ['2'],
					sessionStart: '3',
					sessionList: ['3', '4'],
					sessionLast: '2',
					eventName: '嵌入式系统及应用',
					address: '弘远楼A0204',
					memberName: '刘政'
				})
			]
		);
		const fifthWeek = basePayload(
			'5',
			['1', '2', '3', '4'],
			[],
			[
				courseEvent({
					weekNum: '5',
					weekDay: '1',
					weekList: ['5', '6', '7'],
					sessionStart: '1',
					sessionList: ['1', '2'],
					sessionLast: '2',
					eventName: '概率论与数理统计[理工]',
					address: '弘远楼B0316',
					memberName: '刘仁彬'
				})
			]
		);

		const merged = mergeWeekPayloads(currentWeek, [currentWeek, secondWeek, fifthWeek]);

		expect(merged.weekNum).toBe('3');
		expect(merged.weekDayList.map((day) => day.weekDay)).toEqual(['一', '二']);
		expect(merged.eventList).toHaveLength(3);
		expect(merged.eventList.map((event) => event.eventName)).toEqual([
			'马克思主义基本原理',
			'嵌入式系统及应用',
			'概率论与数理统计[理工]'
		]);
	});

	it('ignores backend duplicate group markers for same class', () => {
		const base = basePayload(
			'17',
			['1', '2', '3'],
			[],
			[
				courseEvent({
					weekNum: '17',
					weekDay: '2',
					weekList: ['17', '18'],
					sessionStart: '1',
					sessionList: ['1', '2'],
					sessionLast: '2',
					eventName: '大学体育[4]网球',
					address: '两江操场14',
					memberName: '乔凯',
					duplicateGroupType: '1',
					duplicateGroup: 1
				})
			]
		);
		const nextWeek = basePayload(
			'18',
			['1', '2', '3'],
			[],
			[
				courseEvent({
					weekNum: '18',
					weekDay: '2',
					weekList: ['17', '18'],
					sessionStart: '1',
					sessionList: ['1', '2'],
					sessionLast: '2',
					eventName: '大学体育[4]网球',
					address: '两江操场14',
					memberName: '乔凯',
					duplicateGroupType: '0',
					duplicateGroup: 0
				})
			]
		);

		const merged = mergeWeekPayloads(base, [base, nextWeek]);

		expect(merged.eventList).toHaveLength(1);
	});
});
