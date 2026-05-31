package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.EducationalTimetableHtmlParser
import com.chronos.mobile.domain.ImportMode
import com.chronos.mobile.domain.TimetableRepository
import com.chronos.mobile.domain.TimetableShareCodec
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import com.chronos.mobile.domain.result.flatMap
import java.util.UUID
import javax.inject.Inject

data class ImportTimetableResult(
    val timetableId: String,
    val mode: ImportMode,
)

class ImportTimetableUseCase @Inject constructor(
    private val repository: TimetableRepository,
    private val educationalTimetableHtmlParser: EducationalTimetableHtmlParser,
    private val timetableShareCodec: TimetableShareCodec,
) {
    suspend operator fun invoke(content: String, mode: ImportMode): AppResult<ImportTimetableResult> =
        educationalTimetableHtmlParser.parse(content).flatMap { imported ->
            imported?.let { AppResult.Success(it) }
                ?: timetableShareCodec.decode(content).flatMap(timetableShareCodec::toTimetable)
        }.flatMap { imported ->
            import(imported, mode)
        }

    suspend fun import(
        imported: Timetable,
        mode: ImportMode,
    ): AppResult<ImportTimetableResult> = when (mode) {
        ImportMode.AS_NEW -> {
            val now = System.currentTimeMillis()
            val newTimetableId = UUID.randomUUID().toString()
            val newTimetable = imported.copy(
                id = newTimetableId,
                createdAt = now,
                updatedAt = now,
                courses = imported.withAssignedCourseIds(newTimetableId),
            )
            repository.saveTimetable(newTimetable)
            repository.setCurrentTimetableId(newTimetable.id)
            ImportTimetableResult(timetableId = newTimetable.id, mode = mode).asSuccess()
        }

        ImportMode.OVERWRITE_CURRENT -> {
            val currentTimetable = repository.getAppStateSnapshot().currentTimetable
                ?: return AppError.NotFound("当前没有可覆盖的课程表").asFailure()
            val overwritten = imported.copy(
                id = currentTimetable.id,
                name = currentTimetable.name,
                createdAt = currentTimetable.createdAt,
                updatedAt = System.currentTimeMillis(),
                courses = imported.withAssignedCourseIds(currentTimetable.id),
                viewPrefs = currentTimetable.viewPrefs,
            )
            repository.saveTimetable(overwritten)
            ImportTimetableResult(timetableId = overwritten.id, mode = mode).asSuccess()
        }
    }

    private fun Timetable.withAssignedCourseIds(timetableId: String) = courses.mapIndexed { index, course ->
        course.copy(id = "$timetableId:${index + 1}")
    }
}
