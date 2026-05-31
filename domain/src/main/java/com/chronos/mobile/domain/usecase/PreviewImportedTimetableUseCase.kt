package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.EducationalTimetableHtmlParser
import com.chronos.mobile.domain.TimetableShareCodec
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.flatMap
import javax.inject.Inject

class PreviewImportedTimetableUseCase @Inject constructor(
    private val educationalTimetableHtmlParser: EducationalTimetableHtmlParser,
    private val timetableShareCodec: TimetableShareCodec,
) {
    fun previewHtml(contentBytes: ByteArray): AppResult<Timetable> =
        educationalTimetableHtmlParser.parse(contentBytes).flatMap { timetable ->
            timetable?.let { AppResult.Success(it) }
                ?: AppError.Validation("导入失败，未识别到可用的教务课表 HTML 内容").asFailure()
        }

    operator fun invoke(content: String): AppResult<Timetable> =
        educationalTimetableHtmlParser.parse(content).flatMap { timetable ->
            timetable?.let { AppResult.Success(it) }
                ?: timetableShareCodec.decode(content).flatMap(timetableShareCodec::toTimetable)
        }
}
