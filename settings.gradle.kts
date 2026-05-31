pluginManagement {
    includeBuild("build-logic")
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "com.google.android.gms.oss-licenses-plugin") {
                useModule("com.google.android.gms:oss-licenses-plugin:0.11.0")
            }
        }
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.10.0"
}

rootProject.name = "Chronos"
include(":app")
include(":core:model")
include(":core:designsystem")
include(":core:timetable-ui")
include(":domain")
include(":data:local")
include(":data:preferences")
include(":data:repository")
include(":data:remote")
include(":source:cqut-online")
include(":source:shared-json")
include(":source:edu-html")
include(":data:secure")
include(":feature:root")
include(":feature:timetable")
include(":feature:mine")
include(":feature:transfer")
