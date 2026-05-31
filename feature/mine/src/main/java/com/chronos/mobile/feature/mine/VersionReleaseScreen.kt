package com.chronos.mobile.feature.mine

import android.text.method.LinkMovementMethod
import android.widget.TextView
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.text.HtmlCompat
import com.chronos.mobile.domain.model.GithubRelease
import org.commonmark.parser.Parser
import org.commonmark.renderer.html.HtmlRenderer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VersionReleaseScreen(
    isLoading: Boolean,
    release: GithubRelease?,
    errorMessage: String?,
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                modifier = Modifier.windowInsetsPadding(WindowInsets.statusBars),
                title = { Text("发布信息") },
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.surface)
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(
                top = paddingValues.calculateTopPadding() + 8.dp,
                bottom = paddingValues.calculateBottomPadding() + 24.dp,
            ),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            when {
                isLoading -> {
                    item {
                        Column(
                            modifier = Modifier.fillParentMaxSize(),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center,
                        ) {
                            CircularProgressIndicator()
                        }
                    }
                }

                release != null -> {
                    item {
                        Text(
                            text = release.name.ifBlank { release.tagName },
                            style = MaterialTheme.typography.titleLarge,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                    }
                    item {
                        Text(
                            text = "Tag：${release.tagName}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    item {
                        Text(
                            text = "发布时间：${release.publishedAt.displayDate()}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    item {
                        MarkdownText(
                            markdown = release.body.ifBlank { "此 Release 没有正文内容。" },
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }

                else -> {
                    item {
                        Text(
                            text = errorMessage ?: "未获取到当前版本的 Release 信息",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }
            }

            if (!errorMessage.isNullOrBlank() && release != null) {
                item {
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                    )
                }
            }
        }
    }
}

private fun String.displayDate(): String {
    if (isBlank()) return "-"
    return removeSuffix("Z").replace('T', ' ')
}

@Composable
private fun MarkdownText(
    markdown: String,
    modifier: Modifier = Modifier,
) {
    val parser = remember { Parser.builder().build() }
    val htmlRenderer = remember { HtmlRenderer.builder().escapeHtml(false).build() }
    val html = remember(markdown, parser, htmlRenderer) {
        htmlRenderer.render(parser.parse(markdown))
    }
    val textColor = MaterialTheme.colorScheme.onSurface.toArgb()
    val linkColor = MaterialTheme.colorScheme.primary.toArgb()
    val bodyTypography = MaterialTheme.typography.bodyMedium
    val lineHeightPx = with(androidx.compose.ui.platform.LocalDensity.current) {
        bodyTypography.lineHeight.toPx()
    }
    val textSizeSp = bodyTypography.fontSize.value

    Box(modifier = modifier) {
        AndroidView(
            factory = { context ->
                TextView(context).apply {
                    movementMethod = LinkMovementMethod.getInstance()
                    linksClickable = true
                    setTextIsSelectable(true)
                }
            },
            update = { textView ->
                textView.text = HtmlCompat.fromHtml(html, HtmlCompat.FROM_HTML_MODE_COMPACT)
                textView.setTextColor(textColor)
                textView.setLinkTextColor(linkColor)
                textView.textSize = textSizeSp
                if (lineHeightPx > 0f) {
                    textView.setLineSpacing(0f, lineHeightPx / textView.textSize)
                }
            },
        )
    }
}
