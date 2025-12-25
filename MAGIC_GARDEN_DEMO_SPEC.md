# Magic Garden States Demo — UX/UI Specification

## Overview
An internal demo screen that visually showcases the 5 garden states representing how nurtured the user's nervous system feels. This is a preview tool for the founder, not a production user screen.

---

## Screen Layout Structure

### Overall Container
- **Orientation**: Vertical mobile-first layout
- **Background**: Magiwork beige (`#fcf8f2`) with soft gradient overlay
- **Spacing**: Generous padding, breathing room between sections
- **Max Width**: Mobile full-width, tablet/desktop max 700px centered

---

## Zone 1: Top Header / Intro

### Title Section
- **Title**: "Your magical garden states"
  - Font: Actay Wide Bold
  - Size: 28px mobile, 36px desktop
  - Color: Dark green (`#1e2d2e`)
  - Position: Top-left aligned with container padding
  - Spacing: 24px from top (safe area inset on mobile)

- **Subtitle**: "Each state shows how nurtured your inner garden feels."
  - Font: Hanken Grotesk Regular
  - Size: 14px mobile, 16px desktop
  - Color: Dark green at 70% opacity (`#1e2d2eB3`)
  - Position: 8px below title
  - Line height: 1.5

- **Layout**: Vertical stack, left-aligned
- **Padding**: 20px horizontal, 24px vertical
- **Background**: Transparent (no card background for intro zone)

---

## Zone 2: State Selector + Garden Preview

### 2A: State Selector (Pill Buttons)

**Layout**:
- Horizontal scrollable row (on mobile) or wrapped flex grid (tablet+)
- Container padding: 20px horizontal
- Gap between pills: 8px
- Positioned directly below intro section, 16px spacing

**Button Style**:
- **Shape**: Pill/rounded-full (border-radius: 999px)
- **Height**: 40px
- **Padding**: 16px horizontal
- **Font**: Hanken Grotesk Medium
- **Font Size**: 13px mobile, 14px desktop

**States**:
- **Inactive**:
  - Background: White at 70% opacity (`rgba(255,255,255,0.7)`)
  - Border: 1px solid dark green at 20% opacity (`#1e2d2e33`)
  - Text color: Dark green (`#1e2d2e`)
  - Subtle backdrop blur (5px)

- **Active/Selected**:
  - Background: Dark green (`#1e2d2e`)
  - Border: None
  - Text color: White
  - Slight scale: 1.02 (barely noticeable)
  - Smooth transition: 0.2s ease

**Button Labels** (in order):
1. Quiet Ground
2. Gentle Sprouting
3. Rooting In
4. Blossoming Light
5. Flourishing Garden

---

### 2B: Garden Preview Area

**Container**:
- **Shape**: Rounded card (border-radius: 24px)
- **Background**: White at 60% opacity with backdrop blur (`rgba(255,255,255,0.6)` + 10px blur)
- **Padding**: 24px mobile, 32px desktop
- **Margin**: 20px horizontal, 24px below selector
- **Aspect Ratio**: Square (1:1) - max height 400px
- **Shadow**: Soft shadow (0 8px 32px rgba(30, 45, 46, 0.08))

**Visual Area**:
- Full width of container minus padding
- Positioned in center of card
- Background: Subtle gradient from beige to white
- Contains the garden illustration for selected state

---

## Zone 3: State Meaning & Emotional Context

### Container
- Same card styling as garden preview (white with backdrop blur)
- Positioned directly below preview area
- Margin: 20px horizontal, 24px spacing from preview

### Content Structure

**Section 1: State Name & Emotional Line**
- **State Name**:
  - Font: Actay Wide Bold
  - Size: 22px mobile, 28px desktop
  - Color: Dark green (`#1e2d2e`)
  - Spacing: 8px bottom margin

- **Emotional Line**:
  - Font: Hanken Grotesk Medium
  - Size: 16px mobile, 18px desktop
  - Color: Dark green at 85% opacity (`#1e2d2eD9`)
  - Line height: 1.6
  - Spacing: 16px bottom margin

**Section 2: Explanation (Separated by divider)**
- **Divider**: 1px horizontal line, dark green at 10% opacity (`#1e2d2e1A`)
- **Spacing**: 20px above divider, 16px below

