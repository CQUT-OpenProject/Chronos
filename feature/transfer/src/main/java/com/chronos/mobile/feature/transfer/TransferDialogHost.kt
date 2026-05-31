package com.chronos.mobile.feature.transfer

import android.annotation.SuppressLint
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavBackStackEntry
import com.chronos.mobile.domain.model.AuthSnapshot
import com.chronos.mobile.domain.result.fold
import com.chronos.mobile.domain.result.toAppError
import com.chronos.mobile.domain.usecase.ImportTimetableResult
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransferRoute(
    mode: TransferDialogMode,
    onBack: () -> Unit,
    onNavigateToImportConfirm: (() -> Unit)? = null,
    onMessage: (String) -> Unit,
    @SuppressLint("ModifierParameter") modifier: Modifier = Modifier,
    viewModel: TransferViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val appState by viewModel.appState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val coordinator = remember(context) { BiometricCredentialCoordinator.from(context) }
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    val clipboardManager = remember(context) {
        context.getSystemService(ClipboardManager::class.java)
    }

    LaunchedEffect(mode) {
        viewModel.reset()
    }

    val importFromFileLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
    ) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            val contentBytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
            if (contentBytes == null || contentBytes.isEmpty()) {
                onMessage("导入失败，HTML 文件内容为空")
                return@launch
            }
            viewModel.previewImportedHtml(contentBytes).fold(
                onSuccess = {
                    onMessage("课表已准备好")
                    onNavigateToImportConfirm?.invoke()
                },
                onFailure = { error ->
                    onMessage(error.message)
                },
            )
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                title = {
                    Text(if (mode == TransferDialogMode.IMPORT) "导入课程表" else "分享课程表")
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "返回",
                        )
                    }
                },
            )
        },
    ) { paddingValues ->
        if (mode == TransferDialogMode.IMPORT) {
            TransferImportScreen(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                state = state,
                onSourceChange = viewModel::selectSource,
                onAccountChange = viewModel::setAccount,
                onPasswordChange = viewModel::setPassword,
                onSaveCredentialsChange = viewModel::setSaveCredentials,
                onPreviewOnlineClick = {
                    scope.launch {
                        runCatching {
                            val account = state.account.trim()
                            val password = state.password
                            if (account.isEmpty()) {
                                onMessage("请输入账号")
                                return@runCatching
                            }
                            if (password.isBlank()) {
                                onMessage("请输入密码")
                                return@runCatching
                            }
                            viewModel.previewOnline(AuthSnapshot(account = account, password = password)).fold(
                                onSuccess = {
                                    if (state.saveCredentials) {
                                        if (!state.savedCredentialState.protectionAvailable) {
                                            onMessage("当前设备不支持保存帐号密码")
                                        } else {
                                            handleCredentialSave(
                                                viewModel = viewModel,
                                                coordinator = coordinator,
                                                account = account,
                                                password = password,
                                                onMessage = onMessage,
                                            )
                                        }
                                    }
                                    onMessage("课表已准备好")
                                    onNavigateToImportConfirm?.invoke()
                                },
                                onFailure = { error ->
                                    onMessage(error.message)
                                },
                            )
                        }.onFailure { throwable ->
                            onMessage(throwable.toAppError().message)
                        }
                    }
                },
                onPreviewWithSavedCredentialClick = {
                    scope.launch {
                        runCatching {
                            if (!state.savedCredentialState.hasSavedCredential) {
                                onMessage("当前没有可用的已保存凭据")
                                return@runCatching
                            }
                            val cipherResult = viewModel.prepareUnlockCipher()
                            cipherResult.fold(
                                onSuccess = { cipher ->
                                    coordinator.authenticate(
                                        title = "验证后获取在线课表",
                                        cipher = cipher,
                                    ).fold(
                                    onSuccess = { authenticatedCipher ->
                                        viewModel.unlockSavedCredentials(authenticatedCipher).fold(
                                            onSuccess = { snapshot ->
                                                viewModel.previewOnline(snapshot).fold(
                                                    onSuccess = {
                                                        onMessage("课表已准备好")
                                                        onNavigateToImportConfirm?.invoke()
                                                    },
                                                        onFailure = { error ->
                                                            onMessage(error.message)
                                                        },
                                                )
                                            },
                                            onFailure = { error -> onMessage(error.message) },
                                            )
                                        },
                                        onFailure = { error -> onMessage(error.message) },
                                    )
                                },
                                onFailure = { error -> onMessage(error.message) },
                            )
                        }.onFailure { throwable ->
                            onMessage(throwable.toAppError().message)
                        }
                    }
                },
                onClearSavedCredentialClick = {
                    scope.launch {
                        viewModel.clearSavedCredentials()
                        onMessage("已清除已保存凭据")
                    }
                },
                onPreviewFromClipboardClick = {
                    scope.launch {
                        previewContent(
                            source = ImportSource.JSON,
                            content = clipboardManager.readPlainText(context),
                            viewModel = viewModel,
                            onMessage = onMessage,
                            onSuccess = { onNavigateToImportConfirm?.invoke() },
                            emptyMessage = "导入失败，剪贴板内容为空",
                        )
                    }
                },
                onPreviewFromHtmlFileClick = {
                    importFromFileLauncher.launch(
                        arrayOf(
                            "text/html",
                            "application/xhtml+xml",
                            "text/plain",
                            "application/octet-stream",
                        ),
                    )
                },
                onClearPreviewClick = viewModel::clearPreview,
            )
        } else {
            TransferExportScreen(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                currentTimetableName = appState.currentTimetable?.name,
                onExportClick = {
                    scope.launch {
                        viewModel.export().fold(
                            onSuccess = { exportedJson ->
                                if (exportedJson == null) {
                                    onMessage("当前没有可导出的课程表")
                                } else {
                                    clipboardManager?.setPrimaryClip(
                                        ClipData.newPlainText("chronos_online_schedule_json", exportedJson),
                                    )
                                    onMessage("课表链接已复制到剪贴板")
                                    onBack()
                                }
                            },
                            onFailure = { error ->
                                onMessage(error.message)
                            },
                        )
                    }
                },
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransferImportConfirmRoute(
    parentEntry: NavBackStackEntry,
    onBack: () -> Unit,
    onMessage: (String) -> Unit,
    onImportSuccess: (ImportTimetableResult) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: TransferViewModel = hiltViewModel(parentEntry),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val appState by viewModel.appState.collectAsStateWithLifecycle()
    val scope = androidx.compose.runtime.rememberCoroutineScope()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                title = { Text("确认导入方式") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "返回",
                        )
                    }
                },
            )
        },
    ) { paddingValues ->
        val contentModifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)
            .padding(horizontal = 20.dp, vertical = 16.dp)
        val preview = state.preview
        if (preview != null) {
            TransferImportConfirmScreen(
                modifier = contentModifier,
                preview = preview,
                previewSource = state.previewSource,
                importMode = state.importMode,
                htmlImportTermStartDate = state.htmlImportTermStartDate,
                currentTimetableName = appState.currentTimetable?.name,
                onImportModeChange = viewModel::setImportMode,
                onHtmlImportTermStartDateChange = viewModel::setHtmlImportTermStartDate,
                onConfirmImportClick = {
                    scope.launch {
                        viewModel.importPreview().fold(
                            onSuccess = { result ->
                                onImportSuccess(result)
                            },
                            onFailure = { error ->
                                onMessage(error.message)
                            },
                        )
                    }
                },
            )
        } else {
            PreviewPendingScreen(
                isLoading = state.isPreviewingOnline,
                modifier = contentModifier,
            )
        }
    }
}

