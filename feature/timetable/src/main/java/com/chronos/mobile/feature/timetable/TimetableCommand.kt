package com.chronos.mobile.feature.timetable

sealed interface TimetableCommand {
    data object JumpToCurrentWeek : TimetableCommand
}
