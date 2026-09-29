# Nova AI - Integration Guide

This document explains how the Android app integrates with your Nova AI codebase and WebToApp reference architecture.

## Overview

The Android app wraps your React frontend (from `packages/frontend/dist`) in a native WebView shell with a JavaScript bridge for native capabilities. This follows the **WebToApp architecture** with modern improvements.

## File Mapping & Architecture Decisions

### 1. WebView Shell (MainActivity.kt)

**What it does:**
- Loads frontend HTML/CSS/JS from bundled assets (offline-first)
- Serves assets via HTTPS protocol using WebViewAssetLoader (more secure than file://)
- Manages lifecycle events (back button, orientation, etc.)

**How it compares to WebToApp:**
- ✓ Same asset bundling approach
- ✓ Asset loading in WebView
- ✓ RTL layout support
- ✅ **Improvement:** Uses WebViewAssetLoader (secure HTTPS) instead of file scheme
- ✅ **Improvement:** Modern SDK 35+ (Play Store compliant)

**Key code:**
```kotlin
// Serves assets via: https://appassets.androidplatform.net/
assetLoader = WebViewAssetLoader.Builder()
    .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(this))
    .build()
```

### 2. JavaScript Bridge (WebViewBridge.kt)

**Functions exposed:**
- `showToast()` - Native toasts
- `getBackendUrl()` - Dynamic backend configuration
- `pickFile()` - File selector dialog
- `shareContent()` - Share to other apps
- `toggleFullscreen()` - Immersive mode
- `closeApp()` - Exit the app
- `log()` - Debug logging

**How it compares to WebToApp:**
- ✓ Same `JavascriptInterface` pattern
- ✓ Exposed via `window.NovaAndroid` (configurable name)
- ✅ **Improvement:** More APIs (share, fullscreen, logging)
- ✅ **Improvement:** Null-safe with explicit type handling

**Usage in React:**
```typescript
if (typeof (window as any).NovaAndroid !== 'undefined') {
    const bridge = (window as any).NovaAndroid;
    bridge.showToast('Hello!');
    const url = bridge.getBackendUrl();
}
```

### 3. Build Configuration (BuildConfig)

**Dynamic values (per build type):**
- `BACKEND_URL` - API endpoint (localhost:3001 for debug, https://api.nova.app for release)
- `APP_NAME` - Display name

**How it compares to WebToApp:**
- ✓ Gradle build config approach
- ✅ **Improvement:** Kotlin BuildConfig (type-safe)
- ✅ **Improvement:** Per-build-type configuration

**Setup in build.gradle.kts:**
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

### 4. APK Signing (sign-apk.sh)

**What it does:**
- Creates/loads release keystore
- Signs APK with apksigner (V1/V2/V3 schemes)
- Verifies signature

**How it compares to WebToApp:**
- ✓ Same apksigner approach
- ✅ **Improvement:** Automatic keystore generation
- ✅ **Improvement:** Multi-scheme signing (V1 + V2 + V3)
- ✅ **Improvement:** Verification step built-in

**Flow:**
```bash
# In build-web-app.sh:
1. Build frontend (npm run build)
2. Copy dist → assets
3. Build APK (./gradlew assembleRelease)
4. Sign APK (./sign-apk.sh)
5. Verify signature (apksigner verify)
```

### 5. Asset Packaging

**Location:** `app/src/main/assets/`

**What goes there:**
- Everything from `packages/frontend/dist/`
  - index.html
  - js/*.js (bundled by Vite)
  - css/*.css (Tailwind output)
  - assets/* (images, icons, etc.)

**How it's served:**
```kotlin
// WebView loads: https://appassets.androidplatform.net/index.html
// Android maps this to: app/src/main/assets/index.html
// All requests go through WebViewAssetLoader
```

**Offline-first advantage:**
- App loads instantly (no network required for UI)
- Only API calls need backend connection
- Better UX in poor connectivity

### 6. Network Configuration

**File:** `app/src/main/res/xml/network_security_config.xml`

**What it does:**
- Allows cleartext (HTTP) only for localhost (debug)
- Requires HTTPS for production domains
- Protects against man-in-the-middle attacks

**How it compares to WebToApp:**
- ✅ **Improvement:** Security-first approach
- ✅ **Improvement:** Separate dev/prod network policies

### 7. Build Pipeline Scripts

#### build-web-app.sh (One-Command Build)

**What it does:**
1. Checks prerequisites (ANDROID_HOME, Node.js, etc.)
2. Builds frontend (npm run build)
3. Copies assets to Android
4. Configures SDK path
5. Builds APK (Gradle)
6. Signs APK (apksigner)
7. Outputs signed APK

**Usage:**
```bash
cd packages/android
./build-web-app.sh [BACKEND_URL] [BUILD_TYPE]

# Examples:
./build-web-app.sh                              # Debug, localhost:3001
./build-web-app.sh "https://api.nova.app" release  # Release, production
```

#### setup.sh (Initial Setup)

**What it does:**
1. Checks Java, Node.js, Android SDK
2. Installs missing SDK components
3. Initializes Gradle wrapper
4. Installs npm dependencies
5. Creates configuration files

**One-time setup:**
```bash
cd packages/android
./setup.sh
```

#### clean.sh (Clean Build)

**What it does:**
- Removes build artifacts
- Clears Gradle cache (optional)
- Resets assets directory

**Usage:**
```bash
./clean.sh          # Quick clean
./clean.sh --deep   # Deep clean (slower)
```

## Integration Points

### Frontend to Backend

**Flow:**
```
React App (in WebView)
    ↓
  axios.get('/api/...')  (from VITE_API_URL or frontend config)
    ↓
Network request to: BuildConfig.BACKEND_URL (from native bridge)
    ↓
Express Backend (localhost:3001 or https://api.nova.app)
```

**Configuration:**
1. Frontend: `packages/frontend/.env`
   ```
   VITE_API_URL=http://localhost:3001
   ```

2. Android: `packages/android/app/build.gradle.kts`
   ```kotlin
   buildConfigField("String", "BACKEND_URL", "\"http://localhost:3001\"")
   ```

3. React code can use:
   ```typescript
   const backendUrl = typeof (window as any).NovaAndroid !== 'undefined'
       ? (window as any).NovaAndroid.getBackendUrl()
       : process.env.VITE_API_URL;
   ```

### Frontend Build Output

**Input:**
```
packages/frontend/
├── src/              (React + TypeScript)
├── public/           (Static assets)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

**Build command:**
```bash
cd packages/frontend
npm run build  # Output to: dist/
```

**Output (becomes APK assets):**
```
packages/frontend/dist/
├── index.html        (Entry point)
├── js/               (Vite bundled code)
├── css/              (Tailwind output)
└── assets/           (Images, icons, etc.)
```

**Copy to Android:**
```bash
cp -r packages/frontend/dist/* packages/android/app/src/main/assets/
```

## Development Workflow

### For Frontend Changes

1. **Dev mode (with hot reload):**
   ```bash
   cd packages/frontend
   npm run dev  # Runs on http://localhost:3000 with proxy to backend
   ```

2. **When ready for APK:**
   ```bash
   cd packages/android
   ./build-web-app.sh  # Builds frontend, creates APK
   ```

### For Native/Bridge Changes

1. **Edit Kotlin code:**
   ```
   packages/android/app/src/main/kotlin/com/nova/app/
   ├── MainActivity.kt          (WebView setup)
   └── bridge/WebViewBridge.kt  (JS Bridge APIs)
   ```

2. **Rebuild:**
   ```bash
   cd packages/android
   ./gradlew assembleDebug  # Debug APK
   adb install -r build/outputs/apk/debug/app-debug.apk
   ```

3. **Test bridge call from React:**
   ```typescript
   useEffect(() => {
       if (typeof (window as any).NovaAndroid !== 'undefined') {
           (window as any).NovaAndroid.showToast('Bridge works!');
       }
   }, []);
   ```

### For Configuration Changes

1. **Backend URL:**
   ```bash
   # Edit build.gradle.kts, or use CLI:
   ./build-web-app.sh "https://api.nova.app" release
   ```

2. **App Name/Icon:**
   - `strings.xml` - App name
   - `colors.xml` - Colors
   - `drawable/` - Icons
   - `layout/activity_main.xml` - Layout

## Comparison Table: WebToApp vs Nova AI

| Feature | WebToApp | Nova AI |
|---------|----------|----------|
| **Language** | Java | Kotlin |
| **SDK Version** | Low (API 21+) | Modern (API 35+) |
| **Asset Loading** | file:// scheme | WebViewAssetLoader (HTTPS) |
| **JS Bridge** | JavascriptInterface | Enhanced WebViewBridge |
| **Signing** | apksigner | apksigner + automation |
| **Config** | Properties file | BuildConfig + Gradle |
| **Build Script** | Manual steps | Automated build-web-app.sh |
| **Network Security** | Basic | Network security config |
| **RTL Support** | ✓ | ✓ + Tested |
| **Play Store Ready** | ✗ (low SDK) | ✓ (SDK 35+) |

## Troubleshooting Integration Issues

### Bridge Not Available

**Problem:** `typeof (window as any).NovaAndroid === 'undefined'`

**Solution:**
1. Ensure MainActivity calls `addJavascriptInterface()`
2. Check app is running in WebView (not browser)
3. Verify JavaScript is enabled in WebView settings

### Backend Connection Failed

**Problem:** Network requests timeout/fail

**Solution:**
1. Check BuildConfig.BACKEND_URL matches your backend
2. For debug: Ensure backend running on localhost:3001
3. For release: Update URL in build.gradle.kts
4. Check network_security_config.xml allows your domain

### Assets Not Loading

**Problem:** WebView shows blank or 404

**Solution:**
1. Verify assets copied: `ls app/src/main/assets/`
2. Check index.html is at root
3. Rebuild: `./build-web-app.sh`
4. Check WebView logs: `adb logcat | grep WebView`

### APK Too Large

**Problem:** APK size > 100MB

**Solution:**
1. Enable ProGuard/R8 minification in build.gradle.kts
2. Remove unused frontend assets
3. Use App Bundle instead of APK for Play Store

## Next Steps

1. **Setup development environment:**
   ```bash
   cd packages/android
   ./setup.sh
   ```

2. **Build first APK:**
   ```bash
   ./build-web-app.sh
   ```

3. **Test on device:**
   ```bash
   adb install -r build/outputs/apk/debug/app-debug.apk
   ```

4. **Customize:**
   - Update app name in `strings.xml`
   - Add your app icon to `drawable/`
   - Modify backend URL in `build.gradle.kts`

5. **Release:**
   - Create release keystore (see ANDROID_SETUP.md)
   - Build release APK: `./build-web-app.sh https://api.nova.app release`
   - Upload to Google Play Console

## References

- [WebToApp GitHub](https://github.com/shiaho777/web-to-app)
- [Android WebView Documentation](https://developer.android.com/reference/android/webkit/WebView)
- [Android Build Tools](https://developer.android.com/studio/releases/build-tools)
- [Gradle Documentation](https://gradle.org/)
- [Kotlin Documentation](https://kotlinlang.org/)
