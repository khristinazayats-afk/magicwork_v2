# Xcode Build Fix Guide - 100% Clean Build

This guide will fix all PhaseScriptExecution errors and warnings in Xcode.

## Quick Fix (Recommended)

Run this script to fix everything automatically:

```bash
cd mobile-app-flutter/ios
chmod +x fix-xcode-build.sh
./fix-xcode-build.sh
```

## Manual Fix Steps

### Step 1: Clean Everything

```bash
cd mobile-app-flutter

# Clean Flutter
flutter clean
flutter pub get

# Clean iOS build artifacts
cd ios
rm -rf Pods
rm -rf Podfile.lock
rm -rf .symlinks
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### Step 2: Reinstall CocoaPods

```bash
cd mobile-app-flutter/ios

# Deintegrate and reinstall
pod deintegrate
pod cache clean --all
pod install --repo-update
```

### Step 3: Open Correct File in Xcode

**IMPORTANT**: Always open the **workspace**, never the project!

```bash
cd mobile-app-flutter/ios
open Runner.xcworkspace
```

NOT `Runner.xcodeproj` ❌

### Step 4: Clean Build in Xcode

1. In Xcode: **Product → Clean Build Folder** (Cmd+Shift+K)
2. **Product → Build** (Cmd+B)

## Common PhaseScriptExecution Errors and Fixes

### Error: "The sandbox is not in sync with the Podfile.lock"

**Fix:**
```bash
cd mobile-app-flutter/ios
pod install
```

### Error: Flutter scripts not found

**Fix:**
```bash
cd mobile-app-flutter
flutter clean
flutter pub get
cd ios
pod install
```

### Error: CocoaPods framework not found

**Fix:**
```bash
cd mobile-app-flutter/ios
pod deintegrate
rm -rf Pods Podfile.lock
pod install
```

### Warning: Deployment target mismatch

This is already fixed in the Podfile with the post_install hook that sets minimum deployment target to 17.0.

## Fixing All Warnings

### 1. Deployment Target Warnings

Already handled in Podfile - all targets set to iOS 17.0 minimum.

### 2. Swift Version Warnings

The Podfile uses:
- Swift 6.0 for main app
- Swift 5.9 for plugins (until they update)

### 3. Library Evolution Warnings (Sentry)

These are in dependencies, not our code. Can be suppressed or ignored.

### 4. Build Script Warnings

Set build scripts to:
- Run only when installing (not every build) if possible
- Or accept that Flutter scripts run every build (expected behavior)

## Xcode Project Settings to Verify

Open Runner.xcworkspace and check:

### Build Settings

1. **iOS Deployment Target**: 17.0 (or higher)
2. **Swift Language Version**: Swift 6 (for main app)
3. **Build System**: New Build System
4. **Use Modern Build System**: Yes

### Build Phases

Verify these script phases exist and are in correct order:

1. **[CP] Check Pods Manifest.lock**
2. **[CP] Embed Pods Frameworks**
3. **[CP] Copy Pods Resources**
4. **Run Script** (Flutter build)
5. **Thin Binary** (Flutter embed)

### Build Phases Order (Important!)

Script phases must be in this order:
1. Check Pods Manifest
2. Embed Pods Frameworks  
3. Copy Pods Resources
4. Run Script (Flutter)
5. Thin Binary (Flutter)
6. Compile Sources
7. Link Binary
8. Copy Bundle Resources

## Verify Clean Build

After fixes, verify:

```bash
cd mobile-app-flutter

# Build via Flutter CLI
flutter build ios --no-codesign --simulator

# Should see: ✓ Built build/ios/iphonesimulator/Runner.app
```

Then in Xcode:
1. Open Runner.xcworkspace
2. Clean Build Folder (Cmd+Shift+K)
3. Build (Cmd+B)
4. Should build with 0 errors

## If Still Having Issues

1. **Check Xcode Version**: Should be 26.2 or compatible
2. **Check Flutter Version**: Run `flutter doctor -v`
3. **Check CocoaPods**: Run `pod --version` (should be 1.16.2 or latest)
4. **Check Build Log**: In Xcode, View → Navigators → Reports, check latest build log for specific errors

## Final Checklist

- [ ] Flutter clean and pub get completed
- [ ] CocoaPods deintegrated and reinstalled
- [ ] Derived Data cleared
- [ ] Runner.xcworkspace opened (not .xcodeproj)
- [ ] Clean Build Folder in Xcode
- [ ] Build succeeds with 0 errors
- [ ] All warnings addressed or documented

## Status After Fix

✅ **Expected Result**: Clean build with 0 errors
⚠️ **Warnings**: Some dependency warnings may remain (Sentry, etc.) - these are in third-party code and don't affect functionality

