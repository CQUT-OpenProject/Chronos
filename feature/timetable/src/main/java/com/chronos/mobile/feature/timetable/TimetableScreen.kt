package com.chronos.mobile.feature.timetable

import android.view.HapticFeedbackConstants
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
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
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.onClick
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.core.net.toUri
import coil3.compose.AsyncImage
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.timetableui.TimetableGrid
import com.chronos.mobile.core.timetableui.timetableDayLabel
import com.chronos.mobile.domain.model.TimetableCourseDisplayModel
import com.chronos.mobile.domain.model.TimetableGridModel
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlin.math.roundToInt

internal const val TIMETABLE_PAGER_TAG = "timetable_pager"
internal const val TIMETABLE_DISPLAYED_WEEK_LABEL_TAG = "timetable_displayed_week_label"

@Composable
internal fun TimetableScreen(
    state: TimetableUiState,
    rootContentPadding: PaddingValues,
    onEditTimetableDetails: () -> Unit,
    onCourseClick: (Course) -> Unit,
    onCourseLongClick: ((Course) -> Unit)? = null,
    onDisplayedWeekChange: (Int) -> Unit,
) {
    val currentTimetable = state.appState.currentTimetable ?: return
    val isDarkTheme = MaterialTheme.colorScheme.surface.luminance() < 0.5f
    val startWeek = currentTimetable.academicConfig.startWeek
    val weekCount = (currentTimetable.academicConfig.endWeek - startWeek + 1).coerceAtLeast(1)
    var suppressPagerWeekSync by remember(currentTimetable.id) { mutableStateOf(true) }
    val pagerState = rememberPagerState(
        initialPage = (state.displayedWeek - startWeek).coerceIn(0, weekCount - 1),
        pageCount = { weekCount },
    )
    val latestDisplayedWeek by rememberUpdatedState(state.displayedWeek)
    val latestOnDisplayedWeekChange by rememberUpdatedState(onDisplayedWeekChange)

    LaunchedEffect(pagerState, startWeek) {
        snapshotFlow { pagerState.settledPage }
            .distinctUntilChanged()
            .collect { page ->
                if (suppressPagerWeekSync) return@collect
                val settledWeek = startWeek + page
                if (settledWeek != latestDisplayedWeek) {
                    latestOnDisplayedWeekChange(settledWeek)
                }
            }
    }

    LaunchedEffect(state.displayedWeek, startWeek, weekCount) {
        val targetPage = (state.displayedWeek - startWeek).coerceIn(0, weekCount - 1)
        if (pagerState.currentPage != targetPage || pagerState.settledPage != targetPage) {
            suppressPagerWeekSync = true
            pagerState.scrollToPage(targetPage)
        }
        suppressPagerWeekSync = false
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        contentWindowInsets = WindowInsets(0, 0, 0, 0),
        topBar = {
            ChronosTopBar(
                state = state,
                onEditTimetableDetails = onEditTimetableDetails,
                onJumpToToday = { onDisplayedWeekChange(state.academicWeek) },
                onDisplayedWeekChange = onDisplayedWeekChange,
            )
        },
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(PaddingValues(top = paddingValues.calculateTopPadding())),
        ) {
            val wallpaperUri = state.appState.wallpaperUri
            if (!wallpaperUri.isNullOrBlank()) {
                AsyncImage(
                    model = wallpaperUri.toUri(),
                    contentDescription = null,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                    alpha = if (isDarkTheme) 0.72f else 0.88f,
                )
            }

            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize().testTag(TIMETABLE_PAGER_TAG),
                userScrollEnabled = weekCount > 1,
                beyondViewportPageCount = 1,
            ) { page ->
                val displayedWeek = startWeek + page
                val gridModel = state.weekGridModels[displayedWeek]
                val courseDisplayModels = state.weekCourseDisplayModels[displayedWeek].orEmpty()
                if (gridModel != null) {
                    TimetablePage(
                        displayedWeek = displayedWeek,
                        isCurrentWeek = displayedWeek == state.academicWeek,
                        bottomContentPadding = rootContentPadding.calculateBottomPadding(),
                        hasWallpaper = !wallpaperUri.isNullOrBlank(),
                        gridModel = gridModel,
                        courseDisplayModels = courseDisplayModels,
                        onCourseClick = onCourseClick,
                        onCourseLongClick = onCourseLongClick,
                    )
                }
            }
        }
    }
}

