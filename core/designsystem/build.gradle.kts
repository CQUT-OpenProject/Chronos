plugins {
    id("chronos.android.library")
    id("chronos.android.compose")
}

android {
    namespace = "com.chronos.mobile.core.designsystem"
}

dependencies {
    implementation(project(":core:model"))
    implementation(libs.androidx.core.ktx)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.ui)
}
