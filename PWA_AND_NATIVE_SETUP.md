# PWA and Native App Setup Guide

This document outlines the setup for Progressive Web App (PWA) and native iOS/Android app deployment using Capacitor.

## ✅ PWA Setup (Complete)

### Files Created/Updated:
- ✅ `public/manifest.webmanifest` - Updated with proper app metadata
- ✅ `public/sw.js` - Service worker for offline caching (already existed)
- ✅ `index.html` - Added manifest link
- ✅ `src/main.jsx` - Service worker registration (already configured)

### PWA Features:
- **Offline Support**: Service worker caches static assets
- **Installable**: Users can add to home screen on iOS/Android
- **App-like Experience**: Standalone display mode
- **Theme Colors**: Matches app design (#fcf8f2)

### Testing PWA:
1. Build the app: `npm run build`
2. Serve locally: `npm run preview`
3. Open in Chrome/Edge
4. Check "Application" tab in DevTools → "Manifest" and "Service Workers"
5. Test "Add to Home Screen" functionality

## 📱 Capacitor Setup (Native Apps)

### Installation:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android --save-dev
```

### Configuration:
- ✅ `capacitor.config.json` - Created with app settings
- **App ID**: `co.magicwork.app`
- **App Name**: `magicwork`
- **Web Directory**: `dist` (Vite build output)

### Adding Platforms:

#### iOS:
```bash
npm run capacitor:add:ios
# Or manually:
npx capacitor add ios
```

#### Android:
```bash
npm run capacitor:add:android
# Or manually:
npx capacitor add android
```

### Build and Sync:
```bash
# Build web assets
npm run build

# Sync to native projects
npm run capacitor:sync
```

### Opening Native IDEs:
```bash
# iOS (requires macOS and Xcode)
npm run capacitor:ios

# Android (requires Android Studio)
npm run capacitor:android
```

## 🔧 Native App Configuration

### iOS (`ios/App/App/Info.plist`):
Add these permissions if needed:
```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photos to save practice images.</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to capture practice moments.</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need access to your microphone for voice-guided practices.</string>
```

### Android (`android/app/src/main/AndroidManifest.xml`):
Add these permissions if needed:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## 🚀 Deployment Workflow

### For Web (PWA):
1. `npm run build`
2. Deploy `dist/` folder to Vercel/hosting
3. Ensure HTTPS is enabled (required for PWA)

### For Native Apps:

#### iOS:
1. `npm run build`
2. `npm run capacitor:sync`
3. `npm run capacitor:ios` (opens Xcode)
4. In Xcode:
   - Select your development team
   - Configure signing & capabilities
   - Build and run on simulator/device
   - Archive for App Store submission

#### Android:
1. `npm run build`
2. `npm run capacitor:sync`
3. `npm run capacitor:android` (opens Android Studio)
4. In Android Studio:
   - Configure signing key (for release builds)
   - Build APK/AAB
   - Test on emulator/device
   - Generate signed bundle for Play Store

## 📝 Important Notes

1. **Build Before Sync**: Always run `npm run build` before `npm run capacitor:sync` to ensure latest web assets are copied to native projects.

2. **Environment Variables**: For production, update `capacitor.config.json` server settings to point to your production URL.

3. **Native Plugins**: If you need native features (camera, notifications, etc.), install Capacitor plugins:
   ```bash
   npm install @capacitor/camera @capacitor/push-notifications
   npx cap sync
   ```

4. **Testing**: Test on real devices, not just simulators, especially for:
   - Video/audio playback
   - Network requests
   - Touch interactions
   - Performance

5. **App Store Requirements**:
   - iOS: Requires Apple Developer account ($99/year)
   - Android: Requires Google Play Developer account ($25 one-time)

## 🔍 Troubleshooting

### Service Worker Not Updating:
- Clear browser cache
- Unregister service worker in DevTools
- Check `sw.js` cache version number

### Capacitor Sync Issues:
- Ensure `dist/` folder exists (run `npm run build` first)
- Check `capacitor.config.json` syntax
- Verify platform folders exist (`ios/`, `android/`)

### Native Build Errors:
- Ensure all dependencies are installed: `npm install`
- Check platform-specific requirements (Xcode for iOS, Android Studio for Android)
- Review native logs in Xcode/Android Studio

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (alternative to manual SW setup)

