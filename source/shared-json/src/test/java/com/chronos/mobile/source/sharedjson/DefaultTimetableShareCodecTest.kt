package com.chronos.mobile.source.sharedjson

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableImportSource
import com.chronos.mobile.core.model.TimetableViewPrefs
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.result.AppResult
import java.time.LocalDate
import java.time.LocalTime
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class DefaultTimetableShareCodecTest {
    private val codec = DefaultTimetableShareCodec(
        academicCalendarService = AcademicCalendarService(),
        timeProvider = FixedTimeProvider,
    )

    @Test
    fun `encode and decode preserve key timetable semantics`() {
        val timetable = sampleTimetable(importSource = TimetableImportSource.SHARED_JSON)

        val encoded = codec.encode(timetable)
        val payload = (codec.decode((encoded as AppResult.Success).value) as AppResult.Success).value
        val imported = (codec.toTimetable(payload) as AppResult.Success).value

        assertEquals(timetable.name, payload.yearTerm)
        assertEquals(TimetableImportSource.SHARED_JSON.name, payload.importSource)
        assertEquals("2026-03-02", payload.termStartDate)
        assertEquals(TimetableImportSource.SHARED_JSON, imported.importMetadata.source)
        assertEquals("2026-03-02", imported.academicConfig.termStartDate)
        assertEquals(true, imported.viewPrefs.showSaturday)
        assertEquals("带教材第 3 版", imported.courses.single().remark)
    }

    @Test
    fun `online import export omits term start date`() {
        val timetable = sampleTimetable(importSource = TimetableImportSource.ONLINE_EDU)
        val payload = (codec.decode((codec.encode(timetable) as AppResult.Success).value) as AppResult.Success).value

        assertEquals(TimetableImportSource.ONLINE_EDU.name, payload.importSource)
        assertEquals(null, payload.termStartDate)
    }

    @Test
    fun `decode rejects payload without courses`() {
        val result = codec.toTimetable(com.chronos.mobile.core.model.OnlineSchedulePayload())
        assertTrue(result is AppResult.Failure)
    }

    private fun sampleTimetable(importSource: TimetableImportSource): Timetable = Timetable(
        id = "t1",
        name = "2025-2026学年第2学期",
        courses = listOf(
            Course(
                id = "c1",
                name = "编译原理",
                teacher = "张老师",
                location = "B201",
                dayOfWeek = 6,
                startPeriod = 1,
                endPeriod = 2,
                color = "#EADDFF",
                weeks = listOf(1, 2, 3),
                remark = "带教材第 3 版",
            ),
        ),
        createdAt = 1L,
        updatedAt = 1L,
        academicConfig = AcademicConfig(
            termStartDate = "2026-03-02",
            startWeek = 1,
            endWeek = 20,
        ),
        importMetadata = TimetableImportMetadata(source = importSource),
        viewPrefs = TimetableViewPrefs(showSaturday = true, showSunday = false),
    )
}

private object FixedTimeProvider : TimeProvider {
    override fun today(): LocalDate = LocalDate.parse("2026-03-18")
    override fun currentTime(): LocalTime = LocalTime.parse("09:00")
    override fun currentTimeMillis(): Long = 100L
}
