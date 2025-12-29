#!/bin/bash
# Build and Fix Xcode Errors Iteratively

set -e  # Exit on error, but we'll handle errors manually

cd "$(dirname "$0")"

echo "🔧 Building and fixing Xcode errors iteratively..."
echo ""

# Clean everything first
echo "1. Cleaning..."
cd ..
flutter clean
rm -rf ios/Pods ios/Podfile.lock ios/.symlinks
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Generate Flutter files (required for pod install)
echo ""
echo "2. Generating Flutter files..."
flutter pub get

# Reinstall pods
echo ""
echo "3. Installing pods..."
cd ios
pod install --repo-update

# Build and capture errors
echo ""
echo "4. Building and capturing errors..."
xcodebuild -workspace Runner.xcworkspace \
  -scheme Runner \
  -sdk iphonesimulator \
  -configuration Debug \
  build CODE_SIGNING_ALLOWED=NO \
  2>&1 | tee /tmp/xcode_build_errors.log

# Check if log file exists
if [ ! -f /tmp/xcode_build_errors.log ]; then
  echo "❌ Build log file not found. Build may have failed early."
  exit 1
fi

# Check build result
if grep -q "BUILD SUCCEEDED" /tmp/xcode_build_errors.log; then
  echo ""
  echo "✅ BUILD SUCCEEDED!"
  echo ""
  echo "Checking for warnings..."
  WARNINGS=$(grep -c "warning:" /tmp/xcode_build_errors.log || echo "0")
  ERRORS=$(grep -c "error:" /tmp/xcode_build_errors.log || echo "0")
  echo "Errors: $ERRORS"
  echo "Warnings: $WARNINGS"
  
  if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo ""
    echo "🎉 100% CLEAN BUILD - No errors or warnings!"
  else
    echo ""
    echo "⚠️  Build succeeded but has warnings/errors. Review /tmp/xcode_build_errors.log"
  fi
else
  echo ""
  echo "❌ BUILD FAILED"
  echo ""
  echo "Errors found:"
  grep "error:" /tmp/xcode_build_errors.log | head -20
  echo ""
  echo "Full log: /tmp/xcode_build_errors.log"
  exit 1
fi

