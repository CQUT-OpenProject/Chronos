plugins {
    id("chronos.android.library")
    alias(libs.plugins.kotlin.serialization)
    id("chronos.android.hilt")
}

android {
    namespace = "com.chronos.mobile.data.repository"
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":domain"))
    implementation(project(":data:local"))
    implementation(project(":data:preferences"))
    implementation(libs.androidx.room.runtime)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    testImplementation(libs.junit4)
}
