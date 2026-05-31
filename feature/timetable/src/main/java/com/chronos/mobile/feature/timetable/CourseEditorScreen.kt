package com.chronos.mobile.feature.timetable

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavBackStackEntry
import com.chronos.mobile.domain.model.CourseDraft

@Composable
fun CourseEditorRoute(
    parentEntry: NavBackStackEntry,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: TimetableViewModel = hiltViewModel(parentEntry),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val editingCourse = state.editingCourse

    LaunchedEffect(editingCourse) {
        if (editingCourse == null) {
            onDismiss()
        }
    }

    editingCourse?.let { editor ->
        CourseEditorScreen(
            modifier = modifier,
            initialState = editor,
            maxPeriods = state.gridModel?.displayedPeriodCount ?: 10,
            onBack = viewModel::dismissCourseEditor,
            onSave = viewModel::saveCourse,
            onDelete = editor.id?.let { id -> { viewModel.deleteCourse(id) } },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CourseEditorScreen(
    initialState: CourseDraft,
    maxPeriods: Int,
    onBack: () -> Unit,
    onSave: (CourseDraft) -> Unit,
    onDelete: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    var editor by remember(initialState) { mutableStateOf(initialState) }
    val courseColors = listOf(
        "#EADDFF" to "#21005D",
        "#FFDBC9" to "#311100",
        "#C4EED0" to "#072711",
        "#F9DEDC" to "#410E0B",
        "#D3E3FD" to "#041E49",
        "#FFD8E4" to "#31111D",
    )

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                title = { Text(stringResource(R.string.timetable_course_edit_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.timetable_back),
                        )
                    }
                },
                actions = {
                    TextButton(
                        enabled = editor.name.isNotBlank(),
                        onClick = { onSave(editor) },
                    ) {
                        Text(stringResource(R.string.timetable_save))
                    }
                },
            )
        },
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                OutlinedTextField(
                    value = editor.name,
                    onValueChange = { editor = editor.copy(name = it) },
                    label = { Text(stringResource(R.string.timetable_course_name_label)) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
            }
            item {
                OutlinedTextField(
                    value = editor.teacher,
                    onValueChange = { editor = editor.copy(teacher = it) },
                    label = { Text(stringResource(R.string.timetable_course_teacher_label)) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
            }
            item {
                OutlinedTextField(
                    value = editor.location,
                    onValueChange = { editor = editor.copy(location = it) },
                    label = { Text(stringResource(R.string.timetable_course_location_label)) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                )
            }
            item {
                OutlinedTextField(
                    value = editor.remark,
                    onValueChange = { editor = editor.copy(remark = it) },
                    label = { Text(stringResource(R.string.timetable_course_remark_label)) },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 5,
                    trailingIcon = {
                        if (editor.remark.isNotBlank()) {
                            IconButton(onClick = { editor = editor.copy(remark = "") }) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = stringResource(R.string.timetable_course_remark_clear),
                                )
                            }
                        }
                    },
                )
            }
            item {
                PeriodStepperRow(
                    title = stringResource(R.string.timetable_course_day_of_week_label),
                    value = editor.dayOfWeek,
                    range = 1..7,
                    onValueChange = { editor = editor.copy(dayOfWeek = it) },
                )
            }
            item {
                PeriodStepperRow(
                    title = stringResource(R.string.timetable_course_start_period_label),
                    value = editor.startPeriod,
                    range = 1..maxPeriods,
                    onValueChange = {
                        editor = editor.copy(
                            startPeriod = it,
                            endPeriod = maxOf(editor.endPeriod, it),
                        )
                    },
                )
            }
            item {
                PeriodStepperRow(
                    title = stringResource(R.string.timetable_course_end_period_label),
                    value = editor.endPeriod,
                    range = editor.startPeriod..maxPeriods,
                    onValueChange = { editor = editor.copy(endPeriod = it) },
                )
            }
            item {
                Text(
                    text = stringResource(R.string.timetable_course_color_label),
                    style = MaterialTheme.typography.labelLarge,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    courseColors.forEach { (background, foreground) ->
                        val selected = editor.color == background
                        Surface(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(MaterialTheme.shapes.extraLarge)
                                .clickable {
                                    editor = editor.copy(color = background, textColor = foreground)
                                },
                            shape = MaterialTheme.shapes.extraLarge,
                            color = parseColor(background),
                            border = BorderStroke(
                                width = if (selected) 2.dp else 0.dp,
                                color = MaterialTheme.colorScheme.primary,
                            ),
                        ) {}
                    }
                }
            }
            if (onDelete != null) {
                item {
                    OutlinedButton(
                        onClick = onDelete,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(
                            text = stringResource(R.string.timetable_delete),
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }
            }
        }
    }
}
