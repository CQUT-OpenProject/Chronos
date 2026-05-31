package com.chronos.mobile.feature.transfer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.compose.runtime.Immutable
import com.chronos.mobile.core.model.AppState
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.ImportMode
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.model.SavedCredentialState
import com.chronos.mobile.domain.result.AppError
import com.chronos.mobile.domain.result.AppResult
import com.chronos.mobile.domain.result.asFailure
import com.chronos.mobile.domain.result.onSuccess
import com.chronos.mobile.domain.usecase.ClearOnlineCredentialUseCase
import com.chronos.mobile.domain.usecase.ExportCurrentTimetableUseCase
import com.chronos.mobile.domain.usecase.ImportTimetableResult
import com.chronos.mobile.domain.usecase.ImportTimetableUseCase
import com.chronos.mobile.domain.usecase.ObserveAppStateUseCase
import com.chronos.mobile.domain.usecase.ObserveSavedCredentialStateUseCase
import com.chronos.mobile.domain.usecase.PrepareCredentialSaveUseCase
import com.chronos.mobile.domain.usecase.PrepareCredentialUnlockUseCase
import com.chronos.mobile.domain.usecase.PreviewImportedTimetableUseCase
import com.chronos.mobile.domain.usecase.PreviewOnlineTimetableUseCase
import com.chronos.mobile.domain.usecase.SaveOnlineCredentialUseCase
import com.chronos.mobile.domain.usecase.UnlockOnlineCredentialUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.crypto.Cipher
import javax.inject.Inject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

enum class TransferDialogMode {
    IMPORT,
    EXPORT,
}

enum class ImportSource {
    ONLINE,
    JSON,
    HTML,
}

@Immutable
data class TransferUiState(
    val importMode: ImportMode = ImportMode.AS_NEW,
    val selectedSource: ImportSource = ImportSource.ONLINE,
    val account: String = "",
    val password: String = "",
    val saveCredentials: Boolean = false,
    val savedCredentialState: SavedCredentialState = SavedCredentialState(),
    val isPreviewingOnline: Boolean = false,
    val preview: Timetable? = null,
    val previewSource: ImportSource? = null,
    val htmlImportTermStartDate: String? = null,
)

