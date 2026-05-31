package com.chronos.mobile.source.eduhtml

import com.chronos.mobile.domain.EducationalTimetableHtmlParser
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class EducationalTimetableHtmlModule {
    @Binds
    @Singleton
    abstract fun bindEducationalTimetableHtmlParser(
        parser: EducationalTimetableHtmlParserImpl,
    ): EducationalTimetableHtmlParser
}
