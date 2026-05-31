package com.chronos.mobile.domain.usecase

import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.core.model.Course
import com.chronos.mobile.core.model.OnlineSchedulePayload
import com.chronos.mobile.core.model.PeriodTime
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableImportSource
import com.chronos.mobile.core.model.TimetableSummary
import com.chronos.mobile.core.model.TimetableViewPrefs
import com.chronos.mobile.core.model.ThemeMode
import com.chronos.mobile.domain.AcademicCalendarService
import com.chronos.mobile.domain.EducationalTimetableHtmlParser
import com.chronos.mobile.domain.ImportMode
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.TimetableRepository
import com.chronos.mobile.domain.TimetableShareCodec
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.model.CourseDraft
import com.chronos.mobile.domain.model.PeriodTimeDraft
import com.chronos.mobile.domain.model.TimetableSettingsDraft
import com.chronos.mobile.domain.model.TimetableImportMetadataDraft
import com.chronos.mobile.domain.model.TimetableViewPrefsDraft
import com.chronos.mobile.domain.model.AcademicConfigDraft
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asSuccess
import java.time.LocalDate
import java.time.LocalTime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class DomainUseCaseTest {
    private val academicCalendarService = AcademicCalendarService()

    @Test
    fun `calculateAcademicWeek clamps before term start`() {
        val useCase = CalculateAcademicWeekUseCase()
        val academicConfig = AcademicConfig(
            termStartDate = "2026-03-09",
            startWeek = 3,
            endWeek = 18,
        )

        val result = useCase(LocalDate.parse("2026-03-01"), academicConfig)

        assertEquals(3, result)
    }

    @Test
    fun `academicCalendarService normalizes non monday term start date`() {
        val weekStart = academicCalendarService.resolveWeekStart(
            academicConfig = AcademicConfig(
                termStartDate = "2026-03-03",
                startWeek = 1,
                endWeek = 20,
            ),
            week = 2,
            referenceDate = LocalDate.parse("2026-03-09"),
        )

        assertEquals(LocalDate.parse("2026-03-09"), weekStart)
    }

    @Test
    fun `saveTimetableDetails normalizes fields and updates structured config`() = runBlocking {
        val repo = FakeTimetableRepository()
        val timetable = repo.seedCurrent()
        val useCase = SaveTimetableDetailsUseCase(
            repository = repo,
            academicCalendarService = academicCalendarService,
            timeProvider = FixedTimeProvider(),
        )

        useCase(
            timetable.id,
            TimetableSettingsDraft(
                name = " ",
                academicConfig = AcademicConfigDraft(
                    termStartDate = "2026-03-03",
                    startWeek = 0,
                    endWeek = 0,
                    periodTimes = listOf(
                        PeriodTimeDraft(index = 3, startTime = " ", endTime = "11:00"),
                        PeriodTimeDraft(index = 1, startTime = "08:00", endTime = " "),
                    ),
                ),
                importMetadata = TimetableImportMetadataDraft(
                    source = TimetableImportSource.FILE_HTML,
                ),
                viewPrefs = TimetableViewPrefsDraft(
                    showSaturday = false,
                    showSunday = true,
                    showNonCurrentWeekCourses = true,
                ),
            ),
        )

        val saved = repo.getTimetable(timetable.id)
        assertNotNull(saved)
        assertEquals("未命名课表", saved?.name)
        assertEquals("2026-03-02", saved?.academicConfig?.termStartDate)
        assertEquals(1, saved?.academicConfig?.startWeek)
        assertEquals(1, saved?.academicConfig?.endWeek)
        assertEquals(TimetableImportSource.FILE_HTML, saved?.importMetadata?.source)
        assertEquals(false, saved?.viewPrefs?.showSaturday)
        assertEquals(true, saved?.viewPrefs?.showSunday)
        assertEquals(true, saved?.viewPrefs?.showNonCurrentWeekCourses)
        assertEquals(2, saved?.academicConfig?.periodTimes?.size)
        assertEquals("08:00", saved?.academicConfig?.periodTimes?.first()?.startTime)
    }

    @Test
    fun `createTimetable uses time provider for defaults`() = runBlocking {
        val repo = FakeTimetableRepository()
        val useCase = CreateTimetableUseCase(
            repository = repo,
            academicCalendarService = academicCalendarService,
            timeProvider = FixedTimeProvider(),
        )

        useCase(" ")

        val current = repo.getAppStateSnapshot().currentTimetable
        assertNotNull(current)
        assertEquals("未命名课表", current?.name)
        assertEquals("2026-03-02", current?.academicConfig?.termStartDate)
        assertEquals(100L, current?.createdAt)
        assertEquals(100L, current?.updatedAt)
    }

    @Test
    fun `importTimetable overwrite preserves identity and view prefs while replacing structure`() = runBlocking {
        val repo = FakeTimetableRepository()
        val existing = repo.seedCurrent()
        val imported = repo.sampleImportedTimetable().copy(
            academicConfig = AcademicConfig(
                termStartDate = "2026-02-23",
                startWeek = 2,
                endWeek = 16,
                periodTimes = listOf(PeriodTime(index = 1, startTime = "08:00", endTime = "08:45")),
            ),
            importMetadata = TimetableImportMetadata(source = TimetableImportSource.FILE_HTML),
            viewPrefs = TimetableViewPrefs(
                showSaturday = false,
                showSunday = false,
                showNonCurrentWeekCourses = false,
            ),
        )
        val useCase = ImportTimetableUseCase(
            repository = repo,
            educationalTimetableHtmlParser = FakeHtmlParser(null),
            timetableShareCodec = FakeTimetableShareCodec(imported),
        )

        useCase("ignored", ImportMode.OVERWRITE_CURRENT)

        val current = repo.getAppStateSnapshot().currentTimetable
        assertEquals(existing.id, current?.id)
        assertEquals(existing.name, current?.name)
        assertEquals(existing.createdAt, current?.createdAt)
        assertEquals(existing.viewPrefs, current?.viewPrefs)
        assertEquals(imported.academicConfig, current?.academicConfig)
        assertEquals(imported.importMetadata, current?.importMetadata)
        assertEquals("${existing.id}:1", current?.courses?.first()?.id)
    }

    @Test
    fun `importTimetable as new keeps imported view prefs and structure`() = runBlocking {
        val repo = FakeTimetableRepository()
        repo.seedCurrent()
        val imported = repo.sampleImportedTimetable().copy(
            viewPrefs = TimetableViewPrefs(
                showSaturday = false,
                showSunday = true,
                showNonCurrentWeekCourses = true,
            ),
            importMetadata = TimetableImportMetadata(source = TimetableImportSource.ONLINE_EDU),
        )
        val useCase = ImportTimetableUseCase(
            repository = repo,
            educationalTimetableHtmlParser = FakeHtmlParser(imported),
            timetableShareCodec = FakeTimetableShareCodec(imported),
        )

        useCase("html", ImportMode.AS_NEW)

        val current = repo.getAppStateSnapshot().currentTimetable
        assertNotNull(current)
        assertNotEquals(imported.id, current?.id)
        assertEquals(imported.viewPrefs, current?.viewPrefs)
        assertEquals(imported.importMetadata, current?.importMetadata)
    }

    @Test
    fun `previewOnlineTimetable stamps online import source`() = runBlocking {
        val codecTimetable = sampleTimetable().copy(importMetadata = TimetableImportMetadata())
        val useCase = PreviewOnlineTimetableUseCase(
            remoteTimetableSource = FakeRemoteTimetableSource(),
            timetableShareCodec = FakeTimetableShareCodec(codecTimetable),
        )

        val result = useCase(AuthSnapshot(account = "10001", password = "pwd"))
        val timetable = (result as AppResult.Success).value

        assertEquals(TimetableImportSource.ONLINE_EDU, timetable.importMetadata.source)
    }

    private fun sampleTimetable(): Timetable = Timetable(
        id = "t1",
        name = "课表",
        courses = listOf(
            Course(
                id = "c1",
                name = "编译原理",
                teacher = "张老师",
                location = "B201",
                dayOfWeek = 1,
                startPeriod = 1,
                endPeriod = 2,
                color = "#EADDFF",
                textColor = "#21005D",
            ),
        ),
        createdAt = 1L,
        updatedAt = 1L,
        academicConfig = AcademicConfig(),
        importMetadata = TimetableImportMetadata(),
        viewPrefs = TimetableViewPrefs(),
    )
}

