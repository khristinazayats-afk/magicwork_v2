# 🎨 Animation Testing Guide

## Available Test Environments

### 1. **Animation Workspace** (NEW - Full Featured)
**URL:** `http://localhost:5173/?workspace=animations`

**Features:**
- Organized by practice categories (Breathing, Movement, Grounding, Experimental)
- Sidebar navigation
- Speed controls (0.5x - 2x)
- Play/Pause/Reset controls
- Design system info display

**Use this for:** Building and testing new animations with full controls

---

### 2. **Animation Test** (Existing - Simple)
**URL:** `http://localhost:5173/?test=animation`

**Features:**
- Simple button-based animation switcher
- Play/Pause control
- Includes: Box Breathing, Circle Breathing, Wave Flow, Physiological Sigh

**Use this for:** Quick testing of existing animations

---

### 3. **Boomerang Lab** (Experimental)
**URL:** `http://localhost:5173/?test=boomerang`

**Features:**
- Dedicated page for Boomerang animation testing

**Use this for:** Testing the Boomerang animation specifically

---

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open one of the URLs above in your browser**

3. **Test your animations!**

## Troubleshooting

### If `?workspace=animations` doesn't work:

1. **Check if dev server is running:**
   ```bash
   # Check if port 5173 is in use
   lsof -ti:5173
   ```

2. **Restart the dev server:**
   ```bash
   npm run dev
   ```

3. **Check browser console for errors** (F12 → Console)

4. **Try the simple test environment first:**
   - `http://localhost:5173/?test=animation`

### Common Issues:

- **Port already in use:** Kill the process and restart
- **Import errors:** Check that `AnimationControls` exists at `src/components/animation-workspace/AnimationControls.jsx`
- **Component not found:** Verify `AnimationWorkspace.jsx` is in `src/components/`

## Recommended Workflow

1. **Develop:** Create/edit animation in `src/components/animations/`
2. **Test in Workspace:** Use `?workspace=animations` for full testing
3. **Quick Test:** Use `?test=animation` for rapid iteration
4. **Integrate:** Add to practice components when ready

---

**Happy testing!** 🎬














