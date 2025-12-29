#!/bin/bash
# Complete Xcode Build Clean and Fix

set -e

echo "🧹 Cleaning Flutter..."
cd "$(dirname "$0")/.."
flutter clean
flutter pub get

echo ""
echo "🧹 Cleaning iOS build artifacts..."
cd ios
rm -rf Pods Podfile.lock .symlinks
rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true

echo ""
echo "📦 Reinstalling CocoaPods..."
pod deintegrate 2>/dev/null || true
pod cache clean --all 2>/dev/null || true
pod install --repo-update

echo ""
echo "✅ Clean complete!"
echo ""
echo "Next: Open Runner.xcworkspace in Xcode and build (Cmd+B)"