internal fun calculateWeekSliderSteps(
    startWeek: Int,
    endWeek: Int,
): Int = (endWeek - startWeek - 1).coerceAtLeast(0)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChronosTopBar(
    state: TimetableUiState,
    onEditTimetableDetails: () -> Unit,
    onJumpToToday: () -> Unit,
    onDisplayedWeekChange: (Int) -> Unit,
) {
    val isDarkTheme = MaterialTheme.colorScheme.surface.luminance() < 0.5f
    val view = LocalView.current
    val dateFormatter = remember { DateTimeFormatter.ofPattern("M/d", Locale.CHINA) }
    val currentTimetable = state.appState.currentTimetable
    val startWeek = currentTimetable?.academicConfig?.startWeek ?: state.displayedWeek
    val endWeek = currentTimetable?.academicConfig?.endWeek ?: state.displayedWeek
    val sliderSteps = calculateWeekSliderSteps(startWeek, endWeek)
    val weekRangeText = remember(state.gridModel) {
        val weekDays = state.gridModel?.visibleDays.orEmpty()
        val firstDate = weekDays.firstOrNull()?.date
        val lastDate = weekDays.lastOrNull()?.date
        if (firstDate == null || lastDate == null) {
            state.today.format(DateTimeFormatter.ofPattern("yyyy/M/d", Locale.CHINA))
        } else {
            "${firstDate.format(dateFormatter)} - ${lastDate.format(dateFormatter)}"
        }
    }
    var weekSliderVisible by remember(state.displayedWeekTimetableId) { mutableStateOf(false) }
    var sliderWeek by remember(state.displayedWeekTimetableId) { mutableIntStateOf(state.displayedWeek) }
    var lastHapticSliderWeek by remember(state.displayedWeekTimetableId) { mutableIntStateOf(state.displayedWeek) }
    val jumpToTodayLabel = stringResource(R.string.timetable_jump_to_today)
    val headerGestureDescription = stringResource(R.string.timetable_header_gesture_description)

    LaunchedEffect(state.displayedWeek, weekSliderVisible) {
        if (!weekSliderVisible) {
            sliderWeek = state.displayedWeek
            lastHapticSliderWeek = state.displayedWeek
        }
    }

    TopAppBar(
        modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.surface.copy(alpha = if (isDarkTheme) 0.78f else 0.60f),
        ),
        title = {
            Box(
                modifier = Modifier
                    .padding(end = 8.dp)
                    .fillMaxWidth()
                    .height(72.dp)
                    .semantics(mergeDescendants = true) {
                        contentDescription = headerGestureDescription
                        onClick(label = jumpToTodayLabel) {
                            onJumpToToday()
                            true
                        }
                    }
                    .pointerInput(onJumpToToday, startWeek, endWeek, state.displayedWeek, weekSliderVisible) {
                        detectTapGestures(
                            onTap = {
                                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                if (weekSliderVisible) {
                                    weekSliderVisible = false
                                } else {
                                    onJumpToToday()
                                }
                            },
                            onLongPress = {
                                if (startWeek < endWeek) {
                                    view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                                    sliderWeek = state.displayedWeek
                                    lastHapticSliderWeek = state.displayedWeek
                                    weekSliderVisible = true
                                }
                            },
                        )
                    },
            ) {
                if (weekSliderVisible && startWeek < endWeek) {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Slider(
                            value = sliderWeek.toFloat(),
                            onValueChange = { value ->
                                val targetWeek = value.roundToInt().coerceIn(startWeek, endWeek)
                                if (targetWeek != lastHapticSliderWeek) {
                                    view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
                                    lastHapticSliderWeek = targetWeek
                                }
                                sliderWeek = targetWeek
                                onDisplayedWeekChange(targetWeek)
                            },
                            valueRange = startWeek.toFloat()..endWeek.toFloat(),
                            steps = sliderSteps,
                            onValueChangeFinished = { weekSliderVisible = false },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        Text(
                            text = stringResource(R.string.timetable_header_displayed_week, sliderWeek),
                            style = MaterialTheme.typography.labelLarge,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                } else {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Text(
                            text = weekRangeText,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = stringResource(R.string.timetable_header_displayed_week, state.displayedWeek),
                                modifier = Modifier.testTag(TIMETABLE_DISPLAYED_WEEK_LABEL_TAG),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            if (state.displayedWeek == state.academicWeek) {
                                Text(
                                    text = " " + timetableDayLabel(state.today.dayOfWeek.value),
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }
                    }
                }
            }
        },
        actions = {
            IconButton(onClick = onEditTimetableDetails) {
                Icon(
                    Icons.Default.EditNote,
                    contentDescription = stringResource(R.string.timetable_edit_current),
                )
            }
        },
    )
}

@Composable
internal fun EmptyTimetableState(
    modifier: Modifier = Modifier,
    onImportTimetable: () -> Unit,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_empty_timetable_state),
            contentDescription = stringResource(R.string.timetable_empty_illustration),
            modifier = Modifier.size(220.dp),
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = stringResource(R.string.timetable_brand_name),
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.timetable_empty_title),
            style = MaterialTheme.typography.headlineMedium,
            textAlign = TextAlign.Center,
        )
        Spacer(modifier = Modifier.height(28.dp))
        OutlinedButton(
            onClick = onImportTimetable,
            shape = MaterialTheme.shapes.large,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.35f)),
        ) {
            Text(stringResource(R.string.timetable_import_action))
        }
    }
}

@Composable
private fun TimetablePage(
    displayedWeek: Int,
    isCurrentWeek: Boolean,
    bottomContentPadding: Dp,
    gridModel: TimetableGridModel,
    courseDisplayModels: List<TimetableCourseDisplayModel>,
    hasWallpaper: Boolean,
    onCourseClick: (Course) -> Unit,
    onCourseLongClick: ((Course) -> Unit)? = null,
) {
    TimetableGrid(
        displayedWeek = displayedWeek,
        isCurrentWeek = isCurrentWeek,
        gridModel = gridModel,
        courseDisplayModels = courseDisplayModels,
        hasWallpaper = hasWallpaper,
        modifier = Modifier.fillMaxSize(),
        bottomContentPadding = bottomContentPadding,
        onCourseClick = onCourseClick,
        onCourseLongClick = onCourseLongClick,
    )
}
