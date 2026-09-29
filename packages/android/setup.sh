#!/bin/bash

# Full Setup Script for Nova AI Android App
# This script sets up everything needed to build the Android app from scratch

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== Nova AI Android Setup ===${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}[1/6] Checking prerequisites...${NC}"

if ! command -v java &> /dev/null; then
    echo -e "${RED}✗ Java not found. Please install JDK 17+${NC}"
    exit 1
fi
java_version=$(java -version 2>&1 | grep version | cut -d' ' -f3)
echo -e "${GREEN}✓ Java $java_version${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
node_version=$(node --version)
echo -e "${GREEN}✓ Node.js $node_version${NC}"

if [ -z "$ANDROID_HOME" ]; then
    echo -e "${RED}✗ ANDROID_HOME not set${NC}"
    echo -e "${YELLOW}Set it with: export ANDROID_HOME=/path/to/android/sdk${NC}"
    exit 1
fi
echo -e "${GREEN}✓ ANDROID_HOME=$ANDROID_HOME${NC}"

# Check SDK components
echo ""
echo -e "${YELLOW}[2/6] Checking Android SDK components...${NC}"

if [ ! -d "$ANDROID_HOME/platforms/android-35" ]; then
    echo -e "${YELLOW}Installing Android SDK 35...${NC}"
    sdkmanager "platforms;android-35"
fi
echo -e "${GREEN}✓ Android SDK 35${NC}"

if [ ! -d "$ANDROID_HOME/build-tools/35.0.0" ]; then
    echo -e "${YELLOW}Installing Build Tools 35.0.0...${NC}"
    sdkmanager "build-tools;35.0.0"
fi
echo -e "${GREEN}✓ Build Tools 35.0.0${NC}"

echo -e "${GREEN}✓ Platform Tools${NC}"

# Setup Gradle wrapper
echo ""
echo -e "${YELLOW}[3/6] Setting up Gradle wrapper...${NC}"
cd "$SCRIPT_DIR"

if [ ! -f "gradlew" ]; then
    chmod +x init-wrapper.sh
    ./init-wrapper.sh
else
    echo -e "${GREEN}✓ Gradle wrapper already initialized${NC}"
fi

# Setup frontend
echo ""
echo -e "${YELLOW}[4/6] Initializing frontend dependencies...${NC}"
cd "$PROJECT_ROOT/packages/frontend"

if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Create local.properties
echo ""
echo -e "${YELLOW}[5/6] Creating Android configuration files...${NC}"
cd "$SCRIPT_DIR"

echo "sdk.dir=$ANDROID_HOME" > local.properties
echo -e "${GREEN}✓ local.properties created${NC}"

# Setup scripts
echo ""
echo -e "${YELLOW}[6/6] Preparing build scripts...${NC}"

chmod +x build-web-app.sh
chmod +x sign-apk.sh
echo -e "${GREEN}✓ Build scripts executable${NC}"

# Summary
echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Build APK:"
echo -e "   ${YELLOW}cd $SCRIPT_DIR${NC}"
echo -e "   ${YELLOW}./build-web-app.sh${NC}"
echo ""
echo "2. Or manual build:"
echo -e "   ${YELLOW}cd packages/frontend && npm run build${NC}"
echo -e "   ${YELLOW}cd ../android && ./gradlew assembleDebug${NC}"
echo ""
echo "3. Install on device:"
echo -e "   ${YELLOW}adb install -r build/outputs/apk/debug/app-debug.apk${NC}"
echo ""
echo "For more info, see README.md"
