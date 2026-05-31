package com.chronos.mobile.feature.timetable

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.PeriodTime
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableImportSource
import com.chronos.mobile.core.model.TimetableViewPrefs
import com.chronos.mobile.core.timetableui.computeDelayUntilNextCurrentTimeRefreshMillis
import com.chronos.mobile.core.timetableui.findCurrentPeriodIndex
import com.chronos.mobile.core.timetableui.parsePeriodRanges
import com.chronos.mobile.domain.model.TimetableCourseDisplayModel
import com.chronos.mobile.domain.model.TimetableDayModel
import com.chronos.mobile.domain.model.TimetableGridModel
import com.chronos.mobile.domain.usecase.BuildTimetableCourseDisplayModelsUseCase
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime

class TimetableScreenLogicTest {
    private val buildCourseDisplayModels = BuildTimetableCourseDisplayModelsUseCase()

    @Test
    fun `calculateWeekSliderSteps returns zero when only one selectable week remains`() {
        assertEquals(0, calculateWeekSliderSteps(startWeek = 1, endWeek = 1))
        assertEquals(0, calculateWeekSliderSteps(startWeek = 4, endWeek = 5))
    }

    @Test
    fun `calculateWeekSliderSteps matches discrete selectable weeks`() {
        assertEquals(18, calculateWeekSliderSteps(startWeek = 1, endWeek = 20))
        assertEquals(3, calculateWeekSliderSteps(startWeek = 8, endWeek = 12))
    }

    @Test
    fun `keeps current displayed week courses and excludes ended courses from non current section`() {
        val models = buildCourseDisplayModels(
            timetable = sampleTimetable(
                courses = listOf(
                    sampleCourse(id = "current", weeks = listOf(8)),
                    sampleCourse(id = "ended", weeks = listOf(1, 2, 3)),
                    sampleCourse(id = "future", weeks = listOf(9), startPeriod = 3, endPeriod = 4),
                ),
            ),
            visibleDayOfWeeks = setOf(1),
            displayedWeek = 8,
            today = LocalDate.parse("2026-04-20"),
        )

        assertEquals(listOf("current", "future"), models.map { it.course.id })
        assertTrue(models.first { it.course.id == "current" }.isInDisplayedWeek)
        assertFalse(models.first { it.course.id == "future" }.isInDisplayedWeek)
    }

    @Test
    fun `disables future placeholders when setting is off`() {
        val models = buildCourseDisplayModels(
            timetable = sampleTimetable(
                showNonCurrentWeekCourses = false,
                courses = listOf(
                    sampleCourse(id = "current", weeks = listOf(8)),
                    sampleCourse(id = "future", weeks = listOf(9)),
                ),
            ),
            visibleDayOfWeeks = setOf(1),
            displayedWeek = 8,
            today = LocalDate.parse("2026-04-20"),
        )

        assertEquals(listOf("current"), models.map { it.course.id })
    }

    @Test
    fun `resolveDisplayedWeek resets to academic week when timetable changes`() {
        val resolvedWeek = resolveDisplayedWeek(
            timetable = sampleTimetable(courses = emptyList()),
            displayedWeek = 12,
            displayedWeekTimetableId = "another-timetable",
            academicWeek = 6,
        )

        assertEquals(6, resolvedWeek)
    }

    @Test
    fun `buildWeekGridModels keeps only displayed week and adjacent pages`() {
        val requestedWeeks = mutableListOf<Int>()
        val existingWeekSix = sampleGridModel(label = "existing-6")

        val weekGridModels = buildWeekGridModels(
            timetable = sampleTimetable(courses = emptyList()),
            today = LocalDate.parse("2026-04-20"),
            displayedWeek = 7,
            existingWeekGridModels = mapOf(6 to existingWeekSix, 2 to sampleGridModel(label = "stale-2")),
        ) { _, week, _ ->
            requestedWeeks += week
            sampleGridModel(label = "generated-$week")
        }

        assertEquals(listOf(6, 7, 8), weekGridModels.keys.toList())
        assertEquals(existingWeekSix, weekGridModels[6])
        assertEquals(listOf(7, 8), requestedWeeks)
    }

