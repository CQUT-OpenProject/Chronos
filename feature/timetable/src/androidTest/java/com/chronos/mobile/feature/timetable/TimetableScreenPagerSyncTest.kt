package com.chronos.mobile.feature.timetable

import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.performTouchInput
import androidx.compose.ui.test.swipeLeft
import androidx.compose.ui.test.swipeRight
import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.core.model.PeriodTime
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.TimetableSummary
import com.chronos.mobile.domain.model.TimetableDayModel
import com.chronos.mobile.domain.model.TimetableGridModel
import java.time.LocalDate
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import androidx.test.ext.junit.runners.AndroidJUnit4

@RunWith(AndroidJUnit4::class)
class TimetableScreenPagerSyncTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<ComponentActivity>()

    @Test
    fun pager_swipe_back_and_forth_keeps_top_week_label_in_sync() {
        val weekChanges = mutableListOf<Int>()

        composeRule.setContent {
            MaterialTheme {
                var displayedWeek by remember { mutableIntStateOf(3) }
                val timetable = remember { sampleTimetable() }
                val weekGridModels = remember { sampleWeekGridModels() }
                val state = TimetableUiState(
                    appState = AppState(
                        timetables = listOf(
                            TimetableSummary(
                                id = timetable.id,
                                name = timetable.name,
                                courseCount = timetable.courses.size,
                                createdAt = timetable.createdAt,
                                updatedAt = timetable.updatedAt,
                            ),
                        ),
                        currentTimetableId = timetable.id,
                        currentTimetable = timetable,
                    ),
                    hasLoadedAppState = true,
                    today = LocalDate.parse("2026-03-17"),
                    academicWeek = 3,
                    displayedWeek = displayedWeek,
                    displayedWeekTimetableId = timetable.id,
                    gridModel = weekGridModels.getValue(displayedWeek),
                    weekGridModels = weekGridModels,
                )

                TimetableScreen(
                    state = state,
                    rootContentPadding = PaddingValues(),
                    onEditTimetableDetails = {},
                    onCourseClick = {},
                    onCourseLongClick = {},
                    onDisplayedWeekChange = { targetWeek ->
                        weekChanges += targetWeek
                        displayedWeek = targetWeek
                    },
                )
            }
        }

        composeRule
            .onNodeWithTag(TIMETABLE_DISPLAYED_WEEK_LABEL_TAG, useUnmergedTree = true)
            .assertTextEquals("第3周")

        composeRule
            .onNodeWithTag(TIMETABLE_PAGER_TAG, useUnmergedTree = true)
            .performTouchInput { swipeLeft() }
        composeRule.waitUntil(timeoutMillis = 5_000) {
            composeRule.onAllNodesWithText("第4周", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()
        }
        composeRule
            .onNodeWithTag(TIMETABLE_DISPLAYED_WEEK_LABEL_TAG, useUnmergedTree = true)
            .assertTextEquals("第4周")

        composeRule
            .onNodeWithTag(TIMETABLE_PAGER_TAG, useUnmergedTree = true)
            .performTouchInput { swipeRight() }
        composeRule.waitUntil(timeoutMillis = 5_000) {
            composeRule.onAllNodesWithText("第3周", useUnmergedTree = true).fetchSemanticsNodes().isNotEmpty()
        }
        composeRule
            .onNodeWithTag(TIMETABLE_DISPLAYED_WEEK_LABEL_TAG, useUnmergedTree = true)
            .assertTextEquals("第3周")

        composeRule.runOnIdle {
            assertEquals(listOf(4, 3), weekChanges)
        }
    }

    private fun sampleTimetable(): Timetable = Timetable(
        id = "timetable-id",
        name = "课程表",
        courses = emptyList(),
        createdAt = 0L,
        updatedAt = 0L,
        academicConfig = AcademicConfig(
            termStartDate = "2026-03-02",
            startWeek = 3,
            endWeek = 4,
            periodTimes = samplePeriods(),
        ),
    )

    private fun sampleWeekGridModels(): Map<Int, TimetableGridModel> {
        val weekThreeDays = listOf(
            TimetableDayModel(1, LocalDate.parse("2026-03-16"), false),
            TimetableDayModel(2, LocalDate.parse("2026-03-17"), true),
            TimetableDayModel(3, LocalDate.parse("2026-03-18"), false),
            TimetableDayModel(4, LocalDate.parse("2026-03-19"), false),
            TimetableDayModel(5, LocalDate.parse("2026-03-20"), false),
        )
        val weekFourDays = listOf(
            TimetableDayModel(1, LocalDate.parse("2026-03-23"), false),
            TimetableDayModel(2, LocalDate.parse("2026-03-24"), false),
            TimetableDayModel(3, LocalDate.parse("2026-03-25"), false),
            TimetableDayModel(4, LocalDate.parse("2026-03-26"), false),
            TimetableDayModel(5, LocalDate.parse("2026-03-27"), false),
        )

        return mapOf(
            3 to TimetableGridModel(
                monthLabel = "3",
                visibleDays = weekThreeDays,
                periods = samplePeriods(),
                displayedPeriodCount = 2,
            ),
            4 to TimetableGridModel(
                monthLabel = "3",
                visibleDays = weekFourDays,
                periods = samplePeriods(),
                displayedPeriodCount = 2,
            ),
        )
    }

    private fun samplePeriods(): List<PeriodTime> = listOf(
        PeriodTime(index = 1, startTime = "08:00", endTime = "08:45"),
        PeriodTime(index = 2, startTime = "09:00", endTime = "09:45"),
    )
}
