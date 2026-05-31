package com.chronos.mobile.core.timetableui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.PeriodTime
import com.chronos.mobile.domain.model.TimetableCourseDisplayModel
import com.chronos.mobile.domain.model.TimetableGridModel
import java.time.Duration
import java.time.LocalDateTime
import java.time.LocalTime
import kotlinx.coroutines.delay

private const val MIN_TIME_REFRESH_DELAY_MILLIS = 1_000L

@Immutable
data class ParsedPeriodRange(
    val index: Int,
    val startTime: LocalTime,
    val endTime: LocalTime,
)

@Composable
fun timetableDayLabel(dayOfWeek: Int): String = when (dayOfWeek) {
    1 -> stringResource(R.string.timetable_day_monday)
    2 -> stringResource(R.string.timetable_day_tuesday)
    3 -> stringResource(R.string.timetable_day_wednesday)
    4 -> stringResource(R.string.timetable_day_thursday)
    5 -> stringResource(R.string.timetable_day_friday)
    6 -> stringResource(R.string.timetable_day_saturday)
    7 -> stringResource(R.string.timetable_day_sunday)
    else -> stringResource(R.string.timetable_day_unknown)
}

@Composable
fun timetableDayShortLabel(dayOfWeek: Int): String = when (dayOfWeek) {
    1 -> stringResource(R.string.timetable_day_short_monday)
    2 -> stringResource(R.string.timetable_day_short_tuesday)
    3 -> stringResource(R.string.timetable_day_short_wednesday)
    4 -> stringResource(R.string.timetable_day_short_thursday)
    5 -> stringResource(R.string.timetable_day_short_friday)
    6 -> stringResource(R.string.timetable_day_short_saturday)
    7 -> stringResource(R.string.timetable_day_short_sunday)
    else -> stringResource(R.string.timetable_day_short_unknown)
}

