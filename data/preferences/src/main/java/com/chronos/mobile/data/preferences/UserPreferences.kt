package com.chronos.mobile.data.preferences

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.chronos.mobile.core.model.ThemeMode
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map

private val Context.userPreferencesDataStore by preferencesDataStore(name = "chronos_preferences")

data class UserPreferenceState(
    val currentTimetableId: String? = null,
    val wallpaperUri: String? = null,
    val themeMode: ThemeMode = ThemeMode.SYSTEM,
    val useDynamicColor: Boolean = false,
)

@Singleton
class UserPreferences @Inject constructor(
    @param:ApplicationContext private val context: Context,
) {
    private object Keys {
        val currentTimetableId = stringPreferencesKey("current_timetable_id")
        val wallpaperUri = stringPreferencesKey("wallpaper_uri")
        val themeMode = stringPreferencesKey("theme_mode")
        val useDynamicColor = booleanPreferencesKey("use_dynamic_color")
    }

    val preferences: Flow<UserPreferenceState> = context.userPreferencesDataStore.data
        .catch { throwable ->
            if (throwable is IOException) {
                emit(emptyPreferences())
            } else {
                throw throwable
            }
        }
        .map { preferences ->
            UserPreferenceState(
                currentTimetableId = preferences[Keys.currentTimetableId],
                wallpaperUri = preferences[Keys.wallpaperUri],
                themeMode = ThemeMode.fromStorageValue(preferences[Keys.themeMode]),
                useDynamicColor = preferences[Keys.useDynamicColor] ?: false,
            )
        }

    suspend fun setCurrentTimetableId(id: String?) {
        updateString(Keys.currentTimetableId, id)
    }

    suspend fun setWallpaperUri(uri: String?) {
        updateString(Keys.wallpaperUri, uri)
    }

    suspend fun setThemeMode(mode: ThemeMode) {
        updateString(Keys.themeMode, mode.storageValue)
    }

    suspend fun setUseDynamicColor(enabled: Boolean) {
        context.userPreferencesDataStore.edit { preferences ->
            preferences[Keys.useDynamicColor] = enabled
        }
    }

    private suspend fun updateString(key: Preferences.Key<String>, value: String?) {
        context.userPreferencesDataStore.edit { preferences ->
            if (value == null) {
                preferences.remove(key)
            } else {
                preferences[key] = value
            }
        }
    }
}