- **Explanation Text**:
  - Font: Hanken Grotesk Regular
  - Size: 14px mobile, 15px desktop
  - Color: Dark green at 70% opacity (`#1e2d2eB3`)
  - Line height: 1.7
  - Max width: Chunked for readability

---

## Visual Compositions for Each Garden State

### State 1: QUIET GROUND

**Overall Mood**: Minimal, muted, quiet, grounded. Not empty—just resting.

**Color Palette**:
- Primary: Muted beiges and soft browns (`#e8e0d6`, `#d4ccc0`, `#c4b5a0`)
- Accent: Very subtle green hint (`#94d1c4` at 20-30% opacity)
- Base: Soft beige gradient

**Visual Elements & Composition**:

1. **Ground/Soil Layer** (bottom third):
   - Soft horizontal gradient from beige to slightly darker beige
   - Subtle texture overlay (very low opacity noise pattern)
   - Two or three soft moss patches (rounded green-gray shapes, very subtle)

2. **Seeds** (scattered):
   - 3-5 tiny dots (2-3px diameter)
   - Positioned at varying heights in lower half
   - Color: Soft brown (`#a89b8f`) with very faint glow (10% opacity white ring)

3. **Single Tiny Sprout** (center-left):
   - Thin vertical line (0.5px width, 8px height)
   - Color: Muted green (`#94d1c4` at 40% opacity)
   - Small leaf at top (2x2px rounded diamond shape)

4. **Mycelium Hints** (under soil):
   - 2-3 subtle white curved lines
   - Very thin (0.5px), 30% opacity
   - Connecting various points like a web

5. **Funky Worms** (2 of them):
   - Simple curved line forms (not realistic)
   - Organic S-curves
   - Color: Soft brown (`#b8a99b`) at 50% opacity
   - Position: One near bottom-left, one mid-right
   - Width: 1px stroke
   - Length: 15-20px

6. **Single Root Thread** (from sprout):
   - Thin line extending down into soil
   - Slightly branching at bottom (Y-shape)
   - Color: Muted dark (`#8a7f73`) at 60% opacity

**Layout Notes**:
- Elements are sparse but intentional
- Most activity in lower 60% of frame
- Upper 40% is mostly empty space with very subtle atmospheric gradient
- Overall composition: Grounded, horizontal emphasis

---

### State 2: GENTLE SPROUTING

**Overall Mood**: Hopeful, early growth, clearly more alive than Quiet Ground but still simple.

**Color Palette**:
- Primary: Soft greens emerging (`#c4d9c9`, `#94d1c4`, `#a8d4c4`)
- Accent: Gentle beiges still present
- Light accent: Very soft yellow-orange hint (`#ffd4a3` at 15% opacity)

**Visual Elements & Composition**:

1. **Ground/Soil Layer**:
   - Similar to Quiet Ground but slightly more defined
   - More visible texture variation
   - Slightly brighter overall

2. **Multiple Sprouts** (3-4 of them):
   - Taller than Quiet Ground (10-16px height)
   - Thicker stems (0.75px width)
   - Each with 1-2 tiny leaves (3x4px rounded leaf shapes)
   - Color: Soft mint green (`#94d1c4` at 60-70% opacity)
   - Positioned: Scattered across lower half

3. **Root System** (more visible):
   - Each sprout has visible roots
   - Thicker main root (1px) with small branches
   - Color: Darker green-brown (`#7ab8a8`) at 50% opacity
   - Roots connect subtly to each other

4. **Sunlight Ray** (top-center):
   - Soft diagonal beam from top-right corner
   - Very subtle gradient (white to transparent)
   - 10% opacity overall
   - Width: 40px at top, narrowing to 20px
   - Slight warm tint (`#ffd4a3` at 5% opacity)

5. **Dewdrops**:
   - 4-5 small circular highlights
   - Positioned on leaves or soil
   - White at 40% opacity
   - Size: 2-3px diameter
   - Subtle inner highlight (white dot)

6. **Tiny Mushrooms** (2 of them):
   - Minimal mushroom shapes (cap + stem)
   - Size: 4-6px tall
   - Color: Soft beige-gray (`#c4b5a0`) at 50% opacity
   - Position: Near base of sprouts

7. **Mycelium** (denser):
   - More visible white web lines
   - 40% opacity
   - Connecting more points across the soil

