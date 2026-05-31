plugins {
    id("chronos.android.library")
    id("chronos.android.compose")
    id("chronos.android.hilt")
}

android {
    namespace = "com.chronos.mobile.feature.root"
}

dependencies {
    implementation(project(":core:designsystem"))
    implementation(project(":core:model"))
    implementation(project(":domain"))
    implementation(project(":feature:timetable"))
    implementation(project(":feature:mine"))
    implementation(project(":feature:transfer"))
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.viewmodel.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.google.play.services.oss.licenses)
    debugImplementation(libs.androidx.compose.ui.tooling)
}