private class FixedTimeProvider : TimeProvider {
    override fun today(): LocalDate = LocalDate.parse("2026-03-04")
    override fun currentTime(): LocalTime = LocalTime.parse("09:00")
    override fun currentTimeMillis(): Long = 100L
}

private class FakeHtmlParser(
    private val timetable: Timetable?,
) : EducationalTimetableHtmlParser {
    override fun parse(content: String): AppResult<Timetable?> = timetable.asSuccess()
    override fun parse(contentBytes: ByteArray): AppResult<Timetable?> = timetable.asSuccess()
}

private class FakeRemoteTimetableSource : com.chronos.mobile.domain.RemoteTimetableSource {
    override suspend fun fetchSchedule(
        authSnapshot: AuthSnapshot,
        weekNum: String?,
        yearTerm: String?,
    ): AppResult<OnlineSchedulePayload> = OnlineSchedulePayload(yearTerm = "2025-2026-2").asSuccess()
}

private class FakeTimetableShareCodec(
    private val timetable: Timetable,
) : TimetableShareCodec {
    override fun decode(json: String): AppResult<OnlineSchedulePayload> = OnlineSchedulePayload().asSuccess()
    override fun encode(timetable: Timetable): AppResult<String> = "{}".asSuccess()
    override fun toTimetable(payload: OnlineSchedulePayload): AppResult<Timetable> = timetable.asSuccess()
}

