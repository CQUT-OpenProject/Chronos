plugins {
    id("chronos.android.library")
    alias(libs.plugins.kotlin.serialization)
    id("chronos.android.hilt")
}

android {
    namespace = "com.chronos.mobile.source.sharedjson"
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":domain"))
    implementation(libs.kotlinx.serialization.json)
    testImplementation(libs.junit4)
}
