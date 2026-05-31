package com.chronos.mobile.feature.timetable

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.timetableui.parseColor
import com.chronos.mobile.core.timetableui.timetableDayLabel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun CourseDetailScreen(
    course: Course,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var showRemark by remember(course.id) { mutableStateOf(true) }
    val color = remember(course.color) { parseColor(course.color) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.timetable_course_detail_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.timetable_course_detail_back),
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onEdit) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = stringResource(R.string.timetable_course_detail_edit),
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = color.copy(alpha = 0.12f),
                ),
            )
        },
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(color),
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = course.name,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f),
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            DetailInfoSection(
                title = stringResource(R.string.timetable_course_detail_basic_info),
            ) {
                DetailInfoRow(
                    label = stringResource(R.string.timetable_course_detail_teacher),
                    value = course.teacher.ifBlank { "-" },
                )
                HorizontalDivider()
                DetailInfoRow(
                    label = stringResource(R.string.timetable_course_detail_location),
                    value = course.location.ifBlank { "-" },
                )
                HorizontalDivider()
                DetailInfoRow(
                    label = stringResource(R.string.timetable_course_detail_day),
                    value = timetableDayLabel(course.dayOfWeek),
                )
                HorizontalDivider()
                DetailInfoRow(
                    label = stringResource(R.string.timetable_course_detail_period),
                    value = stringResource(
                        R.string.timetable_course_detail_period_range,
                        course.startPeriod,
                        course.endPeriod,
                    ),
                )
                HorizontalDivider()
                DetailInfoRow(
                    label = stringResource(R.string.timetable_course_detail_weeks),
                    value = if (course.weeks.isEmpty()) {
                        stringResource(R.string.timetable_course_detail_all_weeks)
                    } else {
                        course.weeks.joinToString(", ") { it.toString() }
                    },
                )
            }

            if (course.remark.isNotBlank()) {
                Spacer(modifier = Modifier.height(16.dp))

                DetailInfoSection(
                    title = stringResource(R.string.timetable_course_detail_remark),
                    onClick = { showRemark = !showRemark },
                    expandable = true,
                    isExpanded = showRemark,
                ) {
                    AnimatedVisibility(
                        visible = showRemark,
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically(),
                    ) {
                        Text(
                            text = course.remark,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailInfoSection(
    title: String,
    onClick: (() -> Unit)? = null,
    expandable: Boolean = false,
    isExpanded: Boolean = true,
    content: @Composable () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(MaterialTheme.shapes.medium)
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
            .then(
                if (onClick != null) {
                    Modifier.clickable(onClick = onClick)
                } else {
                    Modifier
                },
            )
            .padding(16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            if (expandable && onClick != null) {
                Text(
                    text = if (isExpanded) {
                        stringResource(R.string.timetable_course_detail_collapse)
                    } else {
                        stringResource(R.string.timetable_course_detail_expand)
                    },
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier
                        .clip(MaterialTheme.shapes.small)
                        .then(
                            Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        ),
                )
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        content()
    }
}

@Composable
private fun DetailInfoRow(
    label: String,
    value: String,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            textAlign = TextAlign.End,
            modifier = Modifier.weight(1f),
        )
    }
}