private class FakeTimetableRepository : TimetableRepository {
    private val timetables = linkedMapOf<String, Timetable>()
    private var currentTimetableId: String? = null
    private var wallpaperUri: String? = null
    private var themeMode: ThemeMode = ThemeMode.SYSTEM
    private var useDynamicColor: Boolean = false
    private val state = MutableStateFlow(AppState())

    override val appState: Flow<AppState> = state

    fun seedCurrent(): Timetable {
        val timetable = sampleImportedTimetable().copy(
            id = "current-id",
            name = "当前课表",
            createdAt = 50L,
            viewPrefs = TimetableViewPrefs(
                showSaturday = true,
                showSunday = false,
                showNonCurrentWeekCourses = true,
            ),
        )
        timetables[timetable.id] = timetable
        currentTimetableId = timetable.id
        syncState()
        return timetable
    }

    override suspend fun getAppStateSnapshot(): AppState = state.value
    override suspend fun getTimetable(id: String): Timetable? = timetables[id]
    override suspend fun saveTimetable(timetable: Timetable) {
        timetables[timetable.id] = timetable
        if (currentTimetableId == null) currentTimetableId = timetable.id
        syncState()
    }

    override suspend fun saveCourse(timetableId: String, course: Course) {
        val timetable = timetables[timetableId] ?: return
        timetables[timetableId] = timetable.copy(courses = timetable.courses + course)
        syncState()
    }

    override suspend fun deleteCourse(courseId: String) = Unit
    override suspend fun deleteTimetable(id: String) {
        timetables.remove(id)
        if (currentTimetableId == id) currentTimetableId = timetables.keys.firstOrNull()
        syncState()
    }

    override suspend fun setCurrentTimetableId(id: String?) {
        currentTimetableId = id
        syncState()
    }

    override suspend fun setWallpaper(uri: String?) {
        wallpaperUri = uri
        syncState()
    }

    override suspend fun setThemeMode(mode: ThemeMode) {
        themeMode = mode
        syncState()
    }

    override suspend fun setUseDynamicColor(enabled: Boolean) {
        useDynamicColor = enabled
        syncState()
    }

    fun sampleImportedTimetable(): Timetable = Timetable(
        id = "imported-id",
        name = "导入课表",
        createdAt = 1L,
        updatedAt = 1L,
        courses = listOf(
            Course(
                id = "imported-course",
                name = "编译原理",
                teacher = "张老师",
                location = "B201",
                dayOfWeek = 1,
                startPeriod = 1,
                endPeriod = 2,
                color = "#EADDFF",
                textColor = "#21005D",
            ),
        ),
        academicConfig = AcademicConfig(),
        importMetadata = TimetableImportMetadata(source = TimetableImportSource.SHARED_JSON),
        viewPrefs = TimetableViewPrefs(),
    )

    private fun syncState() {
        val current = currentTimetableId?.let(timetables::get)
        state.value = AppState(
            timetables = timetables.values.map { timetable ->
                TimetableSummary(
                    id = timetable.id,
                    name = timetable.name,
                    courseCount = timetable.courses.size,
                    createdAt = timetable.createdAt,
                    updatedAt = timetable.updatedAt,
                )
            },
            currentTimetableId = currentTimetableId,
            wallpaperUri = wallpaperUri,
            currentTimetable = current,
            themeMode = themeMode,
            useDynamicColor = useDynamicColor,
        )
    }
}
