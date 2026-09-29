# Nova AI Android App

Android WebView-based shell application for the Nova AI React frontend. Uses modern architecture inspired by [WebToApp](https://github.com/shiaho777/web-to-app) with offline asset loading, native JavaScript bridge, and streamlined build pipeline.

## Architecture

### Key Components

1. **WebView Shell** (`MainActivity.kt`)
   - Loads frontend assets via `WebViewAssetLoader` (not file://)
   - Configures WebView for optimal performance (DOM storage, JS enabled, etc.)
   - Handles back button navigation
   - Supports RTL (Arabic) layouts

2. **JavaScript Bridge** (`WebViewBridge.kt`)
   - `showToast(message, duration)` - Native toast notifications
   - `getBackendUrl()` - Backend URL from BuildConfig
   - `getAppName()` - App name constant
   - `pickFile(mimeType)` - File picker dialog
   - `shareContent(title, text)` - Share dialog
   - `closeApp()` - Exit the app
   - `toggleFullscreen(enable)` - Fullscreen toggle
   - `log(tag, message)` - Debug logging

3. **Asset Loading**
   - Frontend built output copied to `app/src/main/assets/`
   - Served via HTTPS (appassets.androidplatform.net)
   - Offline-first: no internet required for app loading
   - Network requests still go to configured backend

4. **Build Configuration**
   - `BuildConfig.BACKEND_URL` - Configurable per build type
   - Debug: `http://localhost:3001`
   - Release: `https://api.nova.app` (customize in `build.gradle.kts`)

## Prerequisites

- Android SDK 35+ (API level 35)
- Android Build Tools 35.0.0+
- Gradle 8.2.0+
- JDK 17+
- Node.js 18+ (for frontend build)

## Setup

### 1. Install Android SDK

**macOS:**
```bash
brew install android-sdk
export ANDROID_HOME=/opt/homebrew/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Linux:**
```bash
# Download from https://developer.android.com/studio
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Windows:**
```cmd
# Download Android Studio from https://developer.android.com/studio
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools
```

### 2. Create Release Keystore (for production builds)

```bash
keytool -genkey -v -keystore ~/.android/release.keystore \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias nova -storepass password -keypass password \
    -dname "CN=Nova AI, O=Nova, C=SA"
```

**⚠️ Important:**
- Change `-storepass` and `-keypass` to secure passwords
- Store the keystore file safely (don't commit to git)
- Keep the alias, passwords, and keystore path for signing

## Building

### One-Command Build

From the repo root:

```bash
cd packages/android
chmod +x build-web-app.sh
./build-web-app.sh [BACKEND_URL] [BUILD_TYPE]
```

**Examples:**

```bash
# Debug build (default backend: localhost:3001)
./build-web-app.sh

# Release build with custom backend
./build-web-app.sh "https://api.nova.app" release

# Debug build with production backend
./build-web-app.sh "https://api.nova.app" debug
```

### Manual Build Steps

**1. Build frontend:**
```bash
cd packages/frontend
npm install
npm run build
```

**2. Copy assets:**
```bash
cd packages/android
rm -rf app/src/main/assets
mkdir -p app/src/main/assets
cp -r ../frontend/dist/* app/src/main/assets/
```

**3. Build APK:**
```bash
# Debug
./gradlew assembleDebug

# Release (unsigned)
./gradlew assembleRelease
```

**4. Sign APK:**
```bash
chmod +x sign-apk.sh
./sign-apk.sh \
    build/outputs/apk/release/app-release-unsigned.apk \
    build/outputs/apk/release/app-release.apk \
    ~/.android/release.keystore \
    nova \
    password
```

## Installation

### Via ADB (Android Debug Bridge)

```bash
# List connected devices
adb devices

# Install APK
adb install -r build/outputs/apk/release/app-release.apk

# Or debug APK
adb install -r build/outputs/apk/debug/app-debug.apk

# Launch app
adb shell am start -n com.nova.app/.MainActivity

# View logs
adb logcat | grep NovaAndroid
```

### Via Android Studio

1. Open `packages/android/` in Android Studio
2. Click **Run** → **Run 'app'**
3. Select target device/emulator

## Configuration

### Backend URL

Edit `packages/android/app/build.gradle.kts`:

```kotlin
buildTypes {
    debug {
        buildConfigField("String", "BACKEND_URL", "\"http://localhost:3001\"")
    }
    release {
        buildConfigField("String", "BACKEND_URL", "\"https://api.nova.app\"")
    }
}
```

Or via CLI:

```bash
./gradlew assembleRelease -PBACKEND_URL="https://api.nova.app"
```

### App Name & Icon

**App Name:**
- Edit `app/src/main/res/values/strings.xml`
- Change `<string name="app_name">Nova AI</string>`

**App Icon:**
1. Place PNG/SVG icon at `app/src/main/res/drawable/ic_launcher_foreground.xml`
2. Edit `app/src/main/res/values/colors_launcher.xml` for background color
3. Android will generate adaptive icons for all densities

**Splash Screen:**
- Add splash image to `app/src/main/res/drawable/ic_splash.xml`
- Use in `MainActivity.onCreate()` if needed

### RTL Support

Already enabled in `AndroidManifest.xml`:

```xml
android:supportsRtl="true"
```

Frontend HTML already uses `dir="rtl"` — no additional changes needed.

## Troubleshooting

### "ANDROID_HOME not set"

```bash
export ANDROID_HOME=/path/to/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### "Gradle wrapper not found"

Initialize Gradle:

```bash
cd packages/android
gradlew wrapper --gradle-version 8.2.0
```

### WebView not loading content

1. Check assets were copied: `ls app/src/main/assets/`
2. Verify `index.html` is in assets root
3. Check Android logs: `adb logcat | grep WebView`
4. Ensure INTERNET permission in `AndroidManifest.xml`

### Backend connection fails

- **Debug build:** Check backend running on `localhost:3001`
- **Release build:** Verify backend URL in `build.gradle.kts`
- **Network settings:** Check cleartext traffic is allowed for backend domain
  - Edit `app/src/main/res/xml/network_security_config.xml` if needed

### App crashes on startup

1. Check logcat: `adb logcat -s Android:*`
2. Verify no syntax errors in Kotlin code
3. Clean build: `./gradlew clean assemble{Debug,Release}`

## Development Workflow

1. **Frontend changes:**
   - Edit `packages/frontend/src/**`
   - Run `npm run dev` for hot reload (web)
   - Run `npm run build` when ready for APK

2. **Native changes:**
   - Edit `app/src/main/kotlin/**` (Kotlin code)
   - Edit `app/src/main/res/**` (layouts, strings, etc.)
   - Rebuild APK: `./build-web-app.sh`

3. **Test on device:**
   - Install APK: `adb install -r build/outputs/apk/debug/app-debug.apk`
   - View logs: `adb logcat | grep Nova`
   - Restart app: `adb shell am force-stop com.nova.app && adb shell am start -n com.nova.app/.MainActivity`

## JavaScript Bridge Usage

In frontend React code:

```typescript
// Check if bridge is available
if (typeof (window as any).NovaAndroid !== 'undefined') {
    const bridge = (window as any).NovaAndroid;
    
    // Show toast
    bridge.showToast('Hello from React!', 'short');
    
    // Get backend URL
    const apiUrl = bridge.getBackendUrl();
    
    // Pick file
    bridge.pickFile('image/*');
    
    // Share content
    bridge.shareContent('Check this out', 'Visit Nova AI!');
    
    // Go fullscreen
    bridge.toggleFullscreen(true);
    
    // Debug log
    bridge.log('React', 'App loaded successfully');
}
```

## Release Checklist

- [ ] Update version in `build.gradle.kts` (`versionCode`, `versionName`)
- [ ] Update app name in `strings.xml`
- [ ] Update app icon and splash screen
- [ ] Test on multiple devices (phone, tablet)
- [ ] Test RTL layout (if Arabic content)
- [ ] Test backend connection
- [ ] Create release keystore (if not exists)
- [ ] Build release APK: `./build-web-app.sh https://api.nova.app release`
- [ ] Verify APK signature: `apksigner verify app-release.apk`
- [ ] Upload to Google Play Console

## WebToApp Architecture Mapping

This project adapts the following techniques from WebToApp:

| Feature | WebToApp | Nova AI | Notes |
|---------|----------|--------|---------|
| WebView loading | File scheme | WebViewAssetLoader | More secure, HTTPS protocol |
| Asset packing | Assets dir | app/src/main/assets | Same approach |
| JS Bridge | JavascriptInterface | WebViewBridge.kt | Enhanced with more APIs |
| APK signing | apksigner (custom) | apksigner.sh | Modern V1/V2/V3 support |
| Config at build | gradle.properties | BuildConfig fields | Kotlin-based configuration |
| Offline-first | ✓ | ✓ | Assets bundled, network optional |
| SDK version | Low (API 21) | Modern (API 35) | Play Store compliance |

## File Structure

```
packages/android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── assets/                 # Frontend dist files (auto-populated)
│   │   │   ├── kotlin/com/nova/app/
│   │   │   │   ├── MainActivity.kt     # WebView setup
│   │   │   │   └── bridge/
│   │   │   │       └── WebViewBridge.kt  # JS Bridge
│   │   │   └── res/                    # Resources (layouts, strings, colors)
│   │   └── test/                       # Unit tests
│   ├── build.gradle.kts                # App-level config
│   └── proguard-rules.pro              # Code shrinking rules
├── build-gradle.kts                    # Root build config
├── settings.gradle.kts                 # Project structure
├── gradle.properties                   # Gradle config
├── build-web-app.sh                    # One-command build script
├── sign-apk.sh                         # APK signing script
└── README.md                           # This file
```

## Contributing

For modifications:

1. Follow Kotlin style guide
2. Test on API 24+ (min SDK)
3. Test on API 35 (target SDK)
4. Ensure RTL layout compatibility
5. Document native functions in `WebViewBridge.kt`

## License

MIT (same as Nova AI)

## Support

For issues or questions:
- Check logs: `adb logcat -s Nova`
- Review WebToApp documentation: https://github.com/shiaho777/web-to-app
- Android WebView docs: https://developer.android.com/reference/android/webkit/WebView
