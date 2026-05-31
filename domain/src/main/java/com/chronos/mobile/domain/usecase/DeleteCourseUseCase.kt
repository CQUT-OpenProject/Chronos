package com.chronos.mobile.domain.usecase

import com.chronos.mobile.domain.TimetableRepository
import javax.inject.Inject

class DeleteCourseUseCase @Inject constructor(
    private val repository: TimetableRepository,
) {
    suspend operator fun invoke(courseId: String) {
        repository.deleteCourse(courseId)
    }
}
