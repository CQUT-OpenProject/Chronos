package com.chronos.mobile.di

import com.chronos.mobile.data.secure.KeystoreSecureCredentialStore
import com.chronos.mobile.domain.SecureCredentialStore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object SecureCredentialModule {
    @Provides
    @Singleton
    fun provideSecureCredentialStore(
        store: KeystoreSecureCredentialStore,
    ): SecureCredentialStore = store
}
