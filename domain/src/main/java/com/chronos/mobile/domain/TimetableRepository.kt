package com.chronos.mobile.domain

import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.ThemeMode
import kotlinx.coroutines.flow.Flow

interface TimetableRepository {
    val appState: Flow<AppState>

    suspend fun getAppStateSnapshot(): AppState
    suspend fun getTimetable(id: String): Timetable?
    suspend fun saveTimetable(timetable: Timetable)
    suspend fun saveCourse(timetableId: String, course: Course)
    suspend fun deleteCourse(courseId: String)
    suspend fun deleteTimetable(id: String)
    suspend fun setCurrentTimetableId(id: String?)
    suspend fun setWallpaper(uri: String?)
    suspend fun setThemeMode(mode: ThemeMode)
    suspend fun setUseDynamicColor(enabled: Boolean)
}