**Layout Notes**:
- More vertical movement (sprouts reaching up)
- Sunlight creates light hierarchy (top-right is slightly brighter)
- Slightly more populated than Quiet Ground
- Still calm and minimal

---

### State 3: ROOTING IN

**Overall Mood**: Stable, strong, supportive, "here to stay."

**Color Palette**:
- Primary: Deeper greens (`#94d1c4`, `#7ab8a8`, `#6ba89a`)
- Accent: Warm beiges still present
- Highlights: Soft purples/teals as accents (`#c4a8d9`, `#a8d4d9`)

**Visual Elements & Composition**:

1. **Stronger Stems**:
   - 3-4 main plants with thicker, upright stems (1-1.5px width)
   - Heights: 20-30px
   - Multiple leaves per plant (2-3 leaves each)
   - Color: Stronger green (`#94d1c4` at 70-80% opacity)

2. **Branching Root System**:
   - Very visible root network
   - Main roots: 1.5px width, darker color (`#6ba89a`)
   - Side branches: 1px width
   - Roots cross and connect across the soil
   - Some roots visible above ground slightly (gentle curves)

3. **Pollinators**:
   - **Tiny Bees**: 2-3 simple bee shapes
     - Small oval body (3x2px) with subtle stripes
     - Two tiny wings (1x1px each)
     - Position: Floating near flowers/leaves
     - Color: Soft yellow-brown (`#d4c4a8`) at 60% opacity
   
   - **Simple Butterflies**: 1-2 minimal butterfly forms
     - Two triangular wings (4x4px each)
     - Small body (2px line)
     - Position: Mid-level, near flowers
     - Color: Soft purple or teal (`#c4a8d9` or `#a8d4d9`) at 50% opacity

4. **Light Orbs / Fairies** (1-2):
   - Small glowing circles (4-6px diameter)
   - Soft glow effect (outer ring at 20% opacity)
   - Color: Warm white with slight tint (`#fff` with `#ffd4a3` at 10% tint)
   - Position: Floating at different heights
   - Very subtle animation suggestion (not animated in demo, just positioned suggestively)

5. **Moss Along Roots**:
   - Soft green patches (rounded organic shapes)
   - Following the root lines
   - Color: Darker green (`#7ab8a8`) at 40% opacity
   - Size: 3-5px patches

6. **Early Flowers**:
   - 1-2 small flower buds beginning to open
   - Simple 4-petal shapes (6-8px diameter)
   - Color: Soft accent colors (purple or teal hints)
   - Position: At top of strongest stems

**Layout Notes**:
- Strong vertical and horizontal structure (stems up, roots down/out)
- More balanced composition
- Ground feels more alive but still controlled
- Connection theme (roots connecting, pollinators moving)

---

### State 4: BLOSSOMING LIGHT

**Overall Mood**: Radiant, magical, emotionally open, but still not overloaded.

**Color Palette**:
- Primary: Lush greens (`#94d1c4`, `#7ab8a8`)
- Accent: Warm sunrise tones (`#ffd4a3`, `#ffaf42` at 30% opacity)
- Highlights: Soft purples, teals, pinks (`#c4a8d9`, `#d4a8c4`, `#a8d4d9`)

**Visual Elements & Composition**:

1. **Lotus Flowers** (2-3 of them):
   - Opening lotus shapes (simplified)
   - Larger size: 12-16px diameter
   - Multiple layers of petals (simplified to 2 layers)
   - Outer petals: Soft pink or white with warm tint
   - Inner center: Yellow-soft orange (`#ffd4a3` at 50% opacity)
   - Position: Top of water or on stems
   - Slight glow around edges (10% opacity)

2. **Glowing Mushrooms**:
   - 3-4 mushroom forms
   - Inner glow effect (soft white or warm light at 30% opacity)
   - Size: 6-10px tall
   - Cap: Slightly luminous (white at 20% opacity overlay)
   - Position: Scattered around base

3. **Soft Sunlight / Warm Beams**:
   - Multiple soft light rays from top
   - Diagonal beams (15-25 degrees)
   - Very soft gradients (white to transparent, warm tint)
   - 15% opacity overall
   - Creates warm, golden-hour feeling

4. **More Light Orbs / Fairies** (3-4 of them):
   - Larger than Rooting In (6-8px diameter)
   - More vibrant glow (30% opacity outer ring)
   - Some with slight color tints (soft yellow, pink, teal)
   - Positioned at varying heights
   - Suggested floating movement pattern

