package com.chronos.mobile.feature.timetable

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.model.CourseDraft
import com.chronos.mobile.domain.model.TimetableCourseDisplayModel
import com.chronos.mobile.domain.model.TimetableGridModel
import com.chronos.mobile.domain.model.TimetableSettingsDraft
import com.chronos.mobile.domain.usecase.BuildTimetableCourseDisplayModelsUseCase
import com.chronos.mobile.domain.usecase.BuildVisibleTimetableGridUseCase
import com.chronos.mobile.domain.usecase.CalculateAcademicWeekUseCase
import com.chronos.mobile.domain.usecase.CreateTimetableUseCase
import com.chronos.mobile.domain.usecase.DeleteCourseUseCase
import com.chronos.mobile.domain.usecase.DeleteTimetableUseCase
import com.chronos.mobile.domain.usecase.ObserveAppStateUseCase
import com.chronos.mobile.domain.usecase.SaveCourseUseCase
import com.chronos.mobile.domain.usecase.SaveTimetableDetailsUseCase
import com.chronos.mobile.domain.usecase.SwitchTimetableUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.Duration
import java.time.LocalDate
import java.time.ZonedDateTime
import javax.inject.Inject
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

private const val MIN_DELAY_MILLIS = 1_000L
private const val WEEK_GRID_CACHE_RADIUS = 1

@Immutable
data class TimetableUiState(
    val appState: AppState = AppState(),
    val hasLoadedAppState: Boolean = false,
    val today: LocalDate = LocalDate.now(),
    val academicWeek: Int = 1,
    val displayedWeek: Int = 1,
    val displayedWeekTimetableId: String? = null,
    val gridModel: TimetableGridModel? = null,
    val weekGridModels: Map<Int, TimetableGridModel> = emptyMap(),
    val weekCourseDisplayModels: Map<Int, List<TimetableCourseDisplayModel>> = emptyMap(),
    val editingCourse: CourseDraft? = null,
    val detailCourse: Course? = null,
)