@HiltViewModel
class TransferViewModel @Inject constructor(
    observeAppState: ObserveAppStateUseCase,
    observeSavedCredentialStateUseCase: ObserveSavedCredentialStateUseCase,
    private val previewImportedTimetableUseCase: PreviewImportedTimetableUseCase,
    private val previewOnlineTimetableUseCase: PreviewOnlineTimetableUseCase,
    private val importTimetableUseCase: ImportTimetableUseCase,
    private val exportCurrentTimetableUseCase: ExportCurrentTimetableUseCase,
    private val prepareCredentialSaveUseCase: PrepareCredentialSaveUseCase,
    private val saveOnlineCredentialUseCase: SaveOnlineCredentialUseCase,
    private val prepareCredentialUnlockUseCase: PrepareCredentialUnlockUseCase,
    private val unlockOnlineCredentialUseCase: UnlockOnlineCredentialUseCase,
    private val clearOnlineCredentialUseCase: ClearOnlineCredentialUseCase,
) : ViewModel() {
    private val injectedAccount = debugBuildAccount()
    private val injectedPassword = debugBuildPassword()
    private val uiState = MutableStateFlow(
        TransferUiState(
            account = injectedAccount,
            password = injectedPassword,
        ),
    )

    val appState: StateFlow<AppState> = observeAppState().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5_000),
        initialValue = AppState(),
    )

    val state: StateFlow<TransferUiState> = uiState

    init {
        viewModelScope.launch {
            observeSavedCredentialStateUseCase().collect { savedState ->
                uiState.update { current ->
                    val savedAccount = savedState.account.orEmpty()
                    current.copy(
                        savedCredentialState = savedState,
                        account = when {
                            savedAccount.isBlank() -> current.account
                            current.account.isBlank() || current.account == injectedAccount -> savedAccount
                            else -> current.account
                        },
                    )
                }
            }
        }
    }

    fun reset() {
        uiState.update { current ->
            current.copy(
                importMode = ImportMode.AS_NEW,
                selectedSource = ImportSource.ONLINE,
                account = current.savedCredentialState.account
                    ?.takeIf { it.isNotBlank() }
                    ?: injectedAccount,
                password = injectedPassword,
                saveCredentials = false,
                isPreviewingOnline = false,
                preview = null,
                previewSource = null,
                htmlImportTermStartDate = null,
            )
        }
    }

    fun setImportMode(mode: ImportMode) {
        uiState.update { it.copy(importMode = mode) }
    }

    fun selectSource(source: ImportSource) {
        uiState.update {
            it.copy(
                selectedSource = source,
                preview = null,
                previewSource = null,
                htmlImportTermStartDate = null,
            )
        }
    }

    fun setHtmlImportTermStartDate(date: String) {
        uiState.update { it.copy(htmlImportTermStartDate = date) }
    }

    fun setAccount(account: String) {
        uiState.update {
            it.copy(
                account = account,
                preview = if (it.previewSource == ImportSource.ONLINE) null else it.preview,
                previewSource = if (it.previewSource == ImportSource.ONLINE) null else it.previewSource,
            )
        }
    }

    fun setPassword(password: String) {
        uiState.update {
            it.copy(
                password = password,
                preview = if (it.previewSource == ImportSource.ONLINE) null else it.preview,
                previewSource = if (it.previewSource == ImportSource.ONLINE) null else it.previewSource,
            )
        }
    }

    fun setSaveCredentials(saveCredentials: Boolean) {
        uiState.update { it.copy(saveCredentials = saveCredentials) }
    }

    fun clearPreview() {
        uiState.update { it.copy(preview = null, previewSource = null, htmlImportTermStartDate = null) }
    }

    suspend fun prepareSaveCipher(): AppResult<Cipher> = withContext(Dispatchers.IO) {
        prepareCredentialSaveUseCase()
    }

    suspend fun saveCredentials(
        account: String,
        password: String,
        cipher: Cipher,
    ): AppResult<Unit> = saveOnlineCredentialUseCase(account = account, password = password, cipher = cipher)

    suspend fun prepareUnlockCipher(): AppResult<Cipher> = withContext(Dispatchers.IO) {
        prepareCredentialUnlockUseCase()
    }

    suspend fun unlockSavedCredentials(cipher: Cipher): AppResult<AuthSnapshot> =
        unlockOnlineCredentialUseCase(cipher)

    suspend fun clearSavedCredentials() {
        clearOnlineCredentialUseCase()
        uiState.update { current ->
            current.copy(
                savedCredentialState = SavedCredentialState(protectionAvailable = current.savedCredentialState.protectionAvailable),
                saveCredentials = false,
                preview = if (current.previewSource == ImportSource.ONLINE) null else current.preview,
                previewSource = if (current.previewSource == ImportSource.ONLINE) null else current.previewSource,
            )
        }
    }

    suspend fun previewImported(content: String, source: ImportSource): AppResult<Timetable> = withContext(Dispatchers.IO) {
        previewImportedTimetableUseCase(content).onSuccess { timetable ->
            uiState.update {
                it.copy(
                    preview = timetable,
                    previewSource = source,
                    htmlImportTermStartDate = if (source == ImportSource.HTML) null else it.htmlImportTermStartDate,
                )
            }
        }
    }

    suspend fun previewImportedHtml(contentBytes: ByteArray): AppResult<Timetable> = withContext(Dispatchers.IO) {
        previewImportedTimetableUseCase.previewHtml(contentBytes).onSuccess { timetable ->
            uiState.update {
                it.copy(
                    preview = timetable,
                    previewSource = ImportSource.HTML,
                    htmlImportTermStartDate = null,
                )
            }
        }
    }

    suspend fun previewOnline(authSnapshot: AuthSnapshot): AppResult<Timetable> {
        uiState.update { it.copy(isPreviewingOnline = true) }
        return try {
            withContext(Dispatchers.IO) {
                previewOnlineTimetableUseCase(authSnapshot).onSuccess { timetable ->
                    uiState.update { it.copy(preview = timetable, previewSource = ImportSource.ONLINE) }
                }
            }
        } finally {
            uiState.update { it.copy(isPreviewingOnline = false) }
        }
    }

    suspend fun importPreview(): AppResult<ImportTimetableResult> = withContext(Dispatchers.IO) {
        val currentState = state.value
        val preview = currentState.preview
            ?: return@withContext AppError.NotFound("请先获取课表").asFailure()
        val finalPreview = if (currentState.previewSource == ImportSource.HTML) {
            val termStartDate = currentState.htmlImportTermStartDate
                ?: return@withContext AppError.Validation("请选择学期起始日期").asFailure()
            preview.copy(
                academicConfig = preview.academicConfig.copy(termStartDate = termStartDate),
            )
        } else {
            preview
        }
        importTimetableUseCase.import(finalPreview, currentState.importMode)
    }

    suspend fun export(): AppResult<String?> = withContext(Dispatchers.IO) {
        exportCurrentTimetableUseCase()
    }

    private fun debugBuildAccount(): String {
        if (!BuildConfig.DEBUG) return ""
        return BuildConfig.ONLINE_ACCOUNT.trim()
    }

    private fun debugBuildPassword(): String {
        if (!BuildConfig.DEBUG) return ""
        return BuildConfig.ONLINE_PASSWORD
    }
}
