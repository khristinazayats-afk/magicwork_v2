# 🎬 Lottie Animation Integration Guide

## 📥 Recommended Approach: Download JSON Files

**Best Format**: **Lottie JSON** (`.json` files)

### Why JSON over other formats?
- ✅ **Lightweight**: Much smaller than GIF/MP4
- ✅ **Scalable**: Vector-based, looks perfect at any size
- ✅ **Interactive**: Can be controlled programmatically (play, pause, loop, speed)
- ✅ **Performance**: Hardware-accelerated, smooth animations
- ✅ **Version Control**: Easy to track changes in git

### Download Process from Canva:
1. Create your animation in Canva using the Lottie connector
2. Export/Download as **"Lottie JSON"** or **"JSON"** format
3. Save the `.json` file to your project

---

## 📁 Recommended Project Structure

```
src/
├── assets/
│   └── lottie/              # Store all Lottie JSON files here
│       ├── breathing-circle.json
│       ├── wave-flow.json
│       └── quiet-ground.json
├── components/
│   ├── animations/
│   │   ├── LottieAnimation.jsx    # Reusable wrapper component
│   │   └── [YourAnimation].jsx   # Specific animation components
```

---

## 🚀 Setup Instructions

### 1. Install Lottie Library

```bash
npm install lottie-react
```

**Note**: The `lottie-react` package is the most popular and well-maintained React wrapper for Lottie animations.

### 2. Create Assets Folder

```bash
mkdir -p src/assets/lottie
```

### 3. Add Your Lottie JSON Files

Place downloaded `.json` files from Canva into `src/assets/lottie/`

### 4. Create Reusable Wrapper Component

See `src/components/animations/LottieAnimation.jsx` (created below)

### 5. Use in Your Components

```jsx
import LottieAnimation from './animations/LottieAnimation';
import breathingAnimation from '../../assets/lottie/breathing-circle.json';

<LottieAnimation 
  animationData={breathingAnimation}
  isActive={isPlaying}
  loop={true}
  speed={1}
/>
```

---

## 🔄 MCP Server vs Manual Download

### Use Manual Download (Recommended) ✅
- **When**: You have a few animations, want full control, simple workflow
- **Pros**: 
  - No additional setup
  - Works offline
  - Easy to version control
  - No API dependencies
- **Cons**: 
  - Manual download/upload process
  - Need to update files when animations change

### Use MCP Server
- **When**: You need to frequently fetch/update animations programmatically
- **Pros**:
  - Automated fetching
  - Can integrate with AI workflows
  - Dynamic updates
- **Cons**:
  - Requires MCP server setup
  - API dependencies
  - More complex configuration
  - May need authentication

**Recommendation**: Start with manual downloads. Add MCP server later if you need programmatic access.

---

## 📝 Integration with Existing Animation System

Your current animations use `framer-motion` and follow a design system. You can:

1. **Replace specific animations** with Lottie versions
2. **Mix both approaches** - use Lottie for complex animations, framer-motion for simple ones
3. **Maintain consistency** - ensure Lottie animations match your design system colors

---

## 🎨 Design System Compatibility

When creating animations in Canva, try to match:
- **Particle Color**: `rgba(30, 45, 46, 0.6)` (dark teal)
- **Style**: Schematic, playful, organic
- **Size**: Keep animations appropriately sized for your UI

---

## 🔧 Troubleshooting

### Animation not showing?
- Check that JSON file path is correct
- Verify JSON file is valid (open in text editor)
- Check browser console for errors

### Animation too large?
- Optimize in Canva before export
- Use Lottie's optimization tools
- Consider reducing frame rate if not critical

### Performance issues?
- Limit number of simultaneous Lottie animations
- Use `isActive` prop to stop animations when not visible
- Consider using `useMemo` for animation data

