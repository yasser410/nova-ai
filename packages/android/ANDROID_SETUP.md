# Android Development Environment Setup

Complete guide to set up your machine for building Nova AI Android app.

## macOS Setup

### 1. Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Java 17

```bash
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

Verify:
```bash
java -version
# Should output: openjdk version "17.x.x"
```

### 3. Install Android SDK

**Option A: Via Homebrew**
```bash
brew install android-sdk
```

**Option B: Android Studio (recommended)**
- Download from https://developer.android.com/studio
- Install SDK from Android Studio IDE

### 4. Configure Environment Variables

Add to `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=/opt/homebrew/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/build-tools/35.0.0
```

Reload shell:
```bash
source ~/.zshrc
```

### 5. Install SDK Components

```bash
# Use sdkmanager
sudo $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --install \
  "platforms;android-35" \
  "build-tools;35.0.0" \
  "platform-tools" \
  "tools"
```

### 6. Verify Installation

```bash
adb --version
# Should output: Android Debug Bridge version ...

gradule --version
# Should output: Gradle 8.2 or higher
```

---

## Linux Setup

### 1. Install Java 17

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install openjdk-17-jdk
```

**Fedora:**
```bash
sudo dnf install java-17-openjdk
```

Verify:
```bash
java -version
```

### 2. Install Android SDK

```bash
mkdir -p ~/Android/Sdk
cd ~/Android/Sdk

# Download from https://developer.android.com/studio (command-line tools)
# Extract to this directory

# Or use package manager:
sudo apt install android-sdk  # Ubuntu
sudo dnf install android-tools  # Fedora
```

### 3. Configure Environment Variables

Add to `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/build-tools/35.0.0
```

Reload:
```bash
source ~/.bashrc
```

### 4. Install SDK Components

```bash
sdkmanager --install \
  "platforms;android-35" \
  "build-tools;35.0.0" \
  "platform-tools" \
  "tools"
```

### 5. Accept Licenses (sometimes needed)

```bash
sdkmanager --licenses
# Accept all licenses
```

### 6. Verify Installation

```bash
adb version
gradle --version
```

---

## Windows Setup

### 1. Install Java 17

- Download from https://www.oracle.com/java/technologies/downloads/#java17
- Run installer
- Add to PATH: `C:\Program Files\Java\jdk-17.x.x\bin`

Verify in Command Prompt:
```cmd
java -version
```

### 2. Install Android Studio

- Download from https://developer.android.com/studio
- Run installer
- During setup, select Android SDK (35+) and Build Tools (35.0.0+)
- Installation typically goes to: `C:\Users\YourUsername\AppData\Local\Android\Sdk`

### 3. Set Environment Variables

**Via GUI:**
1. Press `Win + X` → System
2. Advanced system settings → Environment Variables
3. New User Variable:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
4. Add to PATH: `%ANDROID_HOME%\platform-tools`

**Via PowerShell:**
```powershell
[Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\YourUsername\AppData\Local\Android\Sdk', 'User')
[Environment]::SetEnvironmentVariable('PATH', $env:PATH + ';' + $env:ANDROID_HOME + '\platform-tools', 'User')
```

### 4. Verify Installation

Open Command Prompt:
```cmd
adb version
gradle --version
```

---

## Docker Setup (Alternative)

If you prefer containerized build environment:

```dockerfile
FROM gradle:8.2.0-jdk17

RUN apt-get update && apt-get install -y \
    android-sdk-platform-tools \
    android-sdk-build-tools \
    && rm -rf /var/lib/apt/lists/*

ENV ANDROID_SDK_ROOT=/android-sdk
RUN mkdir -p $ANDROID_SDK_ROOT

WORKDIR /app
COPY . .

RUN ./gradlew build
```

Build:
```bash
docker build -t nova-android-build .
docker run -v $PWD:/app nova-android-build ./build-web-app.sh
```

---

## Connect Device for Testing

### Enable Developer Mode (Android Device)

1. Open Settings → About phone
2. Tap "Build number" 7 times
3. Go to Settings → Developer options
4. Enable "USB Debugging"
5. Connect USB cable to computer

### Verify Connection

```bash
adb devices
# Should list your device
```

### Grant Permissions

On device: Accept USB debugging dialog

On computer:
```bash
adb shell pm grant com.nova.app android.permission.INTERNET
```

---

## Emulator Setup (Optional)

### Create Virtual Device

**Via Android Studio:**
1. Tools → Device Manager
2. Create Device
3. Select Pixel 6 (or preferred device)
4. Select API 35 (Android 15)
5. Click Create

**Via CLI:**
```bash
avdmanager create avd \
  -n "Pixel_6_API_35" \
  -k "system-images;android-35;default;x86_64" \
  -d "Pixel 6"
```

### Launch Emulator

```bash
emulator -avd Pixel_6_API_35
```

### Test

```bash
adb devices  # Should list emulator
adb install build/outputs/apk/debug/app-debug.apk
```

---

## Troubleshooting

### "adb: command not found"

```bash
# macOS
export PATH=$PATH:/opt/homebrew/opt/android-sdk/platform-tools

# Linux
export PATH=$PATH:$HOME/Android/Sdk/platform-tools

# Windows: Add to PATH via System Properties
```

### "ANDROID_HOME not found"

```bash
echo $ANDROID_HOME
# If empty, set it:
export ANDROID_HOME=/path/to/android/sdk
```

### Gradle Daemon Issues

```bash
./gradlew --stop  # Stop all daemon processes
./gradlew clean   # Clean build
```

### SDK Component Missing

```bash
sdkmanager --list  # List available
sdkmanager --install "platforms;android-35"  # Install specific
```

### Permission Denied on Linux

```bash
chmod +x build-web-app.sh
chmod +x sign-apk.sh
```

---

## Next Steps

Once setup is complete:

1. Navigate to Nova AI repository:
   ```bash
   cd nova-ai/packages/android
   ```

2. Connect device or start emulator

3. Build and run:
   ```bash
   ./build-web-app.sh
   adb install -r build/outputs/apk/debug/app-debug.apk
   ```

4. Check logs:
   ```bash
   adb logcat | grep Nova
   ```

Happy building! 🚀
