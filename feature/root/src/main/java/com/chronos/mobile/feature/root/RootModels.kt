package com.chronos.mobile.feature.root

import androidx.compose.runtime.Immutable
import com.chronos.mobile.domain.model.GithubContributor
import com.chronos.mobile.domain.model.GithubRelease

enum class RootTab {
    TIMETABLE,
    MINE,
}

internal object RootRoute {
    const val TIMETABLE = "timetable"
    const val TIMETABLE_DETAILS = "timetable/details"
    const val TIMETABLE_COURSE_EDITOR = "timetable/course-editor"
    const val TIMETABLE_COURSE_DETAIL = "timetable/course-detail"
    const val MINE = "mine"
    const val MANAGE_TIMETABLES = "secondary/manage-timetables"
    const val TRANSFER_IMPORT = "secondary/transfer/import"
    const val TRANSFER_IMPORT_CONFIRM = "secondary/transfer/import/confirm"
    const val TRANSFER_EXPORT = "secondary/transfer/export"
    const val THEME_SETTINGS = "secondary/theme-settings"
    const val WALLPAPER = "secondary/wallpaper"
    const val ABOUT = "secondary/about"
    const val VERSION_RELEASE = "secondary/about/version-release"
    const val OPEN_SOURCE_LICENSES = "secondary/open-source-licenses"
    const val PROJECT_LICENSE = "secondary/open-source-licenses/project"
}

internal const val SecondaryPageEnterDuration = 320
internal const val SecondaryPageExitDuration = 260

@Immutable
data class RootUiState(
    val aboutUiState: AboutUiState = AboutUiState(),
)

@Immutable
data class AboutUiState(
    val isLoading: Boolean = false,
    val contributors: List<GithubContributor> = emptyList(),
    val errorMessage: String? = null,
    val hasLoaded: Boolean = false,
    val versionRelease: VersionReleaseUiState = VersionReleaseUiState(),
)

@Immutable
data class VersionReleaseUiState(
    val isLoading: Boolean = false,
    val release: GithubRelease? = null,
    val errorMessage: String? = null,
    val hasLoadedTag: String? = null,
    val currentTag: String? = null,
)