5. **Bird Silhouettes / Tiny Birds**:
   - 2-3 minimal bird shapes
   - Very simple forms (small oval body + triangle wing)
   - Size: 4-6px
   - Color: Soft dark green or brown (`#6ba89a` or `#a89b8f`) at 60% opacity
   - Position: Perched on stems or flying mid-level

6. **Taller Grasses / Plants**:
   - 2-3 taller plant forms (30-40px height)
   - Gently leaning/curving (organic S-curves)
   - Multiple leaves at different heights
   - Color: Rich green (`#7ab8a8` at 70% opacity)
   - Creates vertical rhythm and depth

7. **More Visible Flowers**:
   - 3-4 various flower types
   - Simple shapes but more developed than Rooting In
   - Colors: Accent colors (purple, pink, teal hints)
   - Sizes: 8-12px diameter

**Layout Notes**:
- More dynamic composition with vertical elements (tall grasses)
- Light creates focal points (lotus flowers, glowing mushrooms)
- Overall feeling of opening up and expanding
- More magical elements but still balanced

---

### State 5: FLOURISHING GARDEN

**Overall Mood**: Peaceful, full, harmonious, slightly surreal, deeply calm.

**Color Palette**:
- Primary: Full spectrum of greens (`#94d1c4`, `#7ab8a8`, `#6ba89a`, `#c4d9c9`)
- Accent: Sunrise warm tones (`#ffd4a3`, `#ffaf42` at 25% opacity)
- Highlights: Soft purples, teals, pinks, gentle blues
- Glow: Soft white and warm glows throughout

**Visual Elements & Composition**:

1. **All Previous Elements** (enhanced):
   - Everything from previous stages present
   - But balanced and harmonious
   - More refined/details

2. **Lotus Ponds / Water Element**:
   - Soft horizontal water area (bottom 25% of frame)
   - Subtle ripple pattern (gentle curved lines, 20% opacity)
   - Color: Soft teal-blue (`#a8d4d9` at 30% opacity)
   - Lotus flowers growing from water
   - Water reflections (mirrored elements, 40% opacity)

3. **More Glowing Mushrooms**:
   - 5-6 mushroom forms of varying sizes
   - Stronger inner glow (40% opacity)
   - Some with subtle color tints (soft blue, purple glows)
   - Creates magical forest floor feeling

4. **Firefly-like Lights**:
   - 4-5 small glowing points
   - Very subtle pulsing glow effect (suggested by size variation)
   - Color: Warm white with soft yellow tint
   - Scattered throughout the composition
   - Size: 2-3px with 6px glow ring

5. **Small Birds** (3-4 of them):
   - More birds than previous states
   - Various simple forms
   - Some perched, some in flight
   - Creates sense of activity and life

6. **Soft Floating Petals**:
   - 4-6 petal shapes floating in air
   - Positioned in middle to upper third
   - Sizes: 3-5px each
   - Colors: Soft pink, white, pale purple (`#d4a8c4`, `#fff`, `#c4a8d9`)
   - Opacity: 40-50%
   - Suggested gentle falling/floating movement

7. **Tree or Large Plant** (center or side):
   - **Option 1**: Lightweave Tree (central focal point)
     - Strong central trunk (2px width, 50px height)
     - Large canopy made of concentric circular light patterns
     - Soft glowing rings (3-4 layers)
     - Outer ring: 40px diameter
     - Inner rings: Decreasing sizes
     - Color: Soft green with warm glow (`#94d1c4` with `#ffd4a3` tint)
     - Light veins visible in trunk (soft white lines, 30% opacity)
   
   - **Option 2**: Large Plant Form
     - Tall central plant (40-50px height)
     - Multiple branches/stems reaching up
     - Large leaves at top
     - Light running through it (subtle inner glow)

8. **Slightly Levitating Leaves**:
   - 2-3 leaf shapes floating above ground
   - Small glow underneath (soft shadow-glow effect)
   - Position: Mid-level, not touching ground
   - Creates surreal, magical feeling

9. **Soft Glow Paths**:
   - Gentle light trails connecting elements
   - Very subtle (10% opacity)
   - Organic curves
   - Color: Warm white with slight color tints
   - Creates sense of energy flow

