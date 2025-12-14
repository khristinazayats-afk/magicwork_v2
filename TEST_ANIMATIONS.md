# 🎬 How to Test Animations

## ✅ Working Test URLs

### Option 1: Simple Animation Test (RECOMMENDED)
```
http://localhost:5173/?test=animation
```

**What you get:**
- 4 animations: Box Breathing, Circle Breathing, Wave Flow, Physiological Sigh
- Simple button switcher
- Play/Pause control
- Clean, minimal interface

**This is the fastest way to test animations!**

---

### Option 2: Animation Workspace (Full Featured)
```
http://localhost:5173/?workspace=animations
```

**What you get:**
- All animations organized by practice type
- Sidebar navigation
- Speed controls (0.5x - 2x)
- Reset button
- Practice categories: Breathing, Movement, Grounding, Experimental

**Use this for building and comparing animations**

---

### Option 3: Boomerang Lab
```
http://localhost:5173/?test=boomerang
```

**What you get:**
- Dedicated Boomerang animation testing

---

## 🚀 Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Wait for the server to start** (you'll see a URL like `http://localhost:5173`)

3. **Open one of the URLs above in your browser**

4. **Test your animations!**

---

## 📝 Notes

- The **Simple Animation Test** (`?test=animation`) is the most reliable and fastest option
- The **Animation Workspace** (`?workspace=animations`) has more features but requires the server to be running properly
- All animations are located in `src/components/animations/`
- You can edit animations and see changes instantly with hot reload

---

## 🐛 Troubleshooting

**If animations don't load:**
1. Make sure `npm run dev` is running
2. Check browser console for errors (F12)
3. Try refreshing the page
4. Start with `?test=animation` first (most reliable)

**If server won't start:**
```bash
# Kill any process on port 5173
lsof -ti:5173 | xargs kill -9

# Restart dev server
npm run dev
```

---

**Start with `?test=animation` - it's the most reliable!** ✨














