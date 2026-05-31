plugins {
    id("chronos.android.library")
    id("chronos.android.compose")
}

android {
    namespace = "com.chronos.mobile.feature.mine"
}

dependencies {
    implementation(project(":core:model"))
    implementation(project(":domain"))
    implementation(project(":core:timetable-ui"))
    implementation(libs.androidx.core.ktx)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.foundation)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
    implementation(libs.commonmark)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
