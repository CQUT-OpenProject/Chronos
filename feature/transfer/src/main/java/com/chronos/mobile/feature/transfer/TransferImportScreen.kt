package com.chronos.mobile.feature.transfer

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.IosShare
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.UploadFile
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.chronos.mobile.core.model.Timetable
import com.chronos.mobile.domain.ImportMode
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeParseException

@Composable
fun TransferImportScreen(
    state: TransferUiState,
    onSourceChange: (ImportSource) -> Unit,
    onAccountChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onSaveCredentialsChange: (Boolean) -> Unit,
    onPreviewOnlineClick: () -> Unit,
    onPreviewWithSavedCredentialClick: () -> Unit,
    onClearSavedCredentialClick: () -> Unit,
    onPreviewFromClipboardClick: () -> Unit,
    onPreviewFromHtmlFileClick: () -> Unit,
    onClearPreviewClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        SectionLabel(title = "选择导入方式")
        SourceSelector(
            selectedSource = state.selectedSource,
            onSourceChange = onSourceChange,
        )
        when (state.selectedSource) {
            ImportSource.ONLINE -> OnlinePreviewSection(
                state = state,
                onAccountChange = onAccountChange,
                onPasswordChange = onPasswordChange,
                onSaveCredentialsChange = onSaveCredentialsChange,
                onPreviewOnlineClick = onPreviewOnlineClick,
                onPreviewWithSavedCredentialClick = onPreviewWithSavedCredentialClick,
                onClearSavedCredentialClick = onClearSavedCredentialClick,
            )

            ImportSource.JSON -> LocalPreviewSection(
                title = "从分享内容获取",
                actionLabel = "从剪贴板导入课表",
                icon = Icons.Default.IosShare,
                onClick = onPreviewFromClipboardClick,
            )

            ImportSource.HTML -> LocalPreviewSection(
                title = "从文件导入课表",
                actionLabel = "选择 HTML 文件",
                icon = Icons.Default.UploadFile,
                onClick = onPreviewFromHtmlFileClick,
            )
        }

        if (state.preview != null) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "当前预览：${state.preview.name}",
                    style = MaterialTheme.typography.bodyMedium,
                )
                TextButton(onClick = onClearPreviewClick) {
                    Text("清除")
                }
            }
        }
    }
}

