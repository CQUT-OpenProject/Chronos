package com.chronos.mobile.data.repository

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.PeriodTime
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableImportSource
import com.chronos.mobile.core.model.TimetableViewPrefs
import org.junit.Assert.assertEquals
import org.junit.Test

class TimetableConfigJsonCodecTest {
    private val codec = TimetableConfigJsonCodec()

    @Test
    fun `decode reads current config shape`() {
        val academicConfig = AcademicConfig(
            termStartDate = "2026-02-23",
            startWeek = 2,
            endWeek = 18,
            periodTimes = listOf(
                PeriodTime(index = 1, startTime = "08:00", endTime = "08:45"),
            ),
        )
        val importMetadata = TimetableImportMetadata(source = TimetableImportSource.FILE_HTML)
        val viewPrefs = TimetableViewPrefs(
            showSaturday = false,
            showSunday = true,
            showNonCurrentWeekCourses = true,
        )

        val encoded = codec.encode(
            academicConfig = academicConfig,
            importMetadata = importMetadata,
            viewPrefs = viewPrefs,
        )
        val decoded = codec.decode(encoded)

        assertEquals(academicConfig, decoded.academicConfig)
        assertEquals(importMetadata, decoded.importMetadata)
        assertEquals(viewPrefs, decoded.viewPrefs)
        assertEquals(2, decoded.schemaVersion)
    }
}