private suspend fun handleCredentialSave(
    viewModel: TransferViewModel,
    coordinator: BiometricCredentialCoordinator,
    account: String,
    password: String,
    onMessage: (String) -> Unit,
) {
    viewModel.prepareSaveCipher().fold(
        onSuccess = { cipher ->
            coordinator.authenticate(
                title = "保存在线课表凭据",
                cipher = cipher,
            ).fold(
                onSuccess = { authenticatedCipher ->
                    viewModel.saveCredentials(
                        account = account,
                        password = password,
                        cipher = authenticatedCipher,
                    ).fold(
                        onSuccess = {},
                        onFailure = { error -> onMessage(error.message) },
                    )
                },
                onFailure = { error ->
                    onMessage(if (error.message == "已取消设备验证") "已获取预览，未保存凭据" else error.message)
                },
            )
        },
        onFailure = { error -> onMessage(error.message) },
    )
}

private suspend fun previewContent(
    source: ImportSource,
    content: String?,
    viewModel: TransferViewModel,
    onMessage: (String) -> Unit,
    onSuccess: () -> Unit = {},
    emptyMessage: String,
) {
    val value = content?.trim()
    if (value.isNullOrEmpty()) {
        onMessage(emptyMessage)
        return
    }
    viewModel.previewImported(value, source).fold(
        onSuccess = {
            onMessage("课表已准备好")
            onSuccess()
        },
        onFailure = { error ->
            onMessage(error.message)
        },
    )
}

@Composable
private fun PreviewPendingScreen(
    isLoading: Boolean,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        if (isLoading) {
            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            Text(
                text = "正在准备课表...",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        } else {
            Text(
                text = "当前没有可用预览，请返回上一页重新获取。",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

private fun ClipboardManager?.readPlainText(context: Context): String? {
    val clip = this?.primaryClip ?: return null
    if (clip.itemCount == 0) return null
    return clip.getItemAt(0).coerceToText(context)?.toString()
}