@Composable
fun TransferImportConfirmScreen(
    preview: Timetable,
    previewSource: ImportSource?,
    importMode: ImportMode,
    htmlImportTermStartDate: String?,
    currentTimetableName: String?,
    onImportModeChange: (ImportMode) -> Unit,
    onHtmlImportTermStartDateChange: (String) -> Unit,
    onConfirmImportClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val canConfirmImport = previewSource != ImportSource.HTML || htmlImportTermStartDate != null
    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        Text(
            text = "课表已准备好，请选择导入方式：",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        PreviewSummaryCard(
            preview = preview,
            source = previewSource,
        )
        ImportModeSelector(
            currentTimetableName = currentTimetableName,
            selectedMode = importMode,
            onImportModeChange = onImportModeChange,
        )
        if (previewSource == ImportSource.HTML) {
            HtmlImportTermStartDatePicker(
                selectedDate = htmlImportTermStartDate,
                onDateChange = onHtmlImportTermStartDateChange,
            )
        }
        OutlinedButton(
            onClick = onConfirmImportClick,
            modifier = Modifier.fillMaxWidth(),
            enabled = canConfirmImport,
        ) {
            Icon(Icons.Default.Download, contentDescription = null)
            Spacer(modifier = Modifier.size(8.dp))
            Text(
                if (importMode == ImportMode.AS_NEW) {
                    "导入为新课程表"
                } else {
                    "覆盖当前课程表"
                },
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HtmlImportTermStartDatePicker(
    selectedDate: String?,
    onDateChange: (String) -> Unit,
) {
    var showDatePickerDialog by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current
    val datePickerState = rememberHtmlTermStartDatePickerState(selectedDate)
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        SectionLabel(title = "学期起始日期")
        OutlinedTextField(
            value = selectedDate.orEmpty(),
            onValueChange = {},
            modifier = Modifier
                .fillMaxWidth()
                .onFocusChanged { focusState ->
                    if (focusState.isFocused) {
                        showDatePickerDialog = true
                        focusManager.clearFocus(force = true)
                    }
                },
            readOnly = true,
            singleLine = true,
            placeholder = { Text("请选择学期第一天") },
            trailingIcon = {
                Icon(
                    imageVector = Icons.Default.DateRange,
                    contentDescription = null,
                )
            },
        )
        if (showDatePickerDialog) {
            DatePickerDialog(
                onDismissRequest = { showDatePickerDialog = false },
                confirmButton = {
                    TextButton(
                        onClick = {
                            datePickerState.selectedDateMillis
                                ?.let(::millisToLocalDate)
                                ?.let { date -> onDateChange(date.toString()) }
                            showDatePickerDialog = false
                        },
                        enabled = datePickerState.selectedDateMillis != null,
                    ) {
                        Text("确认")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDatePickerDialog = false }) {
                        Text("取消")
                    }
                },
            ) {
                DatePicker(state = datePickerState)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun rememberHtmlTermStartDatePickerState(selectedDate: String?): androidx.compose.material3.DatePickerState {
    val initialSelectedDateMillis = remember(selectedDate) {
        selectedDate?.toLocalDateOrNull()?.let(::localDateToMillis)
    }
    return androidx.compose.material3.rememberDatePickerState(
        initialSelectedDateMillis = initialSelectedDateMillis,
    )
}

private fun String.toLocalDateOrNull(): LocalDate? =
    try {
        LocalDate.parse(this)
    } catch (_: DateTimeParseException) {
        null
    }

private fun localDateToMillis(date: LocalDate): Long =
    date.atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()

private fun millisToLocalDate(millis: Long): LocalDate =
    java.time.Instant.ofEpochMilli(millis).atZone(ZoneId.systemDefault()).toLocalDate()

@Composable
private fun SectionLabel(title: String) {
    Text(
        text = title,
        style = MaterialTheme.typography.titleMedium,
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun SourceSelector(
    selectedSource: ImportSource,
    onSourceChange: (ImportSource) -> Unit,
) {
    SingleChoiceSegmentedButtonRow(
        modifier = Modifier.fillMaxWidth(),
    ) {
        ImportSource.entries.forEachIndexed { index, source ->
            val selected = source == selectedSource
            SegmentedButton(
                selected = selected,
                onClick = { onSourceChange(source) },
                shape = SegmentedButtonDefaults.itemShape(index = index, count = ImportSource.entries.size),
                modifier = Modifier.weight(1f),
                label = {
                    Text(
                        text = when (source) {
                            ImportSource.ONLINE -> "教务处"
                            ImportSource.JSON -> "分享链接"
                            ImportSource.HTML -> "HTML 文件"
                        },
                        fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium,
                    )
                },
            )
        }
    }
}

@Composable
private fun OnlinePreviewSection(
    state: TransferUiState,
    onAccountChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onSaveCredentialsChange: (Boolean) -> Unit,
    onPreviewOnlineClick: () -> Unit,
    onPreviewWithSavedCredentialClick: () -> Unit,
    onClearSavedCredentialClick: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(
            value = state.account,
            onValueChange = onAccountChange,
            label = { Text("账号") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
        )
        OutlinedTextField(
            value = state.password,
            onValueChange = onPasswordChange,
            label = { Text("密码") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Checkbox(
                checked = state.saveCredentials,
                onCheckedChange = onSaveCredentialsChange,
                enabled = state.savedCredentialState.protectionAvailable,
            )
            Text(
                text = if (state.savedCredentialState.protectionAvailable) {
                    "保存帐号密码"
                } else {
                    "当前设备不支持保存帐号密码"
                },
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
        OutlinedButton(
            onClick = onPreviewOnlineClick,
            modifier = Modifier.fillMaxWidth(),
            enabled = !state.isPreviewingOnline,
        ) {
            if (state.isPreviewingOnline) {
                CircularProgressIndicator(
                    modifier = Modifier.size(18.dp),
                    strokeWidth = 2.dp,
                )
            } else {
                Icon(Icons.Default.Download, contentDescription = null)
            }
            Spacer(modifier = Modifier.size(8.dp))
            Text(if (state.isPreviewingOnline) "正在获取课表..." else "从此账号导入课表")
        }
        if (state.savedCredentialState.hasSavedCredential) {
            SavedCredentialCard(
                account = state.savedCredentialState.account.orEmpty(),
                onUseSavedCredentialClick = onPreviewWithSavedCredentialClick,
                onClearSavedCredentialClick = onClearSavedCredentialClick,
                enabled = !state.isPreviewingOnline,
            )
        }
    }
}

@Composable
private fun SavedCredentialCard(
    account: String,
    onUseSavedCredentialClick: () -> Unit,
    onClearSavedCredentialClick: () -> Unit,
    enabled: Boolean,
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text(
            text = "已保存账号：$account",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
        )
        Text(
            text = "每次使用前都会触发生物识别或设备凭据验证。",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        OutlinedButton(
            onClick = onUseSavedCredentialClick,
            modifier = Modifier.fillMaxWidth(),
            enabled = enabled,
        ) {
            Icon(Icons.Default.Lock, contentDescription = null)
            Spacer(modifier = Modifier.size(8.dp))
            Text(if (enabled) "验证并预览" else "正在获取课表...")
        }
        TextButton(
            onClick = onClearSavedCredentialClick,
            enabled = enabled,
        ) {
            Icon(Icons.Default.DeleteOutline, contentDescription = null)
            Spacer(modifier = Modifier.size(6.dp))
            Text("清除")
        }
    }
}

@Composable
private fun LocalPreviewSection(
    title: String,
    actionLabel: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        OutlinedButton(
            onClick = onClick,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Icon(icon, contentDescription = null)
            Spacer(modifier = Modifier.size(8.dp))
            Text(actionLabel)
        }
    }
}

@Composable
private fun ImportModeSelector(
    currentTimetableName: String?,
    selectedMode: ImportMode,
    onImportModeChange: (ImportMode) -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        SectionLabel(title = "导入方式")
        ImportModeRow(
            selected = selectedMode == ImportMode.AS_NEW,
            enabled = true,
            title = "作为新课程表导入",
            onClick = { onImportModeChange(ImportMode.AS_NEW) },
        )
        ImportModeRow(
            selected = selectedMode == ImportMode.OVERWRITE_CURRENT,
            enabled = currentTimetableName != null,
            title = buildString {
                append("覆盖当前课程表")
                if (currentTimetableName != null) {
                    append("（$currentTimetableName）")
                }
            },
            onClick = { onImportModeChange(ImportMode.OVERWRITE_CURRENT) },
        )
    }
}

@Composable
private fun PreviewSummaryCard(
    preview: Timetable,
    source: ImportSource?,
) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.35f),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    text = preview.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f),
                )
                Spacer(modifier = Modifier.size(8.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(999.dp))
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f))
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                ) {
                    Text(
                        text = when (source) {
                            ImportSource.ONLINE -> "在线课表"
                            ImportSource.JSON -> "分享课表"
                            ImportSource.HTML -> "文件课表"
                            null -> "课表"
                        },
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
            }
            PreviewMetric(label = "课程数", value = preview.courses.size.toString())
            PreviewMetric(label = "开始周", value = preview.academicConfig.startWeek.toString())
            PreviewMetric(label = "结束周", value = preview.academicConfig.endWeek.toString())
        }
    }
}

@Composable
private fun PreviewMetric(
    label: String,
    value: String,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Text(
                text = value,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}

@Composable
private fun ImportModeRow(
    selected: Boolean,
    enabled: Boolean,
    title: String,
    onClick: () -> Unit,
) {
    val borderColor = if (selected) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.outlineVariant
    }
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .clickable(enabled = enabled, onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        tonalElevation = if (selected) 2.dp else 0.dp,
        border = BorderStroke(1.dp, borderColor),
        color = MaterialTheme.colorScheme.surface,
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            RadioButton(
                selected = selected,
                onClick = if (enabled) onClick else null,
                enabled = enabled,
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = if (enabled) {
                    MaterialTheme.colorScheme.onSurface
                } else {
                    MaterialTheme.colorScheme.onSurfaceVariant
                },
            )
        }
    }
}
