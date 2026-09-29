# Integration with Nova AI Monorepo

This guide explains how the Android project integrates with your existing Nova AI setup.

## Current Monorepo Structure

```
nova-ai/
├── packages/
│   ├── frontend/          # React + Vite + TypeScript
│   │   ├── src/           # React source
│   │   ├── dist/          # Built output (npm run build)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── ...
│   ├── backend/           # Express server (localhost:3001)
│   │   └── ...
│   ├── core/              # Shared utilities
│   │   └── ...
│   └── android/ ✨ NEW    # Android app (this project)
│       ├── app/           # Kotlin source + resources
│       ├── build-web-app.sh   # ONE-COMMAND BUILD
│       ├── README.md
│       └── ...
├── docker-compose.yml     # Backend services
├── setup.sh               # Root setup script
└── ...
```

## Build Pipeline Integration

### 1. Frontend → Android Flow

```
packages/frontend/src/
  ↓ (npm run build)
packages/frontend/dist/
  ↓ (build-web-app.sh copies)
packages/android/app/src/main/assets/
  ↓ (Gradle packages)
app-debug.apk / app-release.apk
```

### 2. Backend Connection

```
React App (in WebView)
  ↓
window.NovaAndroid.getBackendUrl()  // Get URL from Android
  ↓
axios.get('http://localhost:3001/api/...')
  ↓
Express Backend (localhost:3001)
```

**Configuration:**
- **Frontend env:** `packages/frontend/.env`
  ```
  VITE_API_URL=http://localhost:3001
  ```
- **Android build:** `packages/android/app/build.gradle.kts`
  ```kotlin
  buildConfigField("String", "BACKEND_URL", "\"http://localhost:3001\"")
  ```

### 3. Development Workflow

**Option A: Web Development**
```bash
cd packages/frontend
npm run dev  # http://localhost:3000 with HMR
              # Proxies to http://localhost:3001
```

**Option B: Android Development**
```bash
cd packages/android
npm run build  # Build frontend
./build-web-app.sh  # Create APK
adb install -r build/outputs/apk/debug/app-debug.apk
```

## One-Command Build

### Build APK from Repository Root

```bash
cd packages/android
./build-web-app.sh [BACKEND_URL] [BUILD_TYPE]
```

**Examples:**

1. **Debug build (default):**
   ```bash
   ./build-web-app.sh
   # Uses: http://localhost:3001 (from backend in docker-compose)
   # Output: build/outputs/apk/debug/app-debug.apk
   ```

2. **Release build:**
   ```bash
   ./build-web-app.sh "https://api.nova.app" release
   # Output: build/outputs/apk/release/nova-ai-release.apk
   ```

3. **Production URL in debug:**
   ```bash
   ./build-web-app.sh "https://api.nova.app" debug
   ```

## Docker Integration

### Run Backend with Docker Compose

From monorepo root:

```bash
docker-compose up -d  # Starts backend on localhost:3001
```

Then build Android app:
```bash
cd packages/android
./build-web-app.sh  # Will connect to localhost:3001 in container
```

### Android Emulator → Docker Container

If using Android emulator, use special host address:
```bash
./build-web-app.sh "http://10.0.2.2:3001" debug
# 10.0.2.2 is emulator's alias for host machine's localhost
```

## File Dependencies

### What Android Reads

1. **Frontend Output** (required):
   ```
   packages/frontend/dist/index.html
   packages/frontend/dist/js/
   packages/frontend/dist/css/
   packages/frontend/dist/assets/
   ```
   → Copied to `packages/android/app/src/main/assets/`

2. **Build Configuration** (optional to modify):
   ```
   packages/android/app/build.gradle.kts
   packages/android/gradle.properties
   packages/android/gradle/wrapper/gradle-wrapper.properties
   ```

3. **Environment** (read automatically):
   ```
   $ANDROID_HOME  (environment variable)
   ~/.android/debug.keystore
   ~/.android/release.keystore
   ```

### What Writes Back

Built artifacts (git-ignored):
```
packages/android/build/
packages/android/.gradle/
*.apk (in build/outputs/)
```

## Customization by Environment

### Development (localhost)

