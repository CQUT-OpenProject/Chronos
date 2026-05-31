package com.chronos.mobile.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

@Database(
    entities = [TimetableEntity::class, CourseEntity::class],
    version = 2,
    exportSchema = true,
)
abstract class ChronosDatabase : RoomDatabase() {
    abstract fun chronosDao(): ChronosDao

    companion object {
        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("ALTER TABLE courses ADD COLUMN remark TEXT NOT NULL DEFAULT ''")
            }
        }
    }
}
