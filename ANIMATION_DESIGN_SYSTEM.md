# 🎨 Animation Design System

A consistent, playful, schematic animation style for all guided practices.

## 🎯 Core Principles

**Dark Circles · Schematic · Playful**

Our animations follow three key principles:
1. **Dark Color**: Use `rgba(30, 45, 46, 0.6)` for all particles
2. **Schematic**: Simple geometric shapes and paths with subtle guides
3. **Playful**: Organic, dispersed movement with gentle pulsing

## 📐 Design Constants

```javascript
// Particle Style
const PARTICLE_COLOR = 'rgba(30, 45, 46, 0.6)'; // Dark brand color
const PARTICLE_SIZE = 6; // Small, consistent size (px)

// Opacity & Animation
- Base opacity: 0.4 - 0.7 (gentle pulsing)
- Animation duration: 2.5 - 3 seconds
- Easing: "easeInOut" for organic feel
- Staggered delays based on particle offset

// Guides & Outlines
- Stroke color: rgba(30, 45, 46, 0.15-0.2)
- Stroke width: 2px
- Markers: rgba(30, 45, 46, 0.2), 1.5-2px dots
```

## 🎭 Animation Types

### 1. Box Breathing
**Use for**: Structured breathing practices (box breathing, 4-7-8, etc.)

**Style**:
- Square path with rounded corners (240x240px)
- 20+ particles flowing along perimeter
- Perpendicular dispersion (±15px) creates organic scatter
- Corner markers for visual anchoring

**Best for**: Anxiety relief, focus, structured practices

---

### 2. Circle Breathing
**Use for**: Continuous, cyclical practices

**Style**:
- Circular path (radius: 100px)
- 24+ particles orbiting smoothly
- Radial dispersion (±20px) inward/outward
- Center marker as focal point
- Gentle scale pulsing (1.0 - 1.2)

**Best for**: Meditative breathing, relaxation, flow states

---

### 3. Wave Flow
**Use for**: Movement, energy, dynamic practices

**Style**:
- Horizontal sine wave (300x150px)
- 30+ particles flowing in wave pattern
- Vertical dispersion (±20px) for organic spread
- Dashed guide line for path
- Start/end markers

**Best for**: Energy work, movement practices, creative flow

---

## 🛠️ How to Use

### Access Test Environment

Visit: **http://localhost:5174/?test=animations**

This gives you:
- Isolated animation testing
- Switch between animation types
- Play/pause controls
- No other UI interference

### Create New Animation

1. Create file in `src/components/animations/YourAnimation.jsx`
2. Follow the template:

```javascript
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

// Use design constants
const PARTICLE_COLOR = 'rgba(30, 45, 46, 0.6)';
const PARTICLE_SIZE = 6;
const PARTICLE_COUNT = 20; // Adjust as needed

export default function YourAnimation({ isActive }) {
  const [cycleProgress, setCycleProgress] = useState(0);

  // Animation loop
  useEffect(() => {
    if (!isActive) return;
    
    const startTime = Date.now();
    const cycleDuration = 10000; // Your duration
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setCycleProgress((elapsed % cycleDuration) / cycleDuration);
    }, 16);

    return () => clearInterval(interval);
  }, [isActive]);

  // Generate particles
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      offset: i / PARTICLE_COUNT,
      dispersion: (Math.random() - 0.5) * 20 // Adjust as needed
    }));
  }, []);

  // Your position calculation function
  const getPosition = (progress, dispersion) => {
    // Return { x, y } based on your pattern
  };

  return (
    <div className="relative" style={{ /* your size */ }}>
      {/* Guide/outline SVG */}
      {/* Particles with consistent styling */}
      {/* Markers/anchors */}
    </div>
  );
}
```

3. Add to `AnimationTest.jsx` animations array
4. Test in isolation
5. Integrate into practice components

### Integration Example

```javascript
import BoxBreathing from './animations/BoxBreathing';

// In your practice component:
{breathingMode === 'guided' && (
  <BoxBreathing isActive={isPlaying} />
)}
```

## ✨ Animation Guidelines

### DO:
- ✅ Use exact `PARTICLE_COLOR` and `PARTICLE_SIZE`
- ✅ Add subtle dispersion/scatter for organic feel
- ✅ Use gentle opacity pulsing (0.4 - 0.7)
- ✅ Stagger particle animations with offsets
- ✅ Include subtle guides/outlines (light, dashed)
- ✅ Add anchor points/markers (corners, centers)
- ✅ Keep animations smooth (16ms intervals)

### DON'T:
- ❌ Use bright colors or gradients
- ❌ Make particles too large (>8px)
- ❌ Use harsh, distracting movements
- ❌ Overlap UI elements
- ❌ Create overly complex paths
- ❌ Use scale animations > 1.3x
- ❌ Mix different particle styles

## 🎨 Color Reference

```css
/* Primary particle color */
rgba(30, 45, 46, 0.6) - Dark teal, 60% opacity

/* Guide/outline color */
rgba(30, 45, 46, 0.15) - Light guides
rgba(30, 45, 46, 0.2) - Visible outlines

/* Marker color */
rgba(30, 45, 46, 0.2) - Anchor points
```

## 📦 File Structure

```
src/
├── components/
│   ├── animations/
│   │   ├── BoxBreathing.jsx
│   │   ├── CircleBreathing.jsx
│   │   ├── WaveFlow.jsx
│   │   └── [YourAnimation].jsx
│   └── AnimationTest.jsx
```

## 🚀 Testing Workflow

1. Navigate to `?test=animations`
2. Switch between animation types
3. Verify:
   - Consistent particle size/color
   - Smooth, organic movement
   - Appropriate dispersion
   - No visual glitches
   - Performance on different devices
4. Integrate when satisfied

---

**Consistency is key!** All practices should feel like part of the same family while expressing different energy patterns.

