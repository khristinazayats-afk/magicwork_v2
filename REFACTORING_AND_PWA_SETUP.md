# Refactoring and PWA Setup Plan

## Status
- ✅ Created smaller components: `PracticeCard.jsx`, `FilterSheet.jsx`, `FullScreenPracticeView.jsx`
- ⚠️ Syntax error in `PracticesTab.jsx` preventing build (unterminated regex at line 1530)
- ⏳ PWA configuration not yet added
- ⏳ Capacitor configuration not yet added

## Next Steps

### 1. Fix Syntax Error
The build error is caused by orphaned legacy code. The file needs:
- Complete removal of old card structure (lines 1473-1770 were removed but some remnants remain)
- Proper closing of all JSX tags

### 2. Complete Component Refactoring
- Replace remaining inline card code with `PracticeCard` component
- Replace filter sheet with `FilterSheet` component
- Replace full-screen view with `FullScreenPracticeView` component

### 3. PWA Configuration
Create:
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service worker
- Update `index.html` to register service worker
- Add icons for iOS and Android

### 4. Capacitor Setup (for Native Apps)
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
npx cap add ios
npx cap add android
```

## Files Created
- `src/components/in-the-space/PracticeCard.jsx`
- `src/components/in-the-space/FilterSheet.jsx`
- `src/components/in-the-space/FullScreenPracticeView.jsx`

## Files Needing Fixes
- `src/components/in-the-space/PracticesTab.jsx` - Syntax error at line 1530

