#!/bin/bash

# Clean Script - Remove build artifacts and cached files
# Use this when you encounter build issues

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Cleaning Nova AI Android build artifacts..."

# Remove Gradle build cache
rm -rf "$SCRIPT_DIR/build"
rm -rf "$SCRIPT_DIR/app/build"
echo "✓ Removed Gradle build outputs"

# Remove assets (they'll be regenerated)
rm -rf "$SCRIPT_DIR/app/src/main/assets"
mkdir -p "$SCRIPT_DIR/app/src/main/assets"
echo "✓ Cleaned assets directory"

# Remove Gradle cache (optional - slower but thorough)
if [ "$1" == "--deep" ]; then
    rm -rf "$HOME/.gradle/caches"
    echo "✓ Removed Gradle cache"
    rm -rf "$HOME/.gradle/wrapper/dists"
    echo "✓ Removed Gradle wrapper downloads"
fi

echo ""
echo "Clean complete! You can now rebuild with:"
echo "  ./build-web-app.sh"
