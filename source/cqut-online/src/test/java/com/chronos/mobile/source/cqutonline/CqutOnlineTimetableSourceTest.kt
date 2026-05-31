package com.chronos.mobile.source.cqutonline

import com.chronos.mobile.core.model.OnlineScheduleEvent
import com.chronos.mobile.core.model.OnlineSchedulePayload
import com.chronos.mobile.core.model.OnlineScheduleWeekDay
import org.junit.Assert.assertEquals
import org.junit.Test

class CqutOnlineTimetableSourceTest {
    @Test
    fun `resolveWeeksToFetch defaults to full term weeks`() {
        val payload = basePayload(
            weekNum = "3",
            weekList = listOf("1", "2", "3", "4"),
        )

        val result = resolveWeeksToFetch(payload, requestedWeekNum = null)

        assertEquals(listOf("1", "2", "3", "4"), result)
    }

    @Test
    fun `mergeWeekPayloads preserves base metadata and deduplicates merged events`() {
        val currentWeek = basePayload(
            weekNum = "3",
            weekDayList = listOf(
                OnlineScheduleWeekDay(weekDay = "一", weekDate = "03/16", today = false),
                OnlineScheduleWeekDay(weekDay = "二", weekDate = "03/17", today = false),
            ),
            eventList = listOf(
                courseEvent(
                    weekNum = "3",
                    weekDay = "1",
                    weekList = listOf("2", "3", "4"),
                    sessionStart = "1",
                    sessionList = listOf("1", "2"),
                    sessionLast = "2",
                    eventName = "马克思主义基本原理",
                    address = "弘远楼B0216",
                    memberName = "陈凯",
                ),
            ),
        )
        val secondWeek = basePayload(
            weekNum = "2",
            eventList = listOf(
                courseEvent(
                    weekNum = "2",
                    weekDay = "1",
                    weekList = listOf("2", "3", "4"),
                    sessionStart = "1",
                    sessionList = listOf("1", "2"),
                    sessionLast = "2",
                    eventName = "马克思主义基本原理",
                    address = "弘远楼B0216",
                    memberName = "陈凯",
                ),
                courseEvent(
                    weekNum = "2",
                    weekDay = "1",
                    weekList = listOf("2"),
                    sessionStart = "3",
                    sessionList = listOf("3", "4"),
                    sessionLast = "2",
                    eventName = "嵌入式系统及应用",
                    address = "弘远楼A0204",
                    memberName = "刘政",
                ),
            ),
        )
        val fifthWeek = basePayload(
            weekNum = "5",
            eventList = listOf(
                courseEvent(
                    weekNum = "5",
                    weekDay = "1",
                    weekList = listOf("5", "6", "7"),
                    sessionStart = "1",
                    sessionList = listOf("1", "2"),
                    sessionLast = "2",
                    eventName = "概率论与数理统计[理工]",
                    address = "弘远楼B0316",
                    memberName = "刘仁彬",
                ),
            ),
        )

        val merged = mergeWeekPayloads(currentWeek, listOf(currentWeek, secondWeek, fifthWeek))

        assertEquals("3", merged.weekNum)
        assertEquals(listOf("一", "二"), merged.weekDayList.map(OnlineScheduleWeekDay::weekDay))
        assertEquals(3, merged.eventList.size)
        assertEquals(
            listOf("马克思主义基本原理", "嵌入式系统及应用", "概率论与数理统计[理工]"),
            merged.eventList.map(OnlineScheduleEvent::eventName),
        )
    }

    @Test
    fun `mergeWeekPayloads ignores backend duplicate group markers for same class`() {
        val base = basePayload(
            weekNum = "17",
            eventList = listOf(
                courseEvent(
                    weekNum = "17",
                    weekDay = "2",
                    weekList = listOf("17", "18"),
                    sessionStart = "1",
                    sessionList = listOf("1", "2"),
                    sessionLast = "2",
                    eventName = "大学体育[4]网球",
                    address = "两江操场14",
                    memberName = "乔凯",
                    duplicateGroupType = "1",
                    duplicateGroup = 1,
                ),
            ),
        )
        val nextWeek = basePayload(
            weekNum = "18",
            eventList = listOf(
                courseEvent(
                    weekNum = "18",
                    weekDay = "2",
                    weekList = listOf("17", "18"),
                    sessionStart = "1",
                    sessionList = listOf("1", "2"),
                    sessionLast = "2",
                    eventName = "大学体育[4]网球",
                    address = "两江操场14",
                    memberName = "乔凯",
                    duplicateGroupType = "0",
                    duplicateGroup = 0,
                ),
            ),
        )

        val merged = mergeWeekPayloads(base, listOf(base, nextWeek))

        assertEquals(1, merged.eventList.size)
    }

    private fun basePayload(
        weekNum: String,
        weekList: List<String> = listOf("1", "2", "3"),
        weekDayList: List<OnlineScheduleWeekDay> = emptyList(),
        eventList: List<OnlineScheduleEvent> = emptyList(),
    ): OnlineSchedulePayload = OnlineSchedulePayload(
        yearTerm = "2025-2026-2",
        weekNum = weekNum,
        nowMonth = "3",
        yearTermList = listOf("2025-2026-2"),
        weekList = weekList,
        weekDayList = weekDayList,
        eventList = eventList,
    )

    private fun courseEvent(
        weekNum: String,
        weekDay: String,
        weekList: List<String>,
        sessionStart: String,
        sessionList: List<String>,
        sessionLast: String,
        eventName: String,
        address: String,
        memberName: String,
        duplicateGroupType: String = "0",
        duplicateGroup: Int = 0,
    ): OnlineScheduleEvent = OnlineScheduleEvent(
        weekNum = weekNum,
        weekDay = weekDay,
        weekList = weekList,
        weekCover = "",
        sessionList = sessionList,
        sessionStart = sessionStart,
        sessionLast = sessionLast,
        eventName = eventName,
        address = address,
        memberName = memberName,
        duplicateGroupType = duplicateGroupType,
        duplicateGroup = duplicateGroup,
        eventType = "1",
        eventID = "",
    )
}
