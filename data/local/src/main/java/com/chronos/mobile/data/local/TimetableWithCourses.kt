package com.chronos.mobile.data.local

import androidx.room.Embedded
import androidx.room.Relation

data class TimetableWithCourses(
    @Embedded val timetable: TimetableEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "timetableId",
    )
    val courses: List<CourseEntity>,
)
