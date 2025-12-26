# 🪄 MagicWork — Shared Calm Experience

A minimalist mobile web app that replaces anxious scrolling with moments of shared calm through immersive, sound-based practices.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile device or browser.

## 🎯 What's Built

✅ **Splash Screen** with brand styling and "Start" button to unlock audio  
✅ **Tone.js Generated Soundscapes** - 6 placeholder tracks with different BPMs (55-82)  
✅ **Swipe Navigation** - Vertical swipe up/down to change tracks  
✅ **Smooth Crossfade Transitions** - Seamless audio transitions between tracks  
✅ **Mobile-First Design** - Optimized for mobile devices with touch gestures  
✅ **Brand Design** - Full MagicWork brand colors, fonts, and minimal UI  

## 🎵 Current Tracks (Generated Placeholders)

1. **Deep Calm** 🌙 - 55 BPM - Ultra soothing low tones
2. **Peaceful** 🌊 - 60 BPM - Gentle ambient wash
3. **Centered** 🌸 - 65 BPM - Balanced meditative state
4. **Flow** 🍃 - 68 BPM - Productive calm focus
5. **Bright** ✨ - 75 BPM - Uplifting energy
6. **Energized** ☀️ - 82 BPM - Active and alert

## 📱 How to Use

1. Open the app → See splash screen
2. Tap **"Start"** to unlock audio
3. Listen to the ambient soundscape
4. **Swipe up** for higher energy / next track
5. **Swipe down** for calmer sounds / previous track
6. Enjoy smooth crossfade transitions

## 🎼 Adding Real Audio Tracks

When your audio files are ready:

1. **Add your MP3 files** to `/public/sounds/`
2. **Update the TRACKS array** in `src/App.jsx`
3. **Modify the audio playback logic** (see TODO comments in code)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite 6** - Build tool and dev server
- **Tone.js 15** - Audio synthesis for placeholder sounds
- **Mobile-First CSS** - Responsive design with touch gestures

---

**Built with ✨ magic for instant calm**
