package com.chronos.mobile.core.model

import androidx.compose.runtime.Immutable

@Immutable
data class TimetableSummary(
    val id: String,
    val name: String,
    val courseCount: Int,
    val createdAt: Long,
    val updatedAt: Long,
)

@Immutable
data class AppState(
    val timetables: List<TimetableSummary> = emptyList(),
    val currentTimetableId: String? = null,
    val wallpaperUri: String? = null,
    val currentTimetable: Timetable? = null,
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val useDynamicColor: Boolean = false,
)
