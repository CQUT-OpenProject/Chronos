package com.chronos.mobile.source.eduhtml

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableImportSource
import com.chronos.mobile.core.model.TimetableViewPrefs
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.EducationalTimetableHtmlParser
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.asSuccess
import java.io.ByteArrayInputStream
import java.util.UUID
import javax.inject.Inject
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.nodes.Element

class EducationalTimetableHtmlParserImpl @Inject constructor(
    private val academicCalendarService: AcademicCalendarService,
    private val timeProvider: TimeProvider,
) : EducationalTimetableHtmlParser {
    override fun parse(content: String): AppResult<Timetable?> = parseDocument(Jsoup.parse(content))

    override fun parse(contentBytes: ByteArray): AppResult<Timetable?> {
        val document = ByteArrayInputStream(contentBytes).use { inputStream ->
            Jsoup.parse(inputStream, null, "")
        }
        return parseDocument(document)
    }

    private fun parseDocument(document: Document): AppResult<Timetable?> {
        val table = document.selectFirst("#kbgrid_table_0") ?: return null.asSuccess()
        val titleContainer = table.selectFirst(".timetable_title")
        val term = titleContainer
            ?.selectFirst("h6.pull-left")
            ?.text()
            .orEmpty()
            .normalizeWhitespace()
        val studentName = titleContainer
            ?.ownText()
            .orEmpty()
            .removeSuffix("的课表")
            .normalizeWhitespace()
        val courses = table.select("td.td_wrap[id]").flatMap(::parseCellCourses)

        if (courses.isEmpty()) {
            return AppError.Validation("HTML 中未找到可导入的课程数据").asFailure()
        }

        val now = timeProvider.currentTimeMillis()
        val maxWeek = courses.flatMap { it.weeks }.maxOrNull() ?: 20
        return Timetable(
            id = UUID.randomUUID().toString(),
            name = when {
                studentName.isNotBlank() -> "${studentName}的课表"
                term.isNotBlank() -> term
                else -> "导入课表"
            },
            courses = courses,
            createdAt = now,
            updatedAt = now,
            academicConfig = AcademicConfig(
                termStartDate = academicCalendarService
                    .normalizeTermStartDate("", timeProvider.today())
                    .toString(),
                endWeek = maxOf(20, maxWeek),
            ),
            importMetadata = TimetableImportMetadata(source = TimetableImportSource.FILE_HTML),
            viewPrefs = TimetableViewPrefs(
                showSaturday = courses.any { it.dayOfWeek == 6 },
                showSunday = courses.any { it.dayOfWeek == 7 },
            ),
        ).asSuccess()
    }

    private fun parseCellCourses(cell: Element): List<Course> {
        val dayOfWeek = cell.id().substringBefore('-').toIntOrNull() ?: return emptyList()
        val startPeriod = cell.id().substringAfter('-').toIntOrNull() ?: return emptyList()
        val endPeriod = startPeriod + (cell.attr("rowspan").toIntOrNull() ?: 1) - 1

        return cell.children()
            .filter { it.hasClass("timetable_con") }
            .mapIndexedNotNull { blockIndex, block ->
                val rawTitle = block.selectFirst(".title")?.text().orEmpty().normalizeWhitespace()
                if (rawTitle.isBlank()) return@mapIndexedNotNull null
                val metadata = block.select("p")
                    .mapNotNull { paragraph ->
                        val key = paragraph.selectFirst("[title]")?.attr("title").orEmpty().normalizeWhitespace()
                        if (key.isBlank()) null else key to paragraph.text().normalizeWhitespace()
                    }
                    .toMap()
                val (background, foreground) = coursePalette(rawTitle.normalizedCourseName())
                Course(
                    id = buildParsedCourseId(dayOfWeek, startPeriod, endPeriod, blockIndex, rawTitle),
                    name = rawTitle.normalizedCourseName(),
                    teacher = metadata["教师"].orEmpty(),
                    location = metadata["上课地点"].orEmpty(),
                    dayOfWeek = dayOfWeek,
                    startPeriod = startPeriod,
                    endPeriod = endPeriod,
                    color = background,
                    textColor = foreground,
                    weeks = parseWeeks(metadata["节/周"].orEmpty()),
                )
            }
    }

    private fun parseWeeks(raw: String): List<Int> = sortedSetOf<Int>().apply {
        WEEK_TOKEN.findAll(raw.removeWhitespace()).forEach { match ->
            val token = match.value
            val parity = when {
                token.contains("(单)") -> WeekParity.ODD
                token.contains("(双)") -> WeekParity.EVEN
                else -> WeekParity.ALL
            }
            val normalized = token.replace("周", "").replace("(单)", "").replace("(双)", "")
            val separatorIndex = normalized.indexOf('-')
            val start = normalized.substringBefore('-').toInt()
            val end = if (separatorIndex >= 0) normalized.substring(separatorIndex + 1).toIntOrNull() ?: start else start
            for (week in start..end) {
                if (parity.matches(week)) add(week)
            }
        }
    }.toList()

    private fun coursePalette(name: String): Pair<String, String> = COURSE_PALETTE[name.hashCode().mod(COURSE_PALETTE.size)]

    private fun buildParsedCourseId(dayOfWeek: Int, startPeriod: Int, endPeriod: Int, blockIndex: Int, rawTitle: String): String =
        "$dayOfWeek-$startPeriod-$endPeriod-$blockIndex-${rawTitle.hashCode()}"

    private fun String.normalizedCourseName(): String =
        removePrefix("【调】").removeSuffix("★").removeSuffix("☆").removeSuffix("〇").removeSuffix("■").removeSuffix("◆").normalizeWhitespace()

    private fun String.normalizeWhitespace(): String = trim().replace(WHITESPACE_REGEX, " ")

    private fun String.removeWhitespace(): String = replace(WHITESPACE_REGEX, "")

    private enum class WeekParity {
        ALL,
        ODD,
        EVEN;

        fun matches(week: Int): Boolean = when (this) {
            ALL -> true
            ODD -> week % 2 == 1
            EVEN -> week % 2 == 0
        }
    }

    private companion object {
        val COURSE_PALETTE = listOf(
            "#EADDFF" to "#21005D",
            "#FFDBC9" to "#311100",
            "#C4EED0" to "#072711",
            "#F9DEDC" to "#410E0B",
            "#D3E3FD" to "#041E49",
            "#FFD8E4" to "#31111D",
        )
        val WHITESPACE_REGEX = Regex("\\s+")
        val WEEK_TOKEN = Regex("""\d+(?:-\d+)?周(?:\((?:单|双)\))?""")
    }
}
