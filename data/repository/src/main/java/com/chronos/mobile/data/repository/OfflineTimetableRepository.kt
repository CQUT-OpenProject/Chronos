package com.chronos.mobile.data.repository

import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.ThemeMode
import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf

@Singleton
@OptIn(ExperimentalCoroutinesApi::class)
class OfflineTimetableRepository @Inject constructor(
    private val timetableLocalDataSource: TimetableLocalDataSource,
    private val preferenceDataSource: PreferenceDataSource,
    private val appStateAssembler: AppStateAssembler,
) : TimetableRepository {
    private val preferencesFlow = preferenceDataSource.preferences
    private val timetableSummariesFlow = timetableLocalDataSource.observeTimetableSummaries()
    private val resolvedCurrentTimetableIdFlow = combine(
        timetableSummariesFlow,
        preferencesFlow,
    ) { timetables, preferences ->
        appStateAssembler.resolveCurrentTimetableId(timetables, preferences)
    }.distinctUntilChanged()
    private val currentTimetableFlow = resolvedCurrentTimetableIdFlow
        .flatMapLatest { timetableId ->
            timetableId?.let { id ->
                timetableLocalDataSource.observeTimetable(id)
            } ?: flowOf(null)
        }
        .distinctUntilChanged()

    override val appState: Flow<AppState> = combine(
        timetableSummariesFlow,
        preferencesFlow,
        resolvedCurrentTimetableIdFlow,
        currentTimetableFlow,
    ) { timetables, preferences, resolvedCurrentId, currentTimetable ->
        appStateAssembler.assemble(
            timetables = timetables,
            preferences = preferences,
            currentTimetableId = resolvedCurrentId,
            currentTimetable = currentTimetable,
        )
    }.distinctUntilChanged()

    override suspend fun getAppStateSnapshot(): AppState {
        val timetables = timetableLocalDataSource.getTimetableSummariesSnapshot()
        val preferences = preferenceDataSource.getSnapshot()
        val currentTimetableId = appStateAssembler.resolveCurrentTimetableId(timetables, preferences)
        return appStateAssembler.assemble(
            timetables = timetables,
            preferences = preferences,
            currentTimetableId = currentTimetableId,
            currentTimetable = if (currentTimetableId != null) timetableLocalDataSource.getTimetable(currentTimetableId) else null,
        )
    }

    override suspend fun getTimetable(id: String): Timetable? =
        timetableLocalDataSource.getTimetable(id)

    override suspend fun saveTimetable(timetable: Timetable) {
        timetableLocalDataSource.saveTimetable(timetable)
    }

    override suspend fun saveCourse(timetableId: String, course: Course) {
        timetableLocalDataSource.saveCourse(timetableId, course)
    }

    override suspend fun deleteCourse(courseId: String) {
        timetableLocalDataSource.deleteCourse(courseId)
    }

    override suspend fun deleteTimetable(id: String) {
        timetableLocalDataSource.deleteTimetable(id)
    }

    override suspend fun setCurrentTimetableId(id: String?) {
        preferenceDataSource.setCurrentTimetableId(id)
    }

    override suspend fun setWallpaper(uri: String?) {
        preferenceDataSource.setWallpaper(uri)
    }

    override suspend fun setThemeMode(mode: ThemeMode) {
        preferenceDataSource.setThemeMode(mode)
    }

    override suspend fun setUseDynamicColor(enabled: Boolean) {
        preferenceDataSource.setUseDynamicColor(enabled)
    }
}