**Setup:**
```bash
# Start backend
docker-compose up -d

# Build app (connects to localhost)
cd packages/android
./build-web-app.sh
```

**Config:**
- Backend: `http://localhost:3001`
- SDK: Any (API 24+)
- Signing: Debug keystore

### Staging (test server)

**Setup:**
```bash
cd packages/android
./build-web-app.sh "https://staging-api.nova.app" release
```

**Config:**
- Backend: `https://staging-api.nova.app`
- SDK: Staging SDK 35
- Signing: Release keystore

### Production (app store)

**Setup:**
```bash
cd packages/android
./build-web-app.sh "https://api.nova.app" release

# Then upload to Play Store
```

**Config:**
- Backend: `https://api.nova.app` (hardcoded)
- SDK: Production SDK 35
- Signing: Production release keystore
- Distribution: Google Play Console

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Set up Android SDK
        uses: android-actions/setup-android@v2
      
      - name: Build APK
        run: |
          cd packages/android
          ./build-web-app.sh "${{ secrets.BACKEND_URL }}" release
      
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release.apk
          path: packages/android/build/outputs/apk/release/
```

## Troubleshooting Monorepo Integration

### Frontend Not Building

```bash
# Check if frontend has changes
cd packages/frontend
git status

# Rebuild
npm install
npm run build

# Verify output
ls -la dist/
```

### Backend Connection Issues

```bash
# 1. Verify backend running
curl http://localhost:3001/health

# 2. Check if Docker container is up
docker-compose ps

# 3. Check if APK has correct URL
adb shell dumpsys package com.nova.app | grep BACKEND

# 4. Check app logs
adb logcat -s Nova
```

### Assets Not in APK

```bash
# 1. Verify frontend dist exists
ls packages/frontend/dist/

# 2. Rebuild frontend
cd packages/frontend
npm run build

# 3. Rebuild app
cd ../android
./clean.sh
./build-web-app.sh
```

## Monorepo-Specific Scripts

### Root-Level Setup (Optional)

Create `setup-android.sh` at repo root:

```bash
#!/bin/bash
cd packages/android
./setup.sh
```

Then: `./setup-android.sh` from repo root

### Build All (Frontend + Android)

Create `build-all.sh` at repo root:

```bash
#!/bin/bash
set -e

echo "Building Nova AI Complete..."
echo ""

# Build frontend
echo "[1/2] Building frontend..."
cd packages/frontend
npm run build
cd ../..

# Build Android
echo "[2/2] Building Android APK..."
cd packages/android
./build-web-app.sh "$@"

echo ""
echo "✅ Complete! APK ready at:"
echo "   packages/android/build/outputs/apk/release/nova-ai-release.apk"
```

Usage:
```bash
chmod +x build-all.sh
./build-all.sh "https://api.nova.app" release
```

## Version Management

### Update App Version

**File:** `packages/android/app/build.gradle.kts`

```kotlin
defaultConfig {
    versionCode = 2      // Increment for each release
    versionName = "1.1.0" // Semantic versioning
}
```

### Sync with Frontend Version

**Recommended:** Keep versions in sync

1. Frontend: `packages/frontend/package.json`
   ```json
   "version": "1.1.0"
   ```

2. Android: `packages/android/app/build.gradle.kts`
   ```kotlin
   versionName = "1.1.0"
   ```

## Next Steps

1. **Initial Setup:**
   ```bash
   cd packages/android
   ./setup.sh
   ```

2. **First Build:**
   ```bash
   # Start backend
   docker-compose up -d
   
   # Build app
   cd packages/android
   ./build-web-app.sh
   ```

3. **Test:**
   ```bash
   adb install -r build/outputs/apk/debug/app-debug.apk
   ```

4. **Customize:**
   - Change backend URL
   - Update app name
   - Add app icon
   - Test on devices

5. **Release:**
   - Create release keystore
   - Build release APK
   - Upload to Play Store

---

**See also:**
- [QUICKSTART.md](packages/android/QUICKSTART.md) - 5-minute guide
- [README.md](packages/android/README.md) - Full documentation
- [ANDROID_SETUP.md](packages/android/ANDROID_SETUP.md) - Environment setup
