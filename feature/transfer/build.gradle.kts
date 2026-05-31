import java.io.File
import java.util.Properties

plugins {
    id("chronos.android.library")
    id("chronos.android.compose")
    id("chronos.android.hilt")
}

val localProperties: Properties = Properties().apply {
    val localPropertiesFile: File = rootProject.file("local.properties")
    if (localPropertiesFile.isFile) {
        localPropertiesFile.inputStream().use(::load)
    }
}

fun resolveTransferCredential(name: String): String {
    return providers.gradleProperty(name).orNull
        ?.takeIf { it.isNotBlank() }
        ?: localProperties.getProperty(name)
            ?.takeIf { it.isNotBlank() }
        ?: ""
}

fun String.toBuildConfigString(): String = "\"${replace("\\", "\\\\").replace("\"", "\\\"")}\""

val onlineAccount = resolveTransferCredential("ONLINE_ACCOUNT")
val onlinePassword = resolveTransferCredential("ONLINE_PASSWORD")

android {
    namespace = "com.chronos.mobile.feature.transfer"

    buildTypes {
        debug {
            buildConfigField("String", "ONLINE_ACCOUNT", onlineAccount.toBuildConfigString())
            buildConfigField("String", "ONLINE_PASSWORD", onlinePassword.toBuildConfigString())
        }
        release {
            buildConfigField("String", "ONLINE_ACCOUNT", "\"\"")
            buildConfigField("String", "ONLINE_PASSWORD", "\"\"")
        }
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":domain"))
    implementation(libs.androidx.biometric)
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.hilt.navigation.compose)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
