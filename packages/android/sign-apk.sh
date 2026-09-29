#!/bin/bash

# APK Signing Script for Nova AI
# Uses apksigner (from Android Build Tools) for proper V1/V2/V3 signing
# Inspired by WebToApp's signing approach

set -e

INPUT_APK="${1:-}"
OUTPUT_APK="${2:-signed.apk}"
KEYSTORE="${3:-$HOME/.android/release.keystore}"
KEYSTORE_ALIAS="${4:-nova}"
KEYSTORE_PASSWORD="${5:-password}"

if [ -z "$INPUT_APK" ] || [ ! -f "$INPUT_APK" ]; then
    echo "Usage: $0 <input-apk> <output-apk> [keystore] [alias] [password]"
    echo ""
    echo "Example:"
    echo "  $0 app-release-unsigned.apk app-release.apk"
    exit 1
fi

# Find apksigner
if [ -z "$ANDROID_HOME" ]; then
    echo "Error: ANDROID_HOME not set"
    exit 1
fi

APKSIGNER="$ANDROID_HOME/build-tools/35.0.0/apksigner"
if [ ! -f "$APKSIGNER" ]; then
    # Try to find any available version
    APKSIGNER=$(find "$ANDROID_HOME/build-tools" -name apksigner | head -1)
    if [ -z "$APKSIGNER" ]; then
        echo "Error: apksigner not found. Please install Android Build Tools 35+"
        exit 1
    fi
fi

# Check keystore
if [ ! -f "$KEYSTORE" ]; then
    echo "Keystore not found at $KEYSTORE"
    echo "Generating new keystore..."
    keytool -genkey -v -keystore "$KEYSTORE" \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias "$KEYSTORE_ALIAS" \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEYSTORE_PASSWORD" \
        -dname "CN=Nova AI, O=Nova, C=SA"
    echo "Keystore created at $KEYSTORE"
fi

echo "Signing APK: $INPUT_APK"

# Sign with V1, V2, and V3 schemes
"$APKSIGNER" sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:"$KEYSTORE_PASSWORD" \
    --ks-key-alias "$KEYSTORE_ALIAS" \
    --key-pass pass:"$KEYSTORE_PASSWORD" \
    --v4-signing-enabled false \
    --out "$OUTPUT_APK" \
    "$INPUT_APK"

echo "Verifying signature..."
"$APKSIGNER" verify --verbose "$OUTPUT_APK"

echo "Successfully signed APK: $OUTPUT_APK"
