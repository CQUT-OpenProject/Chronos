package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.Course
import com.chronos.mobile.domain.TimetableRepository
import com.chronos.mobile.domain.model.CourseDraft
import java.util.UUID
import javax.inject.Inject

class SaveCourseUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    suspend operator fun invoke(timetableId: String, draft: CourseDraft) {
        repository.saveCourse(
            timetableId = timetableId,
            course = Course(
                id = draft.id ?: UUID.randomUUID().toString(),
                name = draft.name.trim(),
                teacher = draft.teacher.trim(),
                location = draft.location.trim(),
                dayOfWeek = draft.dayOfWeek,
                startPeriod = draft.startPeriod,
                endPeriod = maxOf(draft.endPeriod, draft.startPeriod),
                color = draft.color,
                textColor = draft.textColor,
                weeks = draft.weeks,
                remark = draft.remark.trim(),
            ),
        )
    }
}