    @Test
    fun `findCurrentPeriodIndex prefers active period then next upcoming then last`() {
        val periods = parsePeriodRanges(
            listOf(
                PeriodTime(index = 1, startTime = "08:00", endTime = "08:45"),
                PeriodTime(index = 2, startTime = "09:00", endTime = "09:45"),
                PeriodTime(index = 3, startTime = "10:00", endTime = "10:45"),
            ),
        )

        assertEquals(2, findCurrentPeriodIndex(periods, LocalTime.parse("09:15")))
        assertEquals(3, findCurrentPeriodIndex(periods, LocalTime.parse("09:50")))
        assertEquals(3, findCurrentPeriodIndex(periods, LocalTime.parse("11:10")))
    }

    @Test
    fun `current time refresh delay waits for current period end`() {
        val periods = parsePeriodRanges(
            listOf(
                PeriodTime(index = 1, startTime = "09:00", endTime = "09:45"),
                PeriodTime(index = 2, startTime = "10:00", endTime = "10:45"),
            ),
        )
        val now = LocalDateTime.parse("2026-03-21T09:15:00")

        assertEquals(30L * 60L * 1_000L, computeDelayUntilNextCurrentTimeRefreshMillis(now, periods))
    }

    @Test
    fun `midnight delay waits until next local midnight`() {
        val now = ZonedDateTime.of(2026, 3, 21, 10, 15, 0, 0, ZoneId.of("Asia/Shanghai"))
        assertEquals((13L * 60L + 45L) * 60L * 1_000L, computeDelayUntilNextMidnightMillis(now))
    }

    @Test
    fun `settings visibility depends on import source`() {
        assertFalse(shouldShowNonCurrentWeekCourseSetting(TimetableImportSource.ONLINE_EDU))
        assertTrue(shouldShowTermStartDateSetting(TimetableImportSource.FILE_HTML))
        assertTrue(shouldShowAcademicWeekRangeSettings(TimetableImportSource.SHARED_JSON))
    }

    @Test
    fun `toSettingsDraft normalizes non monday term start date`() {
        val draft = sampleTimetable(termStartDate = "2026-03-03", courses = emptyList()).toSettingsDraft()
        assertEquals("2026-03-02", draft.academicConfig.termStartDate)
    }

    private fun sampleTimetable(
        showNonCurrentWeekCourses: Boolean = true,
        termStartDate: String = "2026-03-02",
        courses: List<Course>,
    ): Timetable = Timetable(
        id = "timetable",
        name = "课表",
        courses = courses,
        createdAt = 0L,
        updatedAt = 0L,
        academicConfig = AcademicConfig(
            termStartDate = termStartDate,
            startWeek = 1,
            endWeek = 20,
        ),
        importMetadata = TimetableImportMetadata(source = TimetableImportSource.UNKNOWN),
        viewPrefs = TimetableViewPrefs(
            showSaturday = true,
            showSunday = true,
            showNonCurrentWeekCourses = showNonCurrentWeekCourses,
        ),
    )

    private fun sampleCourse(
        id: String,
        weeks: List<Int>,
        startPeriod: Int = 1,
        endPeriod: Int = 2,
    ): Course = Course(
        id = id,
        name = id,
        teacher = "老师",
        location = "A101",
        dayOfWeek = 1,
        startPeriod = startPeriod,
        endPeriod = endPeriod,
        color = "#EADDFF",
        textColor = "#21005D",
        weeks = weeks,
    )

    private fun sampleGridModel(label: String): TimetableGridModel =
        TimetableGridModel(
            monthLabel = label,
            visibleDays = listOf(
                TimetableDayModel(dayOfWeek = 1, date = LocalDate.parse("2026-04-20"), isToday = false),
            ),
            periods = listOf(PeriodTime(index = 1, startTime = "08:00", endTime = "08:45")),
            displayedPeriodCount = 1,
        )
}
