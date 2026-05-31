package com.chronos.mobile.domain

import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.result.AppResult

interface EducationalTimetableHtmlParser {
    fun parse(content: String): AppResult<Timetable?>
    fun parse(contentBytes: ByteArray): AppResult<Timetable?>
}
