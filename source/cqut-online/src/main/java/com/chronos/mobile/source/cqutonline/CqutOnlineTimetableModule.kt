package com.chronos.mobile.source.cqutonline

import com.chronos.mobile.domain.RemoteTimetableSource
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class CqutOnlineTimetableModule {
    @Binds
    @Singleton
    abstract fun bindRemoteTimetableSource(
        source: CqutOnlineTimetableSource,
    ): RemoteTimetableSource
}
