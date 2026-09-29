# Nova AI Android - Implementation Complete ✅

## 📱 Project Overview

This Android app transforms your React + Vite + TypeScript frontend (`packages/frontend`) into a native Android APK using:

- **WebView Shell** (Kotlin) with offline asset loading
- **JavaScript Bridge** exposing native APIs (toast, file picker, share, fullscreen)
- **Modern SDK 35+** for Google Play Store compliance
- **Automated Build Pipeline** (one command: `build-web-app.sh`)
- **APK Signing** with automatic keystore management
- **RTL Support** for Arabic UI

Architecture inspired by [WebToApp](https://github.com/shiaho777/web-to-app) with modern improvements.

---

## 🚀 Quick Start

### 1. Setup (first time only)
```bash
cd packages/android
chmod +x setup.sh
./setup.sh
```

### 2. Build APK
```bash
cd packages/android
./build-web-app.sh
```

### 3. Install on Device
```bash
adb install -r build/outputs/apk/debug/app-debug.apk
```

**Full quick start guide:** [QUICKSTART.md](packages/android/QUICKSTART.md)

---

## 📂 Directory Structure

```
packages/android/                          # Android project root
├── app/src/main/
│   ├── AndroidManifest.xml                # App permissions & activities
│   ├── kotlin/com/nova/app/
│   │   ├── MainActivity.kt                # WebView shell (loads frontend)
│   │   └── bridge/
│   │       └── WebViewBridge.kt           # JS Bridge APIs
│   ├── assets/                            # Frontend dist (auto-populated)
│   │   ├── index.html
│   │   ├── js/
│   │   ├── css/
│   │   └── assets/
│   └── res/
│       ├── layout/activity_main.xml       # UI layout
│       ├── values/strings.xml             # App name & strings
│       ├── values/colors.xml              # Color scheme
│       ├── xml/network_security_config.xml # Network policy
│       └── mipmap-*/ & drawable/          # Icons & splash
├── build.gradle.kts                       # App build config
├── proguard-rules.pro                     # Code shrinking rules
├── build.gradle.kts (root)                # Project config
├── settings.gradle.kts                    # Module config
├── gradle.properties                      # Gradle settings
├── build-web-app.sh                       # ONE-COMMAND BUILD SCRIPT
├── sign-apk.sh                            # APK signing utility
├── setup.sh                               # Initial setup
├── clean.sh                               # Clean build artifacts
├── README.md                              # Full documentation
├── QUICKSTART.md                          # 5-minute guide
├── ANDROID_SETUP.md                       # Environment setup
└── INTEGRATION.md                         # Architecture & design
```

---

## 🏗️ Architecture Decisions

### WebView Asset Loading
- **Method:** WebViewAssetLoader (HTTPS protocol)
- **Why:** More secure than file:// scheme, supports modern WebView features
- **Assets location:** `app/src/main/assets/` (populated from `packages/frontend/dist`)

### JavaScript Bridge
- **Pattern:** JavascriptInterface (Android standard)
- **Exposed as:** `window.NovaAndroid` (configurable)
- **APIs:**
  - `showToast(message, duration)`
  - `getBackendUrl()` - Dynamic backend configuration
  - `getAppName()`
  - `pickFile(mimeType)`
  - `shareContent(title, text)`
  - `toggleFullscreen(enable)`
  - `closeApp()`
  - `log(tag, message)`

### Configuration at Build Time
- **Backend URL:** Per build type (debug vs release)
  ```kotlin
  debug:   http://localhost:3001
  release: https://api.nova.app
  ```
- **Storage:** BuildConfig (Kotlin-safe, type-checked)
- **Override via CLI:**
  ```bash
  ./build-web-app.sh "https://api.nova.app" release
  ```

### Modern SDK Compliance
- **Target SDK:** 35 (latest)
- **Min SDK:** 24 (Android 7.0+)
- **Why SDK 35:** Play Store requirement, security updates, modern APIs
- **Unlike WebToApp:** Not using low-targetSdk trick (blocked by Play Store)

---

## 📋 Build Pipeline

### `build-web-app.sh` Workflow

```
1. Validate prerequisites (Java, Node.js, Android SDK)
   ↓
2. Build frontend (npm run build in packages/frontend/dist)
   ↓
3. Copy assets (dist → app/src/main/assets/)
   ↓
4. Configure Android SDK path (local.properties)
   ↓
5. Assemble APK (./gradlew assembleRelease)
   ↓
6. Sign APK (apksigner with keystore)
   ↓
7. Verify signature
   ↓
8. Output: build/outputs/apk/release/nova-ai-release.apk
```

**Usage Examples:**
```bash
# Debug build (localhost:3001)
./build-web-app.sh

# Release with custom backend
./build-web-app.sh "https://api.nova.app" release

# Debug with production backend
./build-web-app.sh "https://api.nova.app" debug
```

---

## 🔐 Security Features

1. **Network Security Config** (`network_security_config.xml`)
   - Cleartext (HTTP) only for localhost (debug)
   - HTTPS required for production domains
   - Prevents MITM attacks

2. **APK Signing**
   - V1/V2/V3 signing schemes (modern standard)
   - Automatic keystore generation
   - Signature verification

3. **WebView Security**
   - JavaScript enabled (needed for bridge)
   - DOM storage enabled (for app data)
   - Offline-first assets (no reliance on network for UI)

---

## 🌍 RTL Support (Arabic)

✅ **Already enabled:**
- `AndroidManifest.xml`: `android:supportsRtl="true"`
- `index.html`: `lang="ar" dir="rtl"`
- Tailwind CSS configured for RTL

No additional changes needed—RTL will work automatically.

---

## 📦 Frontend Integration

### Build Output
```
packages/frontend/dist/        (from: npm run build)
├── index.html
├── js/
│   ├── index-xxxxx.js        (bundled by Vite)
│   └── vendor-xxxxx.js
├── css/
│   └── index-xxxxx.css       (Tailwind output)
└── assets/
    ├── nova-icon.svg
    └── ...
```

### Copied to Android
```
packages/android/app/src/main/assets/  (auto-populated by build-web-app.sh)
```

### Served in WebView
```
https://appassets.androidplatform.net/index.html
```

### Backend Connectivity
```typescript
// In React code:
const backendUrl = typeof (window as any).NovaAndroid !== 'undefined'
    ? (window as any).NovaAndroid.getBackendUrl()  // "http://localhost:3001"
    : process.env.VITE_API_URL;

// Use for API calls:
const response = await axios.get(`${backendUrl}/api/...`);
```

---

## 🛠️ Development Workflow

### Frontend Changes (React/Vite)
1. Edit `packages/frontend/src/**`
2. Test locally: `npm run dev` (hot reload)
3. When ready: `npm run build`
4. Rebuild APK: `./build-web-app.sh`

### Native/Bridge Changes (Kotlin)
1. Edit `packages/android/app/src/main/kotlin/**`
2. Rebuild: `./gradlew assembleDebug`
3. Install: `adb install -r build/outputs/apk/debug/app-debug.apk`
4. Test: `adb logcat | grep Nova`

### Configuration Changes
1. **Backend URL:** Edit `app/build.gradle.kts` or use CLI
   ```bash
   ./build-web-app.sh "https://api.nova.app" release
   ```
2. **App Name:** Edit `app/src/main/res/values/strings.xml`
3. **Icons:** Replace `app/src/main/res/drawable/ic_launcher_*`

---

## 📚 Documentation

| Document | Purpose |
|----------|----------|
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup & build guide |
| [README.md](README.md) | Complete reference manual |
| [ANDROID_SETUP.md](ANDROID_SETUP.md) | Environment setup for all platforms |
| [INTEGRATION.md](INTEGRATION.md) | Architecture & design decisions |

---

## ✅ WebToApp Techniques Adopted

| Feature | WebToApp | Nova AI | Status |
|---------|----------|--------|---------|
| WebView loading | ✅ | ✅ WebViewAssetLoader | **Improved** |
| Asset bundling | ✅ | ✅ Offline-first | **Same** |
| JS Bridge | ✅ JavascriptInterface | ✅ WebViewBridge.kt | **Enhanced** |
| APK signing | ✅ apksigner | ✅ apksigner + automation | **Enhanced** |
| Build config | ✅ Properties | ✅ BuildConfig + Gradle | **Improved** |
| Network setup | ✅ Basic | ✅ Security config | **Enhanced** |
| SDK version | ❌ Low (API 21) | ✅ Modern (API 35) | **Upgraded** |
| Play Store ready | ❌ | ✅ | **Fixed** |

---

## 🔧 Customization

### Change App Name
```bash
vim packages/android/app/src/main/res/values/strings.xml
# Change: <string name="app_name">Nova AI</string>
```

### Change Backend URL
```bash
vim packages/android/app/build.gradle.kts
# Edit: buildConfigField("String", "BACKEND_URL", ...)
```

### Change App Icon
1. Prepare PNG/SVG icon
2. Place in `app/src/main/res/drawable/ic_launcher_foreground.xml`
3. Update `app/src/main/res/values/colors_launcher.xml` for background
4. Android will generate adaptive icons automatically

### Create Release Keystore
```bash
keytool -genkey -v -keystore ~/.android/release.keystore \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -alias nova -storepass password -keypass password \
    -dname "CN=Nova AI, O=Nova, C=SA"
```

---

## 🐛 Troubleshooting

### Common Issues

**"ANDROID_HOME not set"**
```bash
export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**"Gradle wrapper not found"**
```bash
./setup.sh  # Will initialize wrapper
```

**"WebView blank / 404"**
```bash
# Ensure frontend was built:
cd packages/frontend
npm run build
cd ../android
./build-web-app.sh
```

**"Backend connection fails"**
```bash
# Check BuildConfig:
adb shell dumpsys package com.nova.app | grep BACKEND

# Verify backend running:
curl http://localhost:3001/health
```

**View detailed logs:**
```bash
adb logcat -s Nova
adb logcat | grep WebView
adb logcat | grep D/Gradle
```

---

## 📦 Release Checklist

- [ ] Update version in `build.gradle.kts` (`versionCode`, `versionName`)
- [ ] Update app name in `strings.xml`
- [ ] Add app icon to `drawable/`
- [ ] Test on multiple devices (phone, tablet, emulator)
- [ ] Test RTL layout (if Arabic content)
- [ ] Test backend connectivity
- [ ] Create/verify release keystore
- [ ] Build release APK:
  ```bash
  ./build-web-app.sh "https://api.nova.app" release
  ```
- [ ] Verify APK:
  ```bash
  apksigner verify build/outputs/apk/release/nova-ai-release.apk
  ```
- [ ] Upload to Google Play Console

---

## 🔗 Useful Links

- **WebToApp Reference:** https://github.com/shiaho777/web-to-app
- **Android WebView Docs:** https://developer.android.com/reference/android/webkit/WebView
- **Android Build Tools:** https://developer.android.com/studio/releases/build-tools
- **Gradle Documentation:** https://gradle.org/
- **Kotlin Documentation:** https://kotlinlang.org/
- **Google Play Console:** https://play.google.com/console/

---

## 📞 Support

**For issues:**
1. Check logs: `adb logcat -s Nova`
2. Read troubleshooting sections in documentation
3. Verify prerequisites: `./setup.sh`
4. Clean rebuild: `./clean.sh && ./build-web-app.sh`

---

## 📄 License

MIT (same as Nova AI)

---

## 🎉 Next Steps

1. **Run setup:**
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
   adb shell am start -n com.nova.app/.MainActivity
   ```

4. **Customize & iterate**

5. **Read full documentation:**
   - [QUICKSTART.md](QUICKSTART.md) for fast setup
   - [README.md](README.md) for detailed reference
   - [INTEGRATION.md](INTEGRATION.md) for architecture

---

**Happy building! 🚀**
