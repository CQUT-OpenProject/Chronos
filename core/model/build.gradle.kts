plugins {
    id("chronos.android.library")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.chronos.mobile.core.model"
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.runtime)
    implementation(libs.kotlinx.serialization.json)
}
