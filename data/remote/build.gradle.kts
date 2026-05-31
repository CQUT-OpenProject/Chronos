plugins {
    id("chronos.android.library")
    alias(libs.plugins.kotlin.serialization)
    id("chronos.android.hilt")
}

android {
    namespace = "com.chronos.mobile.data.remote"
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":domain"))
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.okhttp)
    implementation(libs.okhttp.urlconnection)
    testImplementation(libs.junit4)
    testImplementation(libs.kotlinx.serialization.json)
}