10. **Balanced Ecosystem**:
    - All elements work together harmoniously
    - No single element dominates
    - Sense of abundance without clutter
    - Deep, layered composition with foreground, mid-ground, background

**Layout Notes**:
- Rich but balanced composition
- Clear foreground, mid-ground, background layers
- Central focal point (tree or large plant)
- Surreal elements (floating petals, levitating leaves) create magical feeling
- Water element adds depth and calm
- Overall: Full, harmonious, deeply peaceful

---

## Visual Style Guidelines

### Shapes & Forms
- **Organic curves**: No hard edges, everything flows
- **Simplified representation**: Not hyper-realistic, more symbolic
- **Minimal line work**: Thin strokes (0.5px-2px), clean lines
- **Soft edges**: Blur effects where needed for glow/atmosphere

### Color Application
- **Opacity layering**: Use opacity to create depth and atmosphere
- **Gradient usage**: Soft gradients for backgrounds, light effects
- **Color harmony**: Stay within brand palette, avoid saturation over 70%
- **Atmospheric color**: Use color temperature shifts (cooler in shadows, warmer in light)

### Typography (for state meanings)
- **Hierarchy**: Clear size contrast between state name and explanation
- **Readability**: Adequate line height, comfortable spacing
- **Tone**: Warm but professional, not overly casual

### Interaction States
- **State selector hover**: Slight scale increase (1.02x), subtle shadow
- **State selector active**: Clear contrast, immediate feedback
- **Garden preview**: Smooth transition when state changes (fade/crossfade, 0.3s ease)

### Accessibility Considerations
- **Color contrast**: Text meets WCAG AA standards
- **Touch targets**: Pills are at least 44px tall for mobile
- **Readability**: Font sizes readable at all breakpoints

---

## Technical Specifications for Implementation

### Breakpoints
- **Mobile**: 320px - 767px (default)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Spacing Scale
- **XS**: 4px
- **S**: 8px
- **M**: 16px
- **L**: 24px
- **XL**: 32px
- **XXL**: 48px

### Animation (Future - Not for Static Demo)
- **State transitions**: 300ms ease-in-out fade/crossfade
- **Element entrance**: Subtle fade-in when state changes
- **Note**: Demo is static, but transitions can be added later

### Asset Creation Notes
- **Format**: SVG for scalability (vector graphics)
- **Fallback**: PNG at 2x resolution if needed
- **Export**: Individual elements can be separate SVG layers for animation potential

---

## Content Copy (Finalized)

### Quiet Ground
- **Emotional Line**: "Your garden is resting, waiting for gentle care."
- **Explanation**: "Very few practices so far. Even one moment of calm begins to soften the soil and your nervous system."

### Gentle Sprouting
- **Emotional Line**: "Your garden is starting to respond to your presence."
- **Explanation**: "A few mindful moments this week help your breath settle and your system remember how to soften."

### Rooting In
- **Emotional Line**: "Your calm is taking deeper roots."
- **Explanation**: "Consistent small practices make it easier to recover from daily stress. Your baseline is beginning to shift."

### Blossoming Light
- **Emotional Line**: "Your inner world is opening and brightening."
- **Explanation**: "Regular practice brings more clarity and ease. Calm arrives faster and stays longer."

### Flourishing Garden
- **Emotional Line**: "Your garden feels deeply cared for."
- **Explanation**: "Frequent moments of presence now support a more resilient, regulated nervous system."

---

## Success Criteria

This demo screen successfully communicates:
1. ✅ Clear visual progression from minimal → rich across 5 states
2. ✅ Each state feels distinct and emotionally resonant
3. ✅ Visuals align with Magiwork brand (calm, minimal, organic)
4. ✅ Elements feel magical but adult (no childish imagery)
5. ✅ Founder can easily compare states side-by-side mentally
6. ✅ Visuals can be adapted for reuse in production screens
7. ✅ Composition feels balanced and intentional at each stage

---

## Next Steps for Implementation

1. Create high-fidelity mockups for each garden state illustration
2. Design SVG assets for individual elements (seeds, sprouts, flowers, etc.)
3. Build React component with state selector and preview area
4. Implement smooth transitions between states
5. Test on mobile devices for touch interactions
6. Refine based on founder feedback
7. Extract reusable visual elements for production screens (homepage, results, history)

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Status**: Ready for visual design phase

