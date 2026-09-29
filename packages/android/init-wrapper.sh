#!/bin/bash

# Gradle Wrapper Installation Script
# This initializes the Gradle wrapper for the Android project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing Gradle wrapper..."
cd "$SCRIPT_DIR"

# Check if gradle is available
if ! command -v gradle &> /dev/null; then
    echo "Error: Gradle not installed. Please install Gradle or use Android Studio."
    exit 1
fi

# Create wrapper
gradle wrapper --gradle-version 8.2.0

echo "Gradle wrapper installed successfully!"
echo "You can now use ./gradlew instead of gradle"
