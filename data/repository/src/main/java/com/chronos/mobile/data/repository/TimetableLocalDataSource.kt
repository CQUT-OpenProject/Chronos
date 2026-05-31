package com.chronos.mobile.data.repository

import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.TimetableSummary
import com.chronos.mobile.data.local.ChronosDao
import com.chronos.mobile.data.local.CourseEntity
import com.chronos.mobile.data.local.TimetableEntity
import com.chronos.mobile.data.local.TimetableSummaryRow
import com.chronos.mobile.data.local.TimetableWithCourses
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map

@Singleton
class TimetableLocalDataSource @Inject constructor(
    private val chronosDao: ChronosDao,
    private val timetableConfigJsonCodec: TimetableConfigJsonCodec,
) {
    fun observeTimetableSummaries(): Flow<List<TimetableSummary>> = chronosDao.observeTimetableSummaries()
        .map { summaries -> summaries.map { it.toDomain() }.toList() }
        .distinctUntilChanged()

    fun observeTimetable(id: String): Flow<Timetable?> = chronosDao.observeTimetableById(id)
        .map { timetable -> timetable?.toDomain() }
        .distinctUntilChanged()

    suspend fun getTimetableSummariesSnapshot(): List<TimetableSummary> =
        chronosDao.getTimetableSummariesSnapshot().map { it.toDomain() }

    suspend fun getTimetable(id: String): Timetable? = chronosDao.getTimetableById(id)?.toDomain()

    suspend fun saveTimetable(timetable: Timetable) {
        chronosDao.upsertTimetableGraph(
            timetable = timetable.toEntity(),
            courses = timetable.courses.map { it.toEntity(timetable.id) },
        )
    }

    suspend fun saveCourse(timetableId: String, course: Course) {
        chronosDao.upsertCourseForTimetable(
            timetableId = timetableId,
            course = course.toEntity(timetableId),
            updatedAt = System.currentTimeMillis(),
        )
    }

    suspend fun deleteCourse(courseId: String) {
        chronosDao.deleteCourseAndTouchTimetable(
            courseId = courseId,
            updatedAt = System.currentTimeMillis(),
        )
    }

    suspend fun deleteTimetable(id: String) {
        chronosDao.deleteTimetable(id)
    }

    private fun TimetableWithCourses.toDomain(): Timetable {
        val config = timetable.configOrDefault()
        return Timetable(
            id = timetable.id,
            name = timetable.name,
            createdAt = timetable.createdAt,
            updatedAt = timetable.updatedAt,
            courses = courses.map { it.toDomain() }.toList(),
            academicConfig = config.academicConfig,
            importMetadata = config.importMetadata,
            viewPrefs = config.viewPrefs,
        )
    }

    private fun TimetableSummaryRow.toDomain(): TimetableSummary = TimetableSummary(
        id = id,
        name = name,
        courseCount = courseCount,
        createdAt = createdAt,
        updatedAt = updatedAt,
    )

    private fun Timetable.toEntity(): TimetableEntity = TimetableEntity(
        id = id,
        name = name,
        createdAt = createdAt,
        updatedAt = updatedAt,
        configJson = timetableConfigJsonCodec.encode(
            academicConfig = academicConfig,
            importMetadata = importMetadata,
            viewPrefs = viewPrefs,
        ),
    )

    private fun Course.toEntity(timetableId: String): CourseEntity = CourseEntity(
        id = id,
        timetableId = timetableId,
        name = name,
        teacher = teacher,
        location = location,
        dayOfWeek = dayOfWeek,
        startPeriod = startPeriod,
        endPeriod = endPeriod,
        color = color,
        textColor = textColor,
        weeksCsv = weeks.joinToString(","),
        remark = remark,
    )

    private fun CourseEntity.toDomain(): Course = Course(
        id = id,
        name = name,
        teacher = teacher,
        location = location,
        dayOfWeek = dayOfWeek,
        startPeriod = startPeriod,
        endPeriod = endPeriod,
        color = color,
        textColor = textColor,
        weeks = weeksCsv.split(",")
            .mapNotNull(String::toIntOrNull)
            .toList(),
        remark = remark,
    )

    private fun TimetableEntity.configOrDefault(): TimetableConfig =
        timetableConfigJsonCodec.decode(configJson, timetableId = id)
}
