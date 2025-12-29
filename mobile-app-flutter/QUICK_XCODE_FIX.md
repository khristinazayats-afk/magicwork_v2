# Quick Xcode Build Fix

## To Fix PhaseScriptExecution Error and All Warnings:

### Option 1: Use the Automated Script (Fastest)

```bash
cd mobile-app-flutter/ios
./clean-and-build.sh
```

Then in Xcode:
1. Open `Runner.xcworkspace` (NOT .xcodeproj)
2. Product → Clean Build Folder (Cmd+Shift+K)
3. Product → Build (Cmd+B)

### Option 2: Manual Steps

```bash
cd mobile-app-flutter

# Clean Flutter
flutter clean
flutter pub get

# Clean iOS
cd ios
rm -rf Pods Podfile.lock
pod install

# Clean Xcode Derived Data
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

Then open `Runner.xcworkspace` in Xcode and build.

## What This Fixes

✅ PhaseScriptExecution errors (CocoaPods script failures)  
✅ Deployment target warnings  
✅ Swift version warnings  
✅ All build warnings suppressed via Podfile  
✅ Clean build artifacts  

## Expected Result

Build succeeds with **0 errors** and minimal warnings (only dependency warnings that don't affect functionality).

