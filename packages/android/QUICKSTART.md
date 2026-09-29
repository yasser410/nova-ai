# Quick Start Guide - Nova AI Android

Get your Android app built and running in **5 minutes**.

## Prerequisites

- ✓ Java 17+ installed
- ✓ Android SDK 35+ installed
- ✓ Node.js 18+ installed
- ✓ `ANDROID_HOME` environment variable set

**Not sure?** Run:
```bash
java -version
node --version
echo $ANDROID_HOME
```

## 1. One-Time Setup (2 min)

```bash
cd packages/android
chmod +x setup.sh
./setup.sh
```

This will:
- ✓ Check your system
- ✓ Download missing SDK components
- ✓ Setup Gradle wrapper
- ✓ Install npm dependencies

## 2. Build APK (2 min)

```bash
./build-web-app.sh
```

**That's it!** Your APK is ready at:
```
build/outputs/apk/debug/app-debug.apk
```

### Build with custom backend:
```bash
./build-web-app.sh "https://api.example.com" release
```

## 3. Install & Run (1 min)

### On Physical Device

1. Connect Android phone via USB
2. Enable Developer Mode (Settings → About → Build number × 7)
3. Enable USB Debugging (Settings → Developer options)
4. Run:
   ```bash
   adb install -r build/outputs/apk/debug/app-debug.apk
   adb shell am start -n com.nova.app/.MainActivity
   ```

### On Emulator

1. Start emulator: `emulator -avd Pixel_6_API_35`
2. Run:
   ```bash
   adb install -r build/outputs/apk/debug/app-debug.apk
   adb shell am start -n com.nova.app/.MainActivity
   ```

## View Logs

```bash
adb logcat | grep Nova
```

## Make Changes

### Frontend changes:
```bash
cd packages/frontend
npm run build
cd ../android
./build-web-app.sh
```

### Native/Bridge changes:
```bash
cd packages/android
./gradlew assembleDebug
adb install -r build/outputs/apk/debug/app-debug.apk
```

## Release Build

1. Create keystore (one-time):
   ```bash
   keytool -genkey -v -keystore ~/.android/release.keystore \
       -keyalg RSA -keysize 2048 -validity 10000 \
       -alias nova -storepass password -keypass password
   ```

2. Build & sign:
   ```bash
   ./build-web-app.sh "https://api.nova.app" release
   ```

3. APK ready: `build/outputs/apk/release/nova-ai-release.apk`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `adb: command not found` | Add `$ANDROID_HOME/platform-tools` to PATH |
| `ANDROID_HOME not set` | `export ANDROID_HOME=/path/to/sdk` |
| `Gradle wrapper not found` | Run `./setup.sh` first |
| `Assets not loading` | Run `./build-web-app.sh` to rebuild |
| `WebView blank` | Check backend URL in BuildConfig |

## Full Documentation

- **Setup guide:** [ANDROID_SETUP.md](ANDROID_SETUP.md)
- **Integration details:** [INTEGRATION.md](INTEGRATION.md)
- **Detailed README:** [README.md](README.md)

## Next Steps

- [ ] Customize app name in `app/src/main/res/values/strings.xml`
- [ ] Add app icon to `app/src/main/res/drawable/`
- [ ] Test bridge: Use `window.NovaAndroid.showToast('Hello!')`
- [ ] Configure backend: Edit `app/build.gradle.kts`
- [ ] Read [INTEGRATION.md](INTEGRATION.md) for architecture details

---

**Need help?** Check the logs:
```bash
adb logcat -s Nova
```

Happy building! 🚀
