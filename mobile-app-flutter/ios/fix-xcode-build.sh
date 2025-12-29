#!/bin/bash
# Fix Xcode Build Errors and Warnings
# This script ensures a 100% clean build

set -e

cd "$(dirname "$0")"

echo "🔧 Fixing Xcode Build Issues..."
echo ""

# Step 1: Clean Flutter
echo "1. Cleaning Flutter build..."
cd ..
flutter clean
flutter pub get

# Step 2: Clean CocoaPods
echo ""
echo "2. Cleaning CocoaPods..."
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf .symlinks
rm -rf Flutter/Flutter.framework
rm -rf Flutter/Flutter.podspec
rm -rf ~/Library/Developer/Xcode/DerivedData

# Step 3: Reinstall CocoaPods
echo ""
echo "3. Reinstalling CocoaPods..."
pod deintegrate || true
pod cache clean --all || true
pod install --repo-update

# Step 4: Clean Xcode Derived Data
echo ""
echo "4. Cleaning Xcode Derived Data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Step 5: Verify Flutter setup
echo ""
echo "5. Verifying Flutter setup..."
cd ..
flutter doctor -v

# Step 6: Build via Flutter first
echo ""
echo "6. Building via Flutter (to verify)..."
flutter build ios --no-codesign --simulator

echo ""
echo "✅ Clean build complete!"
echo ""
echo "Next steps:"
echo "1. Open Runner.xcworkspace (NOT .xcodeproj) in Xcode"
echo "2. Product → Clean Build Folder (Cmd+Shift+K)"
echo "3. Product → Build (Cmd+B)"
echo ""

