package com.chronos.mobile.data.repository

import android.util.Log
import com.chronos.mobile.core.model.AcademicConfig
import com.chronos.mobile.core.model.TimetableImportMetadata
import com.chronos.mobile.core.model.TimetableViewPrefs
import javax.inject.Inject
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

class TimetableConfigJsonCodec @Inject constructor() {
    private val json = Json {
        encodeDefaults = true
        ignoreUnknownKeys = true
    }

    internal fun encode(
        academicConfig: AcademicConfig,
        importMetadata: TimetableImportMetadata,
        viewPrefs: TimetableViewPrefs,
    ): String = json.encodeToString(
        TimetableConfig(
            schemaVersion = SCHEMA_VERSION,
            academicConfig = academicConfig,
            importMetadata = importMetadata,
            viewPrefs = viewPrefs,
        ),
    )

    internal fun decode(configJson: String, timetableId: String? = null): TimetableConfig = runCatching {
        json.decodeFromString<TimetableConfig>(configJson)
    }.onFailure { throwable ->
        runCatching {
            Log.w(TAG, "Failed to decode timetable config (id=${timetableId.orEmpty()}, schema=$SCHEMA_VERSION)", throwable)
        }
    }.getOrDefault(TimetableConfig())

    private companion object {
        const val TAG = "TimetableConfigJson"
        const val SCHEMA_VERSION = 2
    }
}

@Serializable
internal data class TimetableConfig(
    val schemaVersion: Int = 2,
    val academicConfig: AcademicConfig = AcademicConfig(),
    val importMetadata: TimetableImportMetadata = TimetableImportMetadata(),
    val viewPrefs: TimetableViewPrefs = TimetableViewPrefs(),
)
