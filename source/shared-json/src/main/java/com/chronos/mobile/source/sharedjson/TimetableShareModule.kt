package com.chronos.mobile.source.sharedjson

import com.chronos.mobile.domain.TimetableShareCodec
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class TimetableShareModule {
    @Binds
    @Singleton
    abstract fun bindTimetableShareCodec(
        codec: DefaultTimetableShareCodec,
    ): TimetableShareCodec
}
