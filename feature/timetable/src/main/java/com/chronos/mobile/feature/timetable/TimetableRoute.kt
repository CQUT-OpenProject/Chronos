package com.chronos.mobile.feature.timetable

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavBackStackEntry
import kotlinx.coroutines.flow.Flow

@Composable
fun TimetableRoute(
    modifier: Modifier = Modifier,
    contentPadding: PaddingValues = PaddingValues(),
    timetableCommands: Flow<TimetableCommand>,
    onImportTimetable: () -> Unit,
    onEditCourse: () -> Unit,
    onEditTimetableDetails: () -> Unit,
    onCourseDetail: () -> Unit,
    viewModel: TimetableViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val currentTimetable = state.appState.currentTimetable

    LaunchedEffect(timetableCommands) {
        timetableCommands.collect { command ->
            when (command) {
                TimetableCommand.JumpToCurrentWeek -> viewModel.jumpToCurrentWeek()
            }
        }
    }

    Box(
        modifier = modifier.fillMaxSize(),
    ) {
        if (state.hasLoadedAppState && currentTimetable == null) {
            EmptyTimetableState(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(contentPadding),
                onImportTimetable = onImportTimetable,
            )
        } else if (state.hasLoadedAppState) {
            TimetableScreen(
                state = state,
                rootContentPadding = contentPadding,
                onEditTimetableDetails = {
                    onEditTimetableDetails()
                },
                onCourseClick = { course ->
                    viewModel.requestCourseDetail(course)
                    onCourseDetail()
                },
                onCourseLongClick = { course ->
                    viewModel.requestEditCourse(course)
                    onEditCourse()
                },
                onDisplayedWeekChange = viewModel::setDisplayedWeek,
            )
        }
    }
}

@Composable
fun CourseDetailRoute(
    modifier: Modifier = Modifier,
    parentEntry: NavBackStackEntry,
    onBack: () -> Unit,
    onEditCourse: () -> Unit,
) {
    val viewModel = hiltViewModel<TimetableViewModel>(parentEntry)
    val state by viewModel.state.collectAsStateWithLifecycle()
    val course = state.detailCourse

    LaunchedEffect(state.hasLoadedAppState, course) {
        if (state.hasLoadedAppState && course == null) {
            onBack()
        }
    }

    if (course != null) {
        CourseDetailScreen(
            course = course,
            onBack = {
                viewModel.dismissCourseDetail()
                onBack()
            },
            onEdit = {
                viewModel.requestEditCourse(course)
                viewModel.dismissCourseDetail()
                onEditCourse()
            },
            modifier = modifier,
        )
    }
}

@Composable
fun TimetableDetailsEditorRoute(
    modifier: Modifier = Modifier,
    parentEntry: NavBackStackEntry,
    viewModel: TimetableViewModel = hiltViewModel(parentEntry),
    onDismiss: () -> Unit,
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val currentTimetable = state.appState.currentTimetable

    LaunchedEffect(
        state.hasLoadedAppState,
        state.appState.currentTimetableId,
        state.appState.timetables.size,
    ) {
        if (state.hasLoadedAppState &&
            (state.appState.currentTimetableId == null ||
            (state.appState.timetables.isNotEmpty() && currentTimetable == null)
            )
        ) {
            onDismiss()
        }
    }

    if (state.hasLoadedAppState) {
        currentTimetable?.let {
            TimetableDetailsEditorScreen(
                modifier = modifier,
                initialState = it.toSettingsDraft(),
                onDismiss = onDismiss,
                onSave = { editor -> viewModel.saveTimetableDetails(editor, onSaved = onDismiss) },
            )
        }
    }
}