@HiltViewModel
class TimetableViewModel @Inject constructor(
    observeAppState: ObserveAppStateUseCase,
    private val createTimetableUseCase: CreateTimetableUseCase,
    private val switchTimetableUseCase: SwitchTimetableUseCase,
    private val deleteTimetableUseCase: DeleteTimetableUseCase,
    private val saveTimetableDetailsUseCase: SaveTimetableDetailsUseCase,
    private val saveCourseUseCase: SaveCourseUseCase,
    private val deleteCourseUseCase: DeleteCourseUseCase,
    private val calculateAcademicWeek: CalculateAcademicWeekUseCase,
    private val buildVisibleTimetableGrid: BuildVisibleTimetableGridUseCase,
    private val buildTimetableCourseDisplayModels: BuildTimetableCourseDisplayModelsUseCase,
    private val timeProvider: TimeProvider,
) : ViewModel() {
    private val uiState = MutableStateFlow(TimetableUiState())

    val state: StateFlow<TimetableUiState> = combine(
        observeAppState(),
        uiState,
        observeToday(),
    ) { appState, currentState, today ->
        val timetable = appState.currentTimetable
        val academicWeek = calculateAcademicWeek(today, timetable?.academicConfig)
        val displayedWeek = resolveDisplayedWeek(
            timetable = timetable,
            displayedWeek = currentState.displayedWeek,
            displayedWeekTimetableId = currentState.displayedWeekTimetableId,
            academicWeek = academicWeek,
        )
        val weekGridModels = buildWeekGridModels(
            timetable = timetable,
            today = today,
            displayedWeek = displayedWeek,
            existingWeekGridModels = currentState.weekGridModels.takeIf {
                timetable != null &&
                    timetable == currentState.appState.currentTimetable &&
                    currentState.today == today
            }.orEmpty(),
            buildGrid = buildVisibleTimetableGrid::invoke,
        )
        val weekCourseDisplayModels = buildWeekCourseDisplayModels(
            timetable = timetable,
            today = today,
            displayedWeek = displayedWeek,
            weekGridModels = weekGridModels,
            existingWeekCourseDisplayModels = currentState.weekCourseDisplayModels.takeIf {
                timetable != null &&
                    timetable == currentState.appState.currentTimetable &&
                    currentState.today == today
            }.orEmpty(),
            buildDisplayModels = buildTimetableCourseDisplayModels::invoke,
        )

        currentState.copy(
            appState = appState,
            hasLoadedAppState = true,
            today = today,
            academicWeek = academicWeek,
            displayedWeek = displayedWeek,
            displayedWeekTimetableId = timetable?.id,
            gridModel = weekGridModels[displayedWeek],
            weekGridModels = weekGridModels,
            weekCourseDisplayModels = weekCourseDisplayModels,
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = TimetableUiState(),
    )

    fun createTimetable(name: String) {
        viewModelScope.launch {
            createTimetableUseCase(name)
        }
    }

    fun switchTimetable(id: String) {
        viewModelScope.launch {
            switchTimetableUseCase(id)
        }
    }

    fun deleteTimetable(id: String) {
        viewModelScope.launch {
            deleteTimetableUseCase(id)
        }
    }

    fun setDisplayedWeek(week: Int) {
        val timetable = state.value.appState.currentTimetable ?: return
        uiState.update {
            it.copy(
                displayedWeek = week.coerceIn(timetable.academicConfig.startWeek, timetable.academicConfig.endWeek),
                displayedWeekTimetableId = timetable.id,
            )
        }
    }

    fun jumpToCurrentWeek() {
        val timetable = state.value.appState.currentTimetable ?: return
        uiState.update {
            it.copy(
                displayedWeek = state.value.academicWeek.coerceIn(
                    timetable.academicConfig.startWeek,
                    timetable.academicConfig.endWeek,
                ),
                displayedWeekTimetableId = timetable.id,
            )
        }
    }

    fun saveTimetableDetails(
        editor: TimetableSettingsDraft,
        onSaved: () -> Unit = {},
    ) {
        val timetableId = state.value.appState.currentTimetable?.id ?: return
        viewModelScope.launch {
            saveTimetableDetailsUseCase(timetableId, editor)
            onSaved()
        }
    }

    fun requestEditCourse(course: Course) {
        uiState.update { it.copy(editingCourse = course.toDraft()) }
    }

    fun dismissCourseEditor() {
        uiState.update { it.copy(editingCourse = null) }
    }

    fun requestCourseDetail(course: Course) {
        uiState.update { it.copy(detailCourse = course) }
    }

    fun dismissCourseDetail() {
        uiState.update { it.copy(detailCourse = null) }
    }

    fun saveCourse(editor: CourseDraft) {
        val timetableId = state.value.appState.currentTimetable?.id ?: return
        viewModelScope.launch {
            saveCourseUseCase(timetableId, editor)
            dismissCourseEditor()
        }
    }

    fun deleteCourse(courseId: String) {
        viewModelScope.launch {
            deleteCourseUseCase(courseId)
            dismissCourseEditor()
        }
    }

    private fun observeToday(): Flow<LocalDate> = flow {
        var emittedDate: LocalDate? = null
        while (currentCoroutineContext().isActive) {
            val now = ZonedDateTime.now()
            val today = timeProvider.today()
            if (today != emittedDate) {
                emit(today)
                emittedDate = today
            }
            delay(computeDelayUntilNextMidnightMillis(now))
        }
    }.distinctUntilChanged()
}

internal fun computeDelayUntilNextMidnightMillis(
    now: ZonedDateTime,
    minimumDelayMillis: Long = MIN_DELAY_MILLIS,
): Long {
    val nextMidnight = now.toLocalDate()
        .plusDays(1)
        .atStartOfDay(now.zone)
    val delayMillis = Duration.between(now, nextMidnight).toMillis()
    return delayMillis.coerceAtLeast(minimumDelayMillis)
}

internal fun resolveDisplayedWeek(
    timetable: Timetable?,
    displayedWeek: Int,
    displayedWeekTimetableId: String?,
    academicWeek: Int,
): Int = when {
    timetable == null -> 1
    displayedWeekTimetableId != timetable.id -> academicWeek
    else -> displayedWeek.coerceIn(timetable.academicConfig.startWeek, timetable.academicConfig.endWeek)
}

internal fun buildWeekGridModels(
    timetable: Timetable?,
    today: LocalDate,
    displayedWeek: Int,
    existingWeekGridModels: Map<Int, TimetableGridModel>,
    buildGrid: (LocalDate, Int, Timetable) -> TimetableGridModel,
): Map<Int, TimetableGridModel> {
    timetable ?: return emptyMap()

    val weekRange = timetable.academicConfig.startWeek..timetable.academicConfig.endWeek
    val requiredWeeks = ((displayedWeek - WEEK_GRID_CACHE_RADIUS)..(displayedWeek + WEEK_GRID_CACHE_RADIUS))
        .filter { it in weekRange }

    return requiredWeeks.associateWith { week ->
        existingWeekGridModels[week] ?: buildGrid(today, week, timetable)
    }
}

internal fun buildWeekCourseDisplayModels(
    timetable: Timetable?,
    today: LocalDate,
    displayedWeek: Int,
    weekGridModels: Map<Int, TimetableGridModel>,
    existingWeekCourseDisplayModels: Map<Int, List<TimetableCourseDisplayModel>>,
    buildDisplayModels: (Timetable, Set<Int>, Int, LocalDate) -> List<TimetableCourseDisplayModel>,
): Map<Int, List<TimetableCourseDisplayModel>> {
    timetable ?: return emptyMap()

    val weekRange = timetable.academicConfig.startWeek..timetable.academicConfig.endWeek
    val requiredWeeks = ((displayedWeek - WEEK_GRID_CACHE_RADIUS)..(displayedWeek + WEEK_GRID_CACHE_RADIUS))
        .filter { it in weekRange }

    return requiredWeeks.associateWith { week ->
        existingWeekCourseDisplayModels[week] ?: buildDisplayModels(
            timetable,
            weekGridModels[week]
                ?.visibleDays
                ?.map { it.dayOfWeek }
                ?.toSet()
                .orEmpty(),
            week,
            today,
        )
    }.mapValues { (_, models) ->
        models.toList()
    }
}
