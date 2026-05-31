package com.chronos.mobile.domain.model

import androidx.compose.runtime.Immutable
import com.chronos.mobile.core.model.TimetableImportSource

@Immutable
data class PeriodTimeDraft(
    val index: Int,
    val startTime: String,
    val endTime: String,
)

@Immutable
data class AcademicConfigDraft(
    val termStartDate: String = "",
    val startWeek: Int = 1,
    val endWeek: Int = 20,
    val periodTimes: List<PeriodTimeDraft> = emptyList(),
)

@Immutable
data class TimetableImportMetadataDraft(
    val source: TimetableImportSource = TimetableImportSource.UNKNOWN,
)

@Immutable
data class TimetableViewPrefsDraft(
    val showSaturday: Boolean = true,
    val showSunday: Boolean = true,
    val showNonCurrentWeekCourses: Boolean = false,
)

@Immutable
data class TimetableSettingsDraft(
    val name: String = "",
    val academicConfig: AcademicConfigDraft = AcademicConfigDraft(),
    val importMetadata: TimetableImportMetadataDraft = TimetableImportMetadataDraft(),
    val viewPrefs: TimetableViewPrefsDraft = TimetableViewPrefsDraft(),
)
