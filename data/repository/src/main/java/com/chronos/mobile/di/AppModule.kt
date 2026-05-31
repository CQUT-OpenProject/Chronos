package com.chronos.mobile.di

import android.content.Context
import androidx.room.Room
import com.chronos.mobile.data.local.ChronosDao
import com.chronos.mobile.data.local.ChronosDatabase
import com.chronos.mobile.data.repository.OfflineTimetableRepository
import com.chronos.mobile.domain.SystemTimeProvider
import com.chronos.mobile.domain.TimeProvider
import com.chronos.mobile.domain.TimetableRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideChronosDatabase(
        @ApplicationContext context: Context,
    ): ChronosDatabase = Room.databaseBuilder(
        context,
        ChronosDatabase::class.java,
        "chronos.db",
    ).addMigrations(ChronosDatabase.MIGRATION_1_2).build()

    @Provides
    fun provideChronosDao(database: ChronosDatabase): ChronosDao = database.chronosDao()

    @Provides
    @Singleton
    fun provideTimetableRepository(
        repository: OfflineTimetableRepository,
    ): TimetableRepository = repository

    @Provides
    @Singleton
    fun provideTimeProvider(): TimeProvider = SystemTimeProvider()
}
