package com.chronos.mobile.data.local

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

@Dao
interface ChronosDao {
    @Query(
        """
        SELECT
            t.id AS id,
            t.name AS name,
            COUNT(c.id) AS courseCount,
            t.createdAt AS createdAt,
            t.updatedAt AS updatedAt
        FROM timetables t
        LEFT JOIN courses c ON c.timetableId = t.id
        GROUP BY t.id
        ORDER BY t.updatedAt DESC
        """,
    )
    fun observeTimetableSummaries(): Flow<List<TimetableSummaryRow>>

    @Query(
        """
        SELECT
            t.id AS id,
            t.name AS name,
            COUNT(c.id) AS courseCount,
            t.createdAt AS createdAt,
            t.updatedAt AS updatedAt
        FROM timetables t
        LEFT JOIN courses c ON c.timetableId = t.id
        GROUP BY t.id
        ORDER BY t.updatedAt DESC
        """,
    )
    suspend fun getTimetableSummariesSnapshot(): List<TimetableSummaryRow>

    @Transaction
    @Query("SELECT * FROM timetables WHERE id = :id LIMIT 1")
    fun observeTimetableById(id: String): Flow<TimetableWithCourses?>

    @Transaction
    @Query("SELECT * FROM timetables WHERE id = :id LIMIT 1")
    suspend fun getTimetableById(id: String): TimetableWithCourses?

    @Query("SELECT id FROM courses WHERE timetableId = :timetableId")
    suspend fun getCourseIdsByTimetableId(timetableId: String): List<String>

    @Query("SELECT timetableId FROM courses WHERE id = :courseId LIMIT 1")
    suspend fun getTimetableIdByCourseId(courseId: String): String?

    @Query("SELECT COUNT(*) FROM timetables")
    suspend fun getTimetableCount(): Int

    @Upsert
    suspend fun upsertTimetable(timetable: TimetableEntity)

    @Upsert
    suspend fun upsertCourses(courses: List<CourseEntity>)

    @Query("UPDATE timetables SET updatedAt = :updatedAt WHERE id = :id")
    suspend fun updateTimetableTimestamp(id: String, updatedAt: Long): Int

    @Query("DELETE FROM timetables WHERE id = :id")
    suspend fun deleteTimetable(id: String)

    @Query("DELETE FROM courses WHERE id = :courseId")
    suspend fun deleteCourse(courseId: String)

    @Query("DELETE FROM courses WHERE id IN (:courseIds)")
    suspend fun deleteCoursesByIds(courseIds: List<String>)

    @Transaction
    suspend fun upsertTimetableGraph(
        timetable: TimetableEntity,
        courses: List<CourseEntity>,
    ) {
        upsertTimetable(timetable)

        val persistedCourseIds = getCourseIdsByTimetableId(timetable.id).toSet()
        val incomingCourseIds = courses.asSequence().map { it.id }.toSet()
        val removedCourseIds = persistedCourseIds - incomingCourseIds

        if (removedCourseIds.isNotEmpty()) {
            deleteCoursesByIds(removedCourseIds.toList())
        }
        if (courses.isNotEmpty()) {
            upsertCourses(courses)
        }
    }

    @Transaction
    suspend fun upsertCourseForTimetable(
        timetableId: String,
        course: CourseEntity,
        updatedAt: Long,
    ) {
        if (updateTimetableTimestamp(timetableId, updatedAt) == 0) {
            return
        }
        upsertCourses(listOf(course))
    }

    @Transaction
    suspend fun deleteCourseAndTouchTimetable(
        courseId: String,
        updatedAt: Long,
    ) {
        val timetableId = getTimetableIdByCourseId(courseId)
        deleteCourse(courseId)
        if (timetableId != null) {
            updateTimetableTimestamp(timetableId, updatedAt)
        }
    }
}
