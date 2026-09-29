#!/bin/bash

# Nova AI - Build Web App to Android APK
# This script builds the React frontend and packages it into an Android APK

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/packages/frontend"
ANDROID_DIR="$SCRIPT_DIR"
DIST_DIR="$FRONTEND_DIR/dist"
ASSETS_DIR="$ANDROID_DIR/app/src/main/assets"
OUTPUT_DIR="$ANDROID_DIR/build/outputs/apk/release"

# Configuration
APK_NAME="nova-ai-release.apk"
BACK_END_URL="${1:-http://localhost:3001}"
BUILD_TYPE="${2:-release}"  # release or debug

echo -e "${GREEN}=== Nova AI Android Build Pipeline ===${NC}"
echo -e "Frontend dir: $FRONTEND_DIR"
echo -e "Android dir: $ANDROID_DIR"
echo -e "Backend URL: $BACK_END_URL"
echo -e "Build type: $BUILD_TYPE"
echo ""

# Step 1: Build frontend
echo -e "${YELLOW}[1/5] Building React frontend...${NC}"
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

# Step 2: Copy assets to Android
echo -e "${YELLOW}[2/5] Copying frontend assets to Android...${NC}"
rm -rf "$ASSETS_DIR"
mkdir -p "$ASSETS_DIR"
cp -r "$DIST_DIR"/* "$ASSETS_DIR/"
echo -e "${GREEN}✓ Assets copied to $ASSETS_DIR${NC}"

# Step 3: Generate local.properties
echo -e "${YELLOW}[3/5] Configuring Android build...${NC}"
cd "$ANDROID_DIR"

# Get Android SDK path
if [ -z "$ANDROID_HOME" ]; then
    # Try common locations
    if [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    else
        echo -e "${RED}✗ Android SDK not found. Please set ANDROID_HOME environment variable${NC}"
        exit 1
    fi
fi

echo "sdk.dir=$ANDROID_HOME" > local.properties
echo -e "${GREEN}✓ Android SDK configured${NC}"

# Step 4: Build APK
echo -e "${YELLOW}[4/5] Building APK...${NC}"
if [ -f "gradlew" ]; then
    chmod +x gradlew
    ./gradlew "assemble${BUILD_TYPE^}" -PBACKEND_URL="$BACK_END_URL"
else
    echo -e "${RED}✗ Gradle wrapper not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ APK built successfully${NC}"

# Step 5: Sign APK (if release)
if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${YELLOW}[5/5] Signing APK...${NC}"
    
    # Use the signing script if available
    if [ -f "sign-apk.sh" ]; then
        chmod +x sign-apk.sh
        ./sign-apk.sh "$OUTPUT_DIR/app-release-unsigned.apk" "$OUTPUT_DIR/$APK_NAME"
    else
        echo -e "${YELLOW}⚠ Signing script not found, using jarsigner${NC}"
        # Fallback to jarsigner (requires keystore)
        KEYSTORE="$HOME/.android/release.keystore"
        if [ ! -f "$KEYSTORE" ]; then
            echo -e "${RED}✗ Keystore not found at $KEYSTORE${NC}"
            echo -e "${YELLOW}Generate one with: keytool -genkey -v -keystore $KEYSTORE -keyalg RSA -keysize 2048 -validity 10000 -alias nova${NC}"
            exit 1
        fi
        jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "$KEYSTORE" \
            -storepass password -keypass password \
            "$OUTPUT_DIR/app-release-unsigned.apk" nova
        mv "$OUTPUT_DIR/app-release-unsigned.apk" "$OUTPUT_DIR/$APK_NAME"
    fi
    echo -e "${GREEN}✓ APK signed${NC}"
else
    echo -e "${YELLOW}[5/5] Skipping signing for debug build${NC}"
    cp "$OUTPUT_DIR/app-debug.apk" "$OUTPUT_DIR/$APK_NAME"
    echo -e "${GREEN}✓ Debug APK ready${NC}"
fi

# Final summary
echo ""
echo -e "${GREEN}=== Build Complete ===${NC}"
echo -e "APK Location: ${GREEN}$OUTPUT_DIR/$APK_NAME${NC}"
echo ""
echo "To install on device:"
echo "  adb install -r \"$OUTPUT_DIR/$APK_NAME\""
echo ""
echo "To run directly:"
echo "  adb install -r \"$OUTPUT_DIR/$APK_NAME\" && adb shell am start -n com.nova.app/.MainActivity"
