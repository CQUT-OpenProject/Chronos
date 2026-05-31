package com.chronos.mobile.data.local

import androidx.room.testing.MigrationTestHelper
import androidx.sqlite.db.SupportSQLiteDatabase
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ChronosDatabaseMigrationTest {
    @get:Rule
    val helper = MigrationTestHelper(
        instrumentation = InstrumentationRegistry.getInstrumentation(),
        databaseClass = ChronosDatabase::class.java,
    )

    @Test
    fun migration1To2AddsDefaultCourseRemark() {
        helper.createDatabase(TEST_DATABASE, 1).apply {
            insertTimetable()
            insertCourse()
            close()
        }

        helper.runMigrationsAndValidate(
            TEST_DATABASE,
            2,
            true,
            ChronosDatabase.MIGRATION_1_2,
        ).use { database ->
            database.query("SELECT remark FROM courses WHERE id = 'course-1'").use { cursor ->
                assertTrue(cursor.moveToFirst())
                assertEquals("", cursor.getString(0))
            }
        }
    }

    private fun SupportSQLiteDatabase.insertTimetable() {
        execSQL(
            """
            INSERT INTO timetables (id, name, createdAt, updatedAt, configJson)
            VALUES ('timetable-1', '默认课表', 1, 1, '{}')
            """.trimIndent(),
        )
    }

    private fun SupportSQLiteDatabase.insertCourse() {
        execSQL(
            """
            INSERT INTO courses (
                id,
                timetableId,
                name,
                teacher,
                location,
                dayOfWeek,
                startPeriod,
                endPeriod,
                color,
                textColor,
                weeksCsv
            )
            VALUES (
                'course-1',
                'timetable-1',
                '编译原理',
                '张老师',
                'B201',
                1,
                1,
                2,
                '#EADDFF',
                '#21005D',
                '1,2,3'
            )
            """.trimIndent(),
        )
    }

    private companion object {
        const val TEST_DATABASE = "chronos-migration-test"
    }
}
