package com.chronos.mobile.feature.root

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.ThemeMode
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.model.TimetableCourseDisplayModel
import com.chronos.mobile.domain.model.TimetableGridModel
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.usecase.BuildTimetableCourseDisplayModelsUseCase
import com.chronos.mobile.domain.usecase.BuildVisibleTimetableGridUseCase
import com.chronos.mobile.domain.usecase.CalculateAcademicWeekUseCase
import com.chronos.mobile.domain.usecase.GetGithubContributorsUseCase
import com.chronos.mobile.domain.usecase.GetGithubReleaseByTagUseCase
import com.chronos.mobile.domain.usecase.ObserveAppStateUseCase
import com.chronos.mobile.domain.usecase.SetDynamicColorEnabledUseCase
import com.chronos.mobile.domain.usecase.SetThemeModeUseCase
import com.chronos.mobile.domain.usecase.SetWallpaperUseCase
import com.chronos.mobile.feature.timetable.TimetableCommand
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class WallpaperPreviewData(
    val academicWeek: Int,
    val gridModel: TimetableGridModel,
    val courseDisplayModels: List<TimetableCourseDisplayModel>,
)

@HiltViewModel
class RootViewModel @Inject constructor(
    observeAppState: ObserveAppStateUseCase,
    private val getGithubContributorsUseCase: GetGithubContributorsUseCase,
    private val getGithubReleaseByTagUseCase: GetGithubReleaseByTagUseCase,
    private val setDynamicColorEnabledUseCase: SetDynamicColorEnabledUseCase,
    private val setThemeModeUseCase: SetThemeModeUseCase,
    private val setWallpaperUseCase: SetWallpaperUseCase,
    private val calculateAcademicWeekUseCase: CalculateAcademicWeekUseCase,
    private val buildVisibleTimetableGridUseCase: BuildVisibleTimetableGridUseCase,
    private val buildTimetableCourseDisplayModelsUseCase: BuildTimetableCourseDisplayModelsUseCase,
    private val timeProvider: TimeProvider,
) : ViewModel() {
    private companion object {
        const val TAG = "AboutContributors"
        const val RELEASE_TAG = "AboutRelease"
    }

    private val uiState = MutableStateFlow(RootUiState())
    private val eventChannel = Channel<TimetableCommand>(capacity = Channel.BUFFERED)

    val appState: StateFlow<AppState> = observeAppState().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = AppState(),
    )

    val timetableCommands = eventChannel.receiveAsFlow()

    val state: StateFlow<RootUiState> = uiState.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = RootUiState(),
    )

    fun jumpToCurrentWeek() {
        eventChannel.trySend(TimetableCommand.JumpToCurrentWeek)
    }

    fun setWallpaper(uri: String?) {
        viewModelScope.launch {
            setWallpaperUseCase(uri)
        }
    }

    fun setThemeMode(mode: ThemeMode) {
        viewModelScope.launch {
            setThemeModeUseCase(mode)
        }
    }

    fun setDynamicColorEnabled(enabled: Boolean) {
        viewModelScope.launch {
            setDynamicColorEnabledUseCase(enabled)
        }
    }

    fun buildWallpaperPreview(timetable: Timetable?): WallpaperPreviewData? {
        timetable ?: return null
        val today = timeProvider.today()
        val academicWeek = calculateAcademicWeekUseCase(today, timetable.academicConfig)
        val gridModel = buildVisibleTimetableGridUseCase(today, academicWeek, timetable)
        val courseDisplayModels = buildTimetableCourseDisplayModelsUseCase(
            timetable = timetable,
            visibleDayOfWeeks = gridModel.visibleDays.map { it.dayOfWeek }.toSet(),
            displayedWeek = academicWeek,
            today = today,
        )
        return WallpaperPreviewData(
            academicWeek = academicWeek,
            gridModel = gridModel,
            courseDisplayModels = courseDisplayModels,
        )
    }

    fun loadAboutContributors(forceRefresh: Boolean = false) {
        val aboutState = uiState.value.aboutUiState
        if (aboutState.isLoading) {
            Log.d(TAG, "Skip loading contributors because a request is already in progress")
            return
        }
        if (aboutState.hasLoaded && !forceRefresh) {
            Log.d(TAG, "Skip loading contributors because data is already loaded")
            return
        }

        Log.d(TAG, "Start loading contributors, forceRefresh=$forceRefresh")

        uiState.update {
            it.copy(
                aboutUiState = it.aboutUiState.copy(
                    isLoading = true,
                    errorMessage = null,
                ),
            )
        }

        viewModelScope.launch {
            val result = getGithubContributorsUseCase()
            uiState.update { current ->
                when (result) {
                    is AppResult.Success -> {
                        Log.d(TAG, "Loaded contributors successfully, count=${result.value.size}")
                        current.copy(
                            aboutUiState = current.aboutUiState.copy(
                                isLoading = false,
                                contributors = result.value.toList(),
                                errorMessage = null,
                                hasLoaded = true,
                            ),
                        )
                    }

                    is AppResult.Failure -> {
                        val sanitizedMessage = sanitizeAboutErrorMessage(result.error.message)
                        Log.e(
                            TAG,
                            "Failed to load contributors: raw=${result.error.message}, sanitized=$sanitizedMessage",
                        )
                        current.copy(
                            aboutUiState = current.aboutUiState.copy(
                                isLoading = false,
                                errorMessage = sanitizedMessage,
                            ),
                        )
                    }
                }
            }
        }
    }

    fun loadCurrentVersionRelease(
        appVersionName: String,
        forceRefresh: Boolean = false,
    ) {
        val normalizedTag = GetGithubReleaseByTagUseCase.normalizeTag(appVersionName)
        val releaseState = uiState.value.aboutUiState.versionRelease
        if (releaseState.isLoading) {
            Log.d(RELEASE_TAG, "Skip loading release because a request is already in progress")
            return
        }
        if (releaseState.hasLoadedTag == normalizedTag && !forceRefresh) {
            Log.d(RELEASE_TAG, "Skip loading release because tag=$normalizedTag is already loaded")
            return
        }

        Log.d(RELEASE_TAG, "Start loading release, tag=$normalizedTag, forceRefresh=$forceRefresh")
        uiState.update {
            it.copy(
                aboutUiState = it.aboutUiState.copy(
                    versionRelease = it.aboutUiState.versionRelease.copy(
                        isLoading = true,
                        errorMessage = null,
                        currentTag = normalizedTag,
                    ),
                ),
            )
        }

        viewModelScope.launch {
            val result = getGithubReleaseByTagUseCase(appVersionName)
            uiState.update { current ->
                when (result) {
                    is AppResult.Success -> {
                        Log.d(RELEASE_TAG, "Loaded release successfully, tag=${result.value.tagName}")
                        current.copy(
                            aboutUiState = current.aboutUiState.copy(
                                versionRelease = current.aboutUiState.versionRelease.copy(
                                    isLoading = false,
                                    release = result.value,
                                    errorMessage = null,
                                    hasLoadedTag = normalizedTag,
                                    currentTag = normalizedTag,
                                ),
                            ),
                        )
                    }

                    is AppResult.Failure -> {
                        val sanitizedMessage = sanitizeReleaseErrorMessage(result.error.message)
                        Log.e(
                            RELEASE_TAG,
                            "Failed to load release: raw=${result.error.message}, sanitized=$sanitizedMessage",
                        )
                        current.copy(
                            aboutUiState = current.aboutUiState.copy(
                                versionRelease = current.aboutUiState.versionRelease.copy(
                                    isLoading = false,
                                    release = null,
                                    errorMessage = sanitizedMessage,
                                    hasLoadedTag = normalizedTag,
                                    currentTag = normalizedTag,
                                ),
                            ),
                        )
                    }
                }
            }
        }
    }

    private fun sanitizeAboutErrorMessage(message: String?): String {
        if (message.isNullOrBlank() || message == "发生未知错误") {
            return "无法获取 GitHub 贡献者信息，请稍后重试"
        }
        return message
    }

    private fun sanitizeReleaseErrorMessage(message: String?): String {
        if (message.isNullOrBlank() || message == "发生未知错误") {
            return "无法获取当前版本 Release 信息，请稍后重试"
        }
        return message
    }
}
