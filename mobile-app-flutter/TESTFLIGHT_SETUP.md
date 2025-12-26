# Magicwork TestFlight Deployment Guide

This guide explains how to prepare and push the Magicwork Flutter app to Apple TestFlight.

## Prerequisites
1. **Apple Developer Account**: You must have an active subscription ($99/year).
2. **App Store Connect**: You need to create an app record.
3. **Xcode**: Installed on your Mac.

## Step 1: Update Project Identifiers
Run the included helper script to set your official Bundle ID and Team ID:

```bash
# Example usage:
./scripts/setup-ios-production.sh "com.magicwork.app" "YOUR_TEAM_ID"
```

## Step 2: Create App in App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com/).
2. Click **My Apps** > **+** > **New App**.
3. **Name**: Magicwork
4. **Primary Language**: English (US)
5. **Bundle ID**: Select the one you set in Step 1.
6. **SKU**: `magicwork-2025` (or any unique string).

## Step 3: Archive and Upload via Xcode
1. Open the project in Xcode:
   ```bash
   open mobile-app-flutter/ios/Runner.xcworkspace
   ```
2. Select **Runner** in the project navigator.
3. Select **Signing & Capabilities** tab.
4. Ensure **Automatically manage signing** is checked and your Team is selected.
5. Set the target device to **Any iOS Device (arm64)**.
6. In the top menu, go to **Product** > **Archive**.
7. Once the build finishes, the Organizer window will open.
8. Click **Distribute App** > **App Store Connect** > **Upload**.
9. Follow the prompts to finish the upload.

## Step 4: Configure TestFlight
1. Back in App Store Connect, go to your app.
2. Select the **TestFlight** tab.
3. Wait for the build to finish processing (usually 10-20 minutes).
4. Add **Internal Testers** (yourself) or create a **Public Link** for external testers.

## Automated Builds (Optional)
For frequent updates, we recommend setting up **Fastlane**.
Run this to initialize:
```bash
cd mobile-app-flutter/ios && fastlane init
```

---
*Context added by Giga TestFlight Setup Guide.*







