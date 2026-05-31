package com.chronos.mobile.source.sharedjson

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.OnlineScheduleEvent
import com.chronos.mobile.core.model.OnlineSchedulePayload
import com.chronos.mobile.core.model.OnlineScheduleWeekDay
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableImportSource
import com.chronos.mobile.core.model.TimetableViewPrefs
import com.chronos.mobile.core.model.currentWeekMonday
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.TimetableShareCodec
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.appResultOf
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalAdjusters
import javax.inject.Inject
import kotlinx.serialization.json.Json
import kotlin.math.abs

class DefaultTimetableShareCodec @Inject constructor(
    private val academicCalendarService: AcademicCalendarService,
    private val timeProvider: TimeProvider,
) : TimetableShareCodec {
    private val json = Json {
        encodeDefaults = true
        explicitNulls = false
        ignoreUnknownKeys = true
        prettyPrint = false
    }

    override fun decode(json: String): AppResult<OnlineSchedulePayload> = appResultOf(
        errorMapper = { AppError.DataFormat("在线课表 JSON 解析失败") },
    ) {
        this.json.decodeFromString(OnlineSchedulePayload.serializer(), json)
    }

    override fun encode(timetable: Timetable): AppResult<String> = appResultOf(
        errorMapper = { AppError.DataFormat("课表导出失败") },
    ) {
        json.encodeToString(OnlineSchedulePayload.serializer(), timetable.toOnlinePayload())
    }

    override fun toTimetable(payload: OnlineSchedulePayload): AppResult<Timetable> {
        val courses = payload.eventList.mapIndexedNotNull { index, event -> event.toCourseOrNull(index) }
        if (courses.isEmpty()) {
            return AppError.Validation("JSON 中未找到可导入的课程数据").asFailure()
        }
        val now = timeProvider.currentTimeMillis()
        val today = timeProvider.today()
        val maxWeek = (payload.weekList.mapNotNull(String::toIntOrNull).maxOrNull()
            ?: courses.flatMap { it.weeks }.maxOrNull()
            ?: 20).coerceAtLeast(20)
        return Timetable(
            id = "online-import",
            name = payload.yearTerm.ifBlank { "在线课表" },
            courses = courses.sortedWith(compareBy<Course> { it.dayOfWeek }.thenBy { it.startPeriod }.thenBy { it.name }),
            createdAt = now,
            updatedAt = now,
            academicConfig = AcademicConfig(
                termStartDate = resolveImportedTermStartDate(payload, today),
                endWeek = maxWeek,
            ),
            importMetadata = TimetableImportMetadata(
                source = payload.importSource.toTimetableImportSourceOrNull() ?: TimetableImportSource.SHARED_JSON,
            ),
            viewPrefs = TimetableViewPrefs(
                showSaturday = courses.any { it.dayOfWeek == 6 },
                showSunday = courses.any { it.dayOfWeek == 7 },
            ),
        ).asSuccess()
    }

    private fun Timetable.toOnlinePayload(): OnlineSchedulePayload {
        val today = timeProvider.today()
        val academicWeek = academicCalendarService.calculateAcademicWeek(today, academicConfig)
        val weekStart = academicCalendarService.resolveWeekStart(
            academicConfig = academicConfig,
            week = academicWeek,
            referenceDate = today,
        )
        val weekNum = academicWeek.toString()
        val weekList = (academicConfig.startWeek..academicConfig.endWeek).map(Int::toString)
        val importSource = importMetadata.source
        return OnlineSchedulePayload(
            yearTerm = name,
            weekNum = weekNum,
            nowMonth = weekStart.monthValue.toString(),
            importSource = importSource.name,
            termStartDate = exportTermStartDate(importSource, academicConfig, today),
            yearTermList = listOf(name),
            weekList = weekList,
            weekDayList = buildWeekDayList(today, weekStart),
            eventList = courses.map { it.toOnlineEvent(weekNum) },
        )
    }

    private fun exportTermStartDate(
        importSource: TimetableImportSource,
        academicConfig: AcademicConfig,
        referenceDate: LocalDate,
    ): String? = when (importSource) {
        TimetableImportSource.ONLINE_EDU -> null
        TimetableImportSource.FILE_HTML,
        TimetableImportSource.SHARED_JSON,
        TimetableImportSource.UNKNOWN -> academicCalendarService.normalizeTermStartDate(academicConfig.termStartDate, referenceDate).toString()
    }

    private fun buildWeekDayList(
        referenceDate: LocalDate,
        weekStart: LocalDate,
    ): List<OnlineScheduleWeekDay> {
        val formatter = DateTimeFormatter.ofPattern("MM/dd")
        return (0..6).map { offset ->
            val date = weekStart.plusDays(offset.toLong())
            OnlineScheduleWeekDay(
                weekDay = when (offset) {
                    0 -> "一"
                    1 -> "二"
                    2 -> "三"
                    3 -> "四"
                    4 -> "五"
                    5 -> "六"
                    else -> "日"
                },
                weekDate = date.format(formatter),
                today = date == referenceDate,
            )
        }
    }

    private fun resolveImportedTermStartDate(
        payload: OnlineSchedulePayload,
        referenceDate: LocalDate,
    ): String {
        val inferred = when (payload.importSource.toTimetableImportSourceOrNull()) {
            TimetableImportSource.ONLINE_EDU -> inferImportedTermStartDate(payload, referenceDate)
            else -> payload.termStartDate
                ?.trim()
                ?.takeIf(String::isNotBlank)
                ?.let(::parseImportedTermStartDate)
                ?: inferImportedTermStartDate(payload, referenceDate)
        }
        return academicCalendarService
            .normalizeTermStartDate((inferred ?: currentWeekMonday(referenceDate)).toString(), referenceDate)
            .toString()
    }

    private fun parseImportedTermStartDate(value: String): LocalDate? =
        runCatching { LocalDate.parse(value) }.getOrNull()

    private fun inferImportedTermStartDate(
        payload: OnlineSchedulePayload,
        referenceDate: LocalDate,
    ): LocalDate? {
        val currentWeek = payload.weekNum.trim().toIntOrNull()?.takeIf { it > 0 } ?: return null
        val weekDays = payload.weekDayList.mapNotNull { it.toImportWeekDayInfo() }
        val anchor = weekDays.firstOrNull { it.dayOfWeek == 1 } ?: weekDays.firstOrNull() ?: return null
        val anchorYear = inferImportWeekDateYear(
            month = anchor.month,
            day = anchor.day,
            yearTerm = payload.yearTerm,
            referenceDate = referenceDate,
        ) ?: return null
        val anchorDate = runCatching { LocalDate.of(anchorYear, anchor.month, anchor.day) }.getOrNull() ?: return null
        val weekStart = anchorDate.minusDays((anchor.dayOfWeek - 1).toLong())
        return weekStart
            .minusWeeks((currentWeek - 1).toLong())
            .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
    }

    private fun OnlineScheduleWeekDay.toImportWeekDayInfo(): ImportWeekDayInfo? {
        val dayOfWeek = weekDay.toImportDayOfWeekOrNull() ?: return null
        val (month, day) = weekDate.toImportMonthDayOrNull() ?: return null
        return ImportWeekDayInfo(dayOfWeek = dayOfWeek, month = month, day = day)
    }

    private fun inferImportWeekDateYear(
        month: Int,
        day: Int,
        yearTerm: String,
        referenceDate: LocalDate,
    ): Int? {
        parseAcademicYears(yearTerm)?.let { (firstYear, secondYear) ->
            val primaryYear = if (month in 8..12) firstYear else secondYear
            if (isValidDate(primaryYear, month, day)) return primaryYear

            val secondaryYear = if (primaryYear == firstYear) secondYear else firstYear
            if (isValidDate(secondaryYear, month, day)) return secondaryYear
        }

        return listOf(referenceDate.year - 1, referenceDate.year, referenceDate.year + 1)
            .mapNotNull { year -> runCatching { LocalDate.of(year, month, day) }.getOrNull() }
            .minByOrNull { candidate -> abs(ChronoUnit.DAYS.between(referenceDate, candidate)) }
            ?.year
    }

    private fun parseAcademicYears(yearTerm: String): Pair<Int, Int>? {
        val match = ACADEMIC_YEAR_PATTERN.find(yearTerm) ?: return null
        val firstYear = match.groupValues.getOrNull(1)?.toIntOrNull() ?: return null
        val secondYear = match.groupValues.getOrNull(2)?.toIntOrNull() ?: return null
        return firstYear to secondYear
    }

    private fun isValidDate(year: Int, month: Int, day: Int): Boolean = runCatching {
        LocalDate.of(year, month, day)
    }.isSuccess

    private fun String.toImportDayOfWeekOrNull(): Int? = when (trim().lowercase()) {
        "1", "一", "周一", "星期一", "mon", "monday" -> 1
        "2", "二", "周二", "星期二", "tue", "tuesday" -> 2
        "3", "三", "周三", "星期三", "wed", "wednesday" -> 3
        "4", "四", "周四", "星期四", "thu", "thursday" -> 4
        "5", "五", "周五", "星期五", "fri", "friday" -> 5
        "6", "六", "周六", "星期六", "sat", "saturday" -> 6
        "7", "日", "天", "周日", "星期日", "sun", "sunday" -> 7
        else -> null
    }

    private fun String.toImportMonthDayOrNull(): Pair<Int, Int>? {
        val parts = trim().split("/")
        if (parts.size != 2) return null
        val month = parts[0].toIntOrNull() ?: return null
        val day = parts[1].toIntOrNull() ?: return null
        if (month !in 1..12 || day !in 1..31) return null
        return month to day
    }

    private fun OnlineScheduleEvent.toCourseOrNull(index: Int): Course? {
        val normalizedName = eventName.normalizedCourseName()
        val dayOfWeek = weekDay.trim().toImportDayOfWeekOrNull() ?: return null
        val startPeriod = sessionStart.trim().toIntOrNull() ?: return null
        if (normalizedName.isBlank()) return null
        val duration = sessionLast.trim().toIntOrNull()?.coerceAtLeast(1)
        val weeks = weekList.mapNotNull(String::toIntOrNull).distinct().sorted()
        val (background, foreground) = coursePalette(normalizedName)
        val endPeriod = sessionList
            .mapNotNull { it.trim().toIntOrNull() }
            .maxOrNull()
            ?: duration?.let { startPeriod + it - 1 }
            ?: startPeriod
        return Course(
            id = eventID.ifBlank { "online-course-${index + 1}" },
            name = normalizedName,
            teacher = memberName.trim(),
            location = address.trim(),
            dayOfWeek = dayOfWeek,
            startPeriod = startPeriod,
            endPeriod = endPeriod.coerceAtLeast(startPeriod),
            color = background,
            textColor = foreground,
            weeks = weeks,
            remark = remark.trim(),
        )
    }

    private fun Course.toOnlineEvent(currentWeek: String): OnlineScheduleEvent = OnlineScheduleEvent(
        weekNum = currentWeek,
        weekDay = dayOfWeek.toString(),
        weekList = weeks.map(Int::toString),
        weekCover = weeks.toWeekCover(),
        sessionList = (startPeriod..endPeriod).map(Int::toString),
        sessionStart = startPeriod.toString(),
        sessionLast = (endPeriod - startPeriod + 1).toString(),
        eventName = name,
        address = location,
        memberName = teacher,
        remark = remark,
        duplicateGroupType = "none",
        duplicateGroup = 0,
        eventType = "course",
        eventID = id,
    )

    private fun List<Int>.toWeekCover(): String = when {
        isEmpty() -> ""
        size == 1 -> "${first()}周"
        else -> "${first()}-${last()}周"
    }

    private fun String.toTimetableImportSourceOrNull(): TimetableImportSource? =
        TimetableImportSource.entries.firstOrNull { it.name.equals(trim(), ignoreCase = true) }

    private fun coursePalette(name: String): Pair<String, String> =
        COURSE_PALETTE[name.hashCode().mod(COURSE_PALETTE.size)]

    private fun String.normalizedCourseName(): String =
        removePrefix("【调】")
            .removeSuffix("★")
            .removeSuffix("☆")
            .removeSuffix("〇")
            .removeSuffix("■")
            .removeSuffix("◆")
            .trim()

    private data class ImportWeekDayInfo(
        val dayOfWeek: Int,
        val month: Int,
        val day: Int,
    )

    private companion object {
        val ACADEMIC_YEAR_PATTERN = Regex("(20\\d{2})\\D+(20\\d{2})")
        val COURSE_PALETTE = listOf(
            "#EADDFF" to "#21005D",
            "#FFDBC9" to "#311100",
            "#C4EED0" to "#072711",
            "#F9DEDC" to "#410E0B",
            "#D3E3FD" to "#041E49",
            "#FFD8E4" to "#31111D",
        )
    }
}
