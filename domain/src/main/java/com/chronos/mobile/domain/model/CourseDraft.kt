package com.chronos.mobile.domain.model

import androidx.compose.runtime.Immutable

@Immutable
data class CourseDraft(
    val id: String? = null,
    val name: String = "",
    val teacher: String = "",
    val location: String = "",
    val dayOfWeek: Int = 1,
    val startPeriod: Int = 1,
    val endPeriod: Int = 2,
    val color: String = "#EADDFF",
    val textColor: String = "#21005D",
    val weeks: List<Int> = emptyList(),
    val remark: String = "",
)
