package com.chronos.mobile.source.eduhtml

import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.result.AppResult
import java.time.LocalDate
import java.time.LocalTime
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class EducationalTimetableHtmlParserImplTest {
    private val parser = EducationalTimetableHtmlParserImpl(
        academicCalendarService = AcademicCalendarService(),
        timeProvider = FixedTimeProvider,
    )

    @Test
    fun `parse extracts timetable and view prefs from educational html`() {
        val result = parser.parse(
            """
            <table id="kbgrid_table_0">
              <tbody>
                <tr>
                  <td colspan="9">
                    <div class="timetable_title">
                      <h6 class="pull-left">2025-2026学年第2学期</h6>
                      陈炜堂的课表
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="td_wrap" id="6-1" rowspan="2">
                    <div class="timetable_con">
                      <div class="title">编译原理</div>
                      <p><span title="教师">教师</span> 张老师</p>
                      <p><span title="上课地点">地点</span> B201</p>
                      <p><span title="节/周">节/周</span> 1-16周</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            """.trimIndent(),
        )

        val timetable = (result as AppResult.Success).value
        assertEquals("陈炜堂的课表", timetable?.name)
        assertEquals("2026-03-02", timetable?.academicConfig?.termStartDate)
        assertEquals(true, timetable?.viewPrefs?.showSaturday)
        assertEquals(false, timetable?.viewPrefs?.showSunday)
        assertEquals("编译原理", timetable?.courses?.first()?.name)
    }

    @Test
    fun `parse returns null when no educational timetable table exists`() {
        val result = parser.parse("<html></html>")
        assertTrue(result is AppResult.Success)
        assertEquals(null, (result as AppResult.Success).value)
    }
}

private object FixedTimeProvider : TimeProvider {
    override fun today(): LocalDate = LocalDate.parse("2026-03-04")
    override fun currentTime(): LocalTime = LocalTime.parse("09:00")
    override fun currentTimeMillis(): Long = 100L
}