@Composable
fun TimetableGrid(
    displayedWeek: Int,
    isCurrentWeek: Boolean,
    gridModel: TimetableGridModel,
    courseDisplayModels: List<TimetableCourseDisplayModel>,
    hasWallpaper: Boolean,
    modifier: Modifier = Modifier,
    bottomContentPadding: Dp = 0.dp,
    rowHeight: Dp = 96.dp,
    sidebarWidth: Dp = 56.dp,
    enableAutoCenterCurrentPeriod: Boolean = true,
    enableVerticalScroll: Boolean = true,
    onCourseClick: ((Course) -> Unit)? = null,
    onCourseLongClick: ((Course) -> Unit)? = null,
) {
    MaterialTheme.colorScheme.surface.luminance() < 0.5f
    val verticalScrollState = rememberScrollState()
    val contentHeight = rowHeight * gridModel.displayedPeriodCount
    val visibleDayIndexMap = remember(gridModel.visibleDays) {
        gridModel.visibleDays.withIndex().associate { (index, day) -> day.dayOfWeek to index }
    }
    val parsedPeriods = remember(gridModel.periods) {
        parsePeriodRanges(gridModel.periods)
    }

    var viewportSize by remember { mutableStateOf(IntSize.Zero) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .onSizeChanged { viewportSize = it }
            .background(if (hasWallpaper) Color.Transparent else MaterialTheme.colorScheme.surface),
    ) {
        val density = LocalDensity.current
        val currentTime by produceState(initialValue = LocalTime.now(), isCurrentWeek, parsedPeriods) {
            value = LocalTime.now()
            if (!isCurrentWeek) return@produceState
            while (true) {
                val now = LocalDateTime.now()
                delay(computeDelayUntilNextCurrentTimeRefreshMillis(now, parsedPeriods))
                value = LocalTime.now()
            }
        }
        val contentWidth = with(density) {
            (viewportSize.width.toDp() - sidebarWidth).coerceAtLeast(0.dp)
        }
        val columnWidth = if (gridModel.visibleDays.isEmpty()) 0.dp else contentWidth / gridModel.visibleDays.size
        val visibleDayCount = gridModel.visibleDays.size
        var hasAutoCenteredCurrentWeek by remember(displayedWeek, isCurrentWeek) {
            mutableStateOf(false)
        }
        val currentPeriodIndex: Int? = remember(isCurrentWeek, parsedPeriods, currentTime) {
            if (!isCurrentWeek) return@remember null
            findCurrentPeriodIndex(parsedPeriods, currentTime)
        }

        LaunchedEffect(currentPeriodIndex, viewportSize.height, enableAutoCenterCurrentPeriod) {
            val target = currentPeriodIndex ?: return@LaunchedEffect
            if (!enableAutoCenterCurrentPeriod) return@LaunchedEffect
            if (viewportSize.height == 0) return@LaunchedEffect
            if (!isCurrentWeek || hasAutoCenteredCurrentWeek) return@LaunchedEffect
            val rowHeightPx = with(density) { rowHeight.toPx() }
            val viewportPx = viewportSize.height.toFloat()
            val targetOffset = ((target - 1) * rowHeightPx + rowHeightPx / 2 - viewportPx / 2)
                .toInt()
                .coerceAtLeast(0)
            verticalScrollState.scrollTo(targetOffset)
            hasAutoCenteredCurrentWeek = true
        }

        Column(modifier = Modifier.fillMaxSize()) {
            TimetableGridHeader(
                gridModel = gridModel,
                contentWidth = contentWidth,
                columnWidth = columnWidth,
                sidebarWidth = sidebarWidth,
                hasWallpaper = hasWallpaper,
            )

            val bodyModifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(bottom = bottomContentPadding)
                .then(
                    if (enableVerticalScroll) {
                        Modifier.verticalScroll(verticalScrollState)
                    } else {
                        Modifier
                    },
                )

            Row(modifier = bodyModifier) {
                TimetablePeriodSidebar(
                    periods = gridModel.periods,
                    contentHeight = contentHeight,
                    rowHeight = rowHeight,
                    sidebarWidth = sidebarWidth,
                    hasWallpaper = hasWallpaper,
                    currentPeriodIndex = currentPeriodIndex,
                )

                Box(
                    modifier = Modifier
                        .height(contentHeight)
                        .width(contentWidth),
                ) {
                    TimetableGridBackground(hasWallpaper = hasWallpaper)

                    Box(modifier = Modifier.fillMaxSize()) {
                        val slotGroups = remember(courseDisplayModels) {
                            buildSlotGroups(courseDisplayModels)
                        }
                        var expandedSlots by remember { mutableStateOf(setOf<SlotPosition>()) }

                        slotGroups.forEach { group ->
                            val slotKey = group.position
                            val count = group.courses.size
                            val slotSpan = group.endPeriod - group.startPeriod + 1
                            val slotTotalHeight = rowHeight * slotSpan
                            val isExpanded = slotKey in expandedSlots

                            if (count == 1) {
                                val displayModel = group.courses.first()
                                val course = displayModel.course
                                val topOffset = rowHeight * (course.startPeriod - 1)
                                val leftOffset = columnWidth * visibleDayIndexMap.getValue(course.dayOfWeek)

                                Box(
                                    modifier = Modifier
                                        .padding(start = leftOffset, top = topOffset)
                                        .width(columnWidth)
                                        .height(slotTotalHeight),
                                ) {
                                    TimetableCourseCard(
                                        course = course,
                                        isInDisplayedWeek = displayModel.isInDisplayedWeek,
                                        height = slotTotalHeight,
                                        visibleDayCount = visibleDayCount,
                                        modifier = Modifier.fillMaxSize(),
                                        onClick = onCourseClick?.let { click ->
                                            { click(course) }
                                        },
                                        onLongClick = onCourseLongClick?.let { click ->
                                            { click(course) }
                                        },
                                    )
                                }
                            } else if (!isExpanded) {
                                val topOffset = rowHeight * (group.startPeriod - 1)
                                val leftOffset = columnWidth * visibleDayIndexMap.getValue(group.dayOfWeek)

                                Box(
                                    modifier = Modifier
                                        .padding(start = leftOffset, top = topOffset)
                                        .width(columnWidth)
                                        .height(slotTotalHeight),
                                ) {
                                    TimetableConflictPlaceholderCard(
                                        courseCount = count,
                                        height = slotTotalHeight,
                                        visibleDayCount = visibleDayCount,
                                        modifier = Modifier.fillMaxSize(),
                                        onClick = { expandedSlots = expandedSlots + slotKey },
                                        onLongClick = null,
                                    )
                                }
                            } else {
                                val leftOffset = columnWidth * visibleDayIndexMap.getValue(group.dayOfWeek)
                                val perCourseWidth = columnWidth / count

                                group.courses.forEachIndexed { index, displayModel ->
                                    val course = displayModel.course
                                    val courseSpan = course.endPeriod - course.startPeriod + 1
                                    val courseTopOffset = rowHeight * (course.startPeriod - 1)
                                    val courseHeight = rowHeight * courseSpan

                                    Box(
                                        modifier = Modifier
                                            .padding(start = leftOffset + perCourseWidth * index, top = courseTopOffset)
                                            .width(perCourseWidth)
                                            .height(courseHeight),
                                    ) {
                                        TimetableCourseCard(
                                            course = course,
                                            isInDisplayedWeek = displayModel.isInDisplayedWeek,
                                            height = courseHeight,
                                            visibleDayCount = visibleDayCount,
                                            overlapCount = count,
                                            modifier = Modifier.fillMaxSize(),
                                            onClick = onCourseClick?.let { click ->
                                                { click(course) }
                                            },
                                            onLongClick = onCourseLongClick?.let { click ->
                                                { click(course) }
                                            },
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

fun parsePeriodRanges(periods: List<PeriodTime>): List<ParsedPeriodRange> =
    periods
        .map { period ->
            ParsedPeriodRange(
                index = period.index,
                startTime = runCatching { LocalTime.parse(period.startTime) }.getOrElse { LocalTime.MIDNIGHT },
                endTime = runCatching { LocalTime.parse(period.endTime) }.getOrElse { LocalTime.MIDNIGHT },
            )
        }
        .sortedBy { it.index }

fun findCurrentPeriodIndex(
    periods: List<ParsedPeriodRange>,
    now: LocalTime,
): Int? {
    periods.firstOrNull { period ->
        !now.isBefore(period.startTime) && !now.isAfter(period.endTime)
    }?.let { return it.index }

    periods.firstOrNull { period ->
        now.isBefore(period.startTime)
    }?.let { return it.index }

    return periods.lastOrNull()?.index
}

fun computeDelayUntilNextCurrentTimeRefreshMillis(
    now: LocalDateTime,
    periods: List<ParsedPeriodRange>,
    minimumDelayMillis: Long = MIN_TIME_REFRESH_DELAY_MILLIS,
): Long {
    val nowTime = now.toLocalTime()
    val nextBoundaryToday = periods.firstNotNullOfOrNull { period ->
        when {
            !nowTime.isBefore(period.startTime) && !nowTime.isAfter(period.endTime) ->
                period.endTime.plusNanos(1)
            nowTime.isBefore(period.startTime) ->
                period.startTime
            else -> null
        }
    }
    val nextBoundary = if (nextBoundaryToday != null) {
        var candidate = now.toLocalDate().atTime(nextBoundaryToday)
        if (!candidate.isAfter(now)) {
            candidate = candidate.plusDays(1)
        }
        candidate
    } else {
        now.toLocalDate().plusDays(1).atStartOfDay()
    }
    return Duration.between(now, nextBoundary).toMillis().coerceAtLeast(minimumDelayMillis)
}

@Composable
private fun TimetableGridHeader(
    gridModel: TimetableGridModel,
    contentWidth: Dp,
    columnWidth: Dp,
    sidebarWidth: Dp,
    hasWallpaper: Boolean,
) {
    val isDarkTheme = MaterialTheme.colorScheme.surface.luminance() < 0.5f

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                MaterialTheme.colorScheme.surface.copy(
                    alpha = if (hasWallpaper) {
                        if (isDarkTheme) 0.72f else 0.54f
                    } else {
                        1f
                    },
                ),
            )
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(
            modifier = Modifier.width(sidebarWidth),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = gridModel.monthLabel,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                text = stringResource(R.string.timetable_month_suffix),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        Row(modifier = Modifier.width(contentWidth)) {
            gridModel.visibleDays.forEach { day ->
                Column(
                    modifier = Modifier.width(columnWidth),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        text = timetableDayShortLabel(day.dayOfWeek),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Surface(
                        modifier = Modifier.size(26.dp),
                        shape = CircleShape,
                        color = if (day.isToday) MaterialTheme.colorScheme.primary else Color.Transparent,
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = day.date.dayOfMonth.toString(),
                                color = if (day.isToday) {
                                    MaterialTheme.colorScheme.onPrimary
                                } else {
                                    MaterialTheme.colorScheme.onSurface
                                },
                                style = MaterialTheme.typography.bodyMedium,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TimetablePeriodSidebar(
    periods: List<com.chronos.mobile.core.model.PeriodTime>,
    contentHeight: Dp,
    rowHeight: Dp,
    sidebarWidth: Dp,
    hasWallpaper: Boolean,
    currentPeriodIndex: Int?,
) {
    val isDarkTheme = MaterialTheme.colorScheme.surface.luminance() < 0.5f

    Column(
        modifier = Modifier
            .width(sidebarWidth)
            .height(contentHeight)
            .background(
                MaterialTheme.colorScheme.surface.copy(
                    alpha = if (hasWallpaper) {
                        if (isDarkTheme) 0.72f else 0.54f
                    } else {
                        1f
                    },
                ),
            ),
    ) {
        periods.forEach { period ->
            val isActive = period.index == currentPeriodIndex
            Column(
                modifier = Modifier
                    .height(rowHeight)
                    .fillMaxWidth()
                    .padding(horizontal = 4.dp, vertical = 3.dp)
                    .clip(MaterialTheme.shapes.large)
                    .background(
                        if (isActive) MaterialTheme.colorScheme.primaryContainer
                        else Color.Transparent,
                    ),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text(
                    period.index.toString(),
                    fontWeight = FontWeight.Bold,
                    color = if (isActive) MaterialTheme.colorScheme.onPrimaryContainer
                    else Color.Unspecified,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${period.startTime}\n${period.endTime}",
                    style = MaterialTheme.typography.labelSmall,
                    textAlign = TextAlign.Center,
                    color = if (isActive) MaterialTheme.colorScheme.onPrimaryContainer
                    else MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun TimetableGridBackground(
    hasWallpaper: Boolean,
) {
    val isDarkTheme = MaterialTheme.colorScheme.surface.luminance() < 0.5f
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                MaterialTheme.colorScheme.surface.copy(
                    alpha = if (hasWallpaper) {
                        if (isDarkTheme) 0.62f else 0.38f
                    } else {
                        1f
                    },
                ),
            ),
    )
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun TimetableCourseCard(
    course: Course,
    isInDisplayedWeek: Boolean,
    height: Dp,
    visibleDayCount: Int,
    overlapCount: Int = 1,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    onLongClick: (() -> Unit)? = null,
) {
    val alpha = if (isInDisplayedWeek) 1f else 0.45f
    val isDarkTheme = MaterialTheme.colorScheme.surface.luminance() < 0.5f
    val rawCardBackground = parseColor(course.color)
    val surfaceColor = MaterialTheme.colorScheme.surface
    val baseTextColor = if (isDarkTheme) {
        lerp(MaterialTheme.colorScheme.onSurface, rawCardBackground, 0.18f)
    } else {
        parseColor(course.textColor)
    }
    val cardBackground = if (isDarkTheme) {
        lerp(rawCardBackground, surfaceColor, 0.58f)
    } else {
        rawCardBackground
    }
    val secondaryTextColor = baseTextColor.copy(alpha = 0.8f)
    val locationText = remember(course.location) {
        course.location
            .trim()
            .split(Regex("\\s+"))
            .filter { it.isNotBlank() }
            .joinToString(separator = "\n")
    }

    val cardModifier = modifier
        .padding(vertical = 3.dp)
        .alpha(alpha)
        .courseCardGestures(onClick = onClick, onLongClick = onLongClick)

    Card(
        modifier = cardModifier,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = cardBackground),
        border = BorderStroke(1.dp, baseTextColor.copy(alpha = 0.12f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        TimetableCourseCardContent(
            course = course,
            isInDisplayedWeek = isInDisplayedWeek,
            height = height,
            baseTextColor = baseTextColor,
            secondaryTextColor = secondaryTextColor,
            locationText = locationText,
            visibleDayCount = visibleDayCount,
            overlapCount = overlapCount,
        )
    }
}

@Composable
private fun TimetableCourseCardContent(
    course: Course,
    isInDisplayedWeek: Boolean,
    height: Dp,
    baseTextColor: Color,
    secondaryTextColor: Color,
    locationText: String,
    visibleDayCount: Int,
    overlapCount: Int = 1,
) {
    val crowding = visibleDayCount * overlapCount
    val nameStyle = when {
        crowding >= 11 -> MaterialTheme.typography.labelSmall
        crowding >= 7 -> MaterialTheme.typography.labelMedium
        else -> MaterialTheme.typography.labelLarge
    }
    val detailStyle = if (crowding >= 11) {
        MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp)
    } else {
        MaterialTheme.typography.labelSmall
    }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .height(height)
            .padding(8.dp),
    ) {
        if (isInDisplayedWeek) {
            Text(
                text = course.name,
                color = baseTextColor,
                style = nameStyle,
            )
        } else {
            Surface(
                shape = MaterialTheme.shapes.small,
                color = baseTextColor.copy(alpha = 0.12f),
            ) {
                Text(
                    text = stringResource(R.string.timetable_course_non_current_week_prefix),
                    color = secondaryTextColor,
                    style = detailStyle,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                )
            }
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = course.name,
                color = baseTextColor,
                style = nameStyle,
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = locationText,
            color = secondaryTextColor,
            style = detailStyle,
        )
        Spacer(modifier = Modifier.weight(1f))
        Text(
            text = course.teacher,
            color = secondaryTextColor,
            style = detailStyle,
        )
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun TimetableConflictPlaceholderCard(
    courseCount: Int,
    height: Dp,
    visibleDayCount: Int,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    onLongClick: (() -> Unit)? = null,
) {
    val isDarkTheme = MaterialTheme.colorScheme.surface.luminance() < 0.5f
    val cardBackground = if (isDarkTheme) {
        MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
    } else {
        MaterialTheme.colorScheme.surfaceVariant
    }
    val textColor = MaterialTheme.colorScheme.onSurfaceVariant

    val placeholderStyle = when (visibleDayCount) {
        7 -> MaterialTheme.typography.labelSmall
        6 -> MaterialTheme.typography.labelMedium
        else -> MaterialTheme.typography.labelLarge
    }

    val cardModifier = modifier
        .padding(vertical = 3.dp)
        .courseCardGestures(onClick = onClick, onLongClick = onLongClick)

    Card(
        modifier = cardModifier,
        shape = MaterialTheme.shapes.medium,
        colors = CardDefaults.cardColors(containerColor = cardBackground),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(height)
                .padding(8.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = stringResource(R.string.timetable_conflict_courses, courseCount),
                color = textColor,
                style = placeholderStyle,
            )
        }
    }
}

private data class SlotPosition(
    val dayOfWeek: Int,
    val startPeriod: Int,
    val endPeriod: Int,
)

private data class CourseSlotGroup(
    val dayOfWeek: Int,
    val startPeriod: Int,
    val endPeriod: Int,
    val courses: List<TimetableCourseDisplayModel>,
) {
    val position: SlotPosition = SlotPosition(
        dayOfWeek = dayOfWeek,
        startPeriod = startPeriod,
        endPeriod = endPeriod,
    )
}

private fun buildSlotGroups(
    courseDisplayModels: List<TimetableCourseDisplayModel>,
): List<CourseSlotGroup> = courseDisplayModels
    .groupBy { it.course.dayOfWeek }
    .toSortedMap()
    .values
    .flatMap { dayCourses ->
        val sorted = dayCourses.sortedWith(
            compareBy<TimetableCourseDisplayModel> { it.course.startPeriod }
                .thenBy { it.course.endPeriod }
                .thenBy { it.course.name },
        )
        buildDaySlotGroups(sorted)
    }

private fun buildDaySlotGroups(
    sortedCourses: List<TimetableCourseDisplayModel>,
): List<CourseSlotGroup> {
    if (sortedCourses.isEmpty()) return emptyList()

    val groups = mutableListOf<CourseSlotGroup>()
    var current = mutableListOf<TimetableCourseDisplayModel>()
    var currentEndPeriod = 0

    sortedCourses.forEach { displayModel ->
        val course = displayModel.course
        if (current.isEmpty() || course.startPeriod <= currentEndPeriod) {
            current += displayModel
            currentEndPeriod = maxOf(currentEndPeriod, course.endPeriod)
        } else {
            groups += current.toCourseSlotGroup()
            current = mutableListOf(displayModel)
            currentEndPeriod = course.endPeriod
        }
    }

    if (current.isNotEmpty()) {
        groups += current.toCourseSlotGroup()
    }

    return groups
}

private fun List<TimetableCourseDisplayModel>.toCourseSlotGroup(): CourseSlotGroup {
    val dayOfWeek = first().course.dayOfWeek
    return CourseSlotGroup(
        dayOfWeek = dayOfWeek,
        startPeriod = minOf { it.course.startPeriod },
        endPeriod = maxOf { it.course.endPeriod },
        courses = this,
    )
}

@OptIn(ExperimentalFoundationApi::class)
private fun Modifier.courseCardGestures(
    onClick: (() -> Unit)?,
    onLongClick: (() -> Unit)?,
): Modifier = then(
    when {
        onClick != null && onLongClick != null -> Modifier.combinedClickable(
            onClick = onClick,
            onLongClick = onLongClick,
        )
        onClick != null -> Modifier.combinedClickable(
            onClick = onClick,
        )
        onLongClick != null -> Modifier.combinedClickable(
            onClick = {},
            onLongClick = onLongClick,
        )
        else -> Modifier
    },
)
