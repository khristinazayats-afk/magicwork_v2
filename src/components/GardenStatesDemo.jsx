import { useState } from 'react';

// Garden state configurations
const GARDEN_STATES = [
  {
    id: 'quiet-ground',
    name: 'Quiet Ground',
    meaning: 'Your inner garden is resting, ready to receive attention.',
    description: 'This is the starting place—a calm, receptive state where your nervous system can begin to settle. The garden is quiet, but present, waiting for the first gentle touch of mindful attention.',
    visual: {
      colors: ['#e8e0d6', '#d4ccc0', '#94d1c4'],
      description: 'Muted greens and beiges, soft soil texture, maybe a single tiny sprout, very subtle magic'
    },
    creatures: [
      {
        name: 'Whisper Wisp',
        meaning: 'a moment of quiet',
        icon: '🌫️'
      }
    ],
    plants: [
      {
        name: 'Resting Seed',
        meaning: 'potential waiting',
        icon: '🌱'
      }
    ],
    nervousSystemMeaning: [
      'Your body is in a baseline state of calm',
      'Small moments of pause are noticed and appreciated',
      'The foundation for deeper grounding is present'
    ]
  },
  {
    id: 'gentle-sprouting',
    name: 'Gentle Sprouting',
    meaning: 'Your inner garden is beginning to awaken.',
    description: 'As you practice mindful moments, tiny sprouts emerge. Your nervous system starts to recognize these pauses, creating small pathways toward greater calm and presence.',
    visual: {
      colors: ['#c4d9c9', '#94d1c4', '#e8e0d6'],
      description: 'Multiple small sprouts, a little more color, hints of early magical plants, maybe one soft creature'
    },
    creatures: [
      {
        name: 'Breathweaver',
        meaning: 'calmer breath',
        icon: '💨'
      }
    ],
    plants: [
      {
        name: 'Tendril Sprout',
        meaning: 'early growth',
        icon: '🌿'
      },
      {
        name: 'Mindbloom Bud',
        meaning: 'clarity emerging',
        icon: '🌼'
      }
    ],
    nervousSystemMeaning: [
      'Your breath begins to slow naturally',
      'Momentary pauses create gentle shifts in awareness',
      'Small pathways toward regulation are forming'
    ]
  },
  {
    id: 'rooting-in',
    name: 'Rooting In',
    meaning: 'Your inner garden is establishing deeper stability.',
    description: 'With consistent practice, roots grow deeper. Your nervous system finds more stable ground, creating a sense of safety and reliability in your daily experience.',
    visual: {
      colors: ['#94d1c4', '#7ab8a8', '#c4d9c9', '#e8e0d6'],
      description: 'Deeper plant structures, visible roots, more grounded foliage, 1–2 magical creatures present (calm, not flashy)'
    },
    creatures: [
      {
        name: 'Root Guardian',
        meaning: 'deeper stability',
        icon: '🛡️'
      },
      {
        name: 'Grounded Wisp',
        meaning: 'presence anchoring',
        icon: '✨'
      }
    ],
    plants: [
      {
        name: 'Anchoring Root',
        meaning: 'foundational stability',
        icon: '🌳'
      },
      {
        name: 'Calm Fern',
        meaning: 'grounded growth',
        icon: '🍃'
      }
    ],
    nervousSystemMeaning: [
      'Your body feels more reliably settled',
      'Stress responses soften with greater ease',
      'You can return to calm more consistently'
    ]
  },
  {
    id: 'blossoming-light',
    name: 'Blossoming Light',
    meaning: 'Your inner garden is opening and becoming more responsive.',
    description: 'Flowers begin to open, and light fills the garden. Your nervous system responds more quickly to mindful moments, creating a sense of aliveness and clarity that infuses your days.',
    visual: {
      colors: ['#94d1c4', '#ffd4a3', '#ffaf42', '#c4d9c9'],
      description: 'Opening flowers, warm sunrise tones (subtle), more magical plants, multiple fairies/floating spirits'
    },
    creatures: [
      {
        name: 'Lightweaver',
        meaning: 'clarity opening',
        icon: '✨'
      },
      {
        name: 'Blossom Spirit',
        meaning: 'joyful presence',
        icon: '🌸'
      },
      {
        name: 'Dawn Wisp',
        meaning: 'fresh awareness',
        icon: '🌅'
      }
    ],
    plants: [
      {
        name: 'Mindbloom Flower',
        meaning: 'clarity opening',
        icon: '🌺'
      },
      {
        name: 'Resonance Petal',
        meaning: 'harmonious awareness',
        icon: '🌷'
      }
    ],
    nervousSystemMeaning: [
      'You experience moments of clarity more often',
      'Your system responds to mindfulness with greater ease',
      'A sense of lightness and aliveness grows'
    ]
  },
  {
    id: 'flourishing-garden',
    name: 'Flourishing Garden',
    meaning: 'Your inner world is thriving with consistent care.',
    description: 'The garden is lush and alive, with the Lightweave Tree at its center. Your nervous system has developed strong pathways toward calm, creating a flourishing inner ecosystem that supports you daily.',
    visual: {
      colors: ['#94d1c4', '#7ab8a8', '#c4d9c9', '#ffd4a3', '#ffaf42'],
      description: 'Lush but minimal, glowing accents, Lightweave-style tree, 2–4 magical creatures, calm gentle movement suggestions'
    },
    creatures: [
      {
        name: 'Lightweave Keeper',
        meaning: 'sustained flourishing',
        icon: '🌲'
      },
      {
        name: 'Harmony Fairy',
        meaning: 'integrated calm',
        icon: '🧚'
      },
      {
        name: 'Flow Spirit',
        meaning: 'natural regulation',
        icon: '🌊'
      },
      {
        name: 'Blossom Guardian',
        meaning: 'ongoing clarity',
        icon: '🌸'
      }
    ],
    plants: [
      {
        name: 'Lightweave Tree',
        meaning: 'a flourishing inner world',
        icon: '🌳'
      },
      {
        name: 'Abundance Bloom',
        meaning: 'sustained presence',
        icon: '🌺'
      }
    ],
    nervousSystemMeaning: [
      'Your nervous system has developed reliable pathways to calm',
      'You experience greater emotional regulation with less effort',
      'A sense of flourishing and wholeness is present in your daily life'
    ]
  }
];

// SVG Component Helpers
function Seed({ x, y, size = 3 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={size} fill="#a89b8f" opacity="0.8" />
      <circle cx={x} cy={y} r={size * 0.5} fill="#fff" opacity="0.3" />
      <circle cx={x} cy={y} r={size * 0.3} fill="#d4ccc0" opacity="0.5" />
    </g>
  );
}

function Sprout({ x, y, height = 8, hasLeaf = false }) {
  return (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - height} stroke="#94d1c4" strokeWidth="0.5" opacity="0.6" />
      {hasLeaf && (
        <>
          <ellipse cx={x - 1.5} cy={y - height + 1} rx="1.5" ry="2" fill="#94d1c4" opacity="0.5" transform={`rotate(-20 ${x} ${y - height + 1})`} />
          <ellipse cx={x + 1.5} cy={y - height + 1} rx="1.5" ry="2" fill="#94d1c4" opacity="0.5" transform={`rotate(20 ${x} ${y - height + 1})`} />
        </>
      )}
    </g>
  );
}

function Worm({ x, y, length = 15 }) {
  return (
    <path
      d={`M ${x} ${y} Q ${x + length * 0.3} ${y - 2} ${x + length * 0.5} ${y} T ${x + length} ${y}`}
      fill="none"
      stroke="#b8a99b"
      strokeWidth="1"
      opacity="0.6"
      strokeLinecap="round"
    />
  );
}

function Mycelium({ x, y, branches = 3 }) {
  return (
    <g opacity="0.3">
      {[...Array(branches)].map((_, i) => {
        const angle = (i * 360 / branches) * Math.PI / 180;
        const length = 8 + Math.random() * 4;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x + Math.cos(angle) * length}
            y2={y + Math.sin(angle) * length}
            stroke="#fff"
            strokeWidth="0.5"
          />
        );
      })}
    </g>
  );
}

function Mushroom({ x, y, size = 4 }) {
  return (
    <g>
      <ellipse cx={x} cy={y - size * 0.3} rx={size} ry={size * 0.6} fill="#c4b5a0" opacity="0.6" />
      <line x1={x} y1={y} x2={x} y2={y + size * 0.8} stroke="#a89b8f" strokeWidth="0.5" opacity="0.5" />
      <circle cx={x} cy={y - size * 0.5} r={size * 0.3} fill="#fff" opacity="0.2" />
    </g>
  );
}

function GlowingMushroom({ x, y, size = 6 }) {
  return (
    <g>
      <ellipse cx={x} cy={y - size * 0.3} rx={size} ry={size * 0.6} fill="#c4b5a0" opacity="0.7" />
      <line x1={x} y1={y} x2={x} y2={y + size * 0.8} stroke="#a89b8f" strokeWidth="0.8" opacity="0.6" />
      <circle cx={x} cy={y - size * 0.5} r={size * 0.4} fill="#fff" opacity="0.4" />
      <circle cx={x} cy={y - size * 0.5} r={size * 0.2} fill="#ffd4a3" opacity="0.3" />
    </g>
  );
}

function Bee({ x, y }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="2" ry="1.5" fill="#d4c4a8" opacity="0.7" />
      <line x1={x - 2} y1={y} x2={x + 2} y2={y} stroke="#a89b8f" strokeWidth="0.3" opacity="0.5" />
      <path d={`M ${x - 1} ${y - 0.5} L ${x - 0.5} ${y - 1} L ${x} ${y - 0.5} Z`} fill="#fff" opacity="0.6" />
      <path d={`M ${x} ${y - 0.5} L ${x + 0.5} ${y - 1} L ${x + 1} ${y - 0.5} Z`} fill="#fff" opacity="0.6" />
    </g>
  );
}

function Butterfly({ x, y, color = "#c4a8d9" }) {
  return (
    <g>
      <path d={`M ${x} ${y} L ${x - 3} ${y - 2} L ${x - 4} ${y} Z`} fill={color} opacity="0.6" />
      <path d={`M ${x} ${y} L ${x + 3} ${y - 2} L ${x + 4} ${y} Z`} fill={color} opacity="0.6" />
      <line x1={x} y1={y} x2={x} y2={y + 1.5} stroke={color} strokeWidth="0.5" opacity="0.5" />
    </g>
  );
}

function LightOrb({ x, y, size = 5 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={size} fill="#fff" opacity="0.2" />
      <circle cx={x} cy={y} r={size * 0.6} fill="#ffd4a3" opacity="0.3" />
      <circle cx={x} cy={y} r={size * 0.3} fill="#fff" opacity="0.5" />
    </g>
  );
}

function LotusFlower({ x, y, size = 8 }) {
  return (
    <g>
      {/* Outer petals */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) * Math.PI / 180;
        const px = x + Math.cos(angle) * size * 0.8;
        const py = y + Math.sin(angle) * size * 0.6;
        return (
          <ellipse
            key={i}
            cx={px}
            cy={py}
            rx={size * 0.4}
            ry={size * 0.6}
            fill="#ffd4a3"
            opacity="0.5"
            transform={`rotate(${i * 45} ${x} ${y})`}
          />
        );
      })}
      {/* Inner center */}
      <circle cx={x} cy={y} r={size * 0.4} fill="#ffaf42" opacity="0.5" />
    </g>
  );
}

function Bird({ x, y }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="2" ry="1" fill="#6ba89a" opacity="0.7" />
      <path d={`M ${x + 1.5} ${y} L ${x + 3} ${y - 1} L ${x + 2.5} ${y} Z`} fill="#6ba89a" opacity="0.7" />
    </g>
  );
}

function Firefly({ x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="1.5" fill="#ffd4a3" opacity="0.6" />
      <circle cx={x} cy={y} r="0.8" fill="#fff" opacity="0.8" />
      <circle cx={x} cy={y} r="3" fill="#ffd4a3" opacity="0.1" />
    </g>
  );
}

function Petal({ x, y, rotation = 0 }) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx="3"
      ry="5"
      fill="#d4a8c4"
      opacity="0.5"
      transform={`rotate(${rotation} ${x} ${y})`}
    />
  );
}

function LightweaveTree({ x, y, trunkHeight = 50 }) {
  return (
    <g>
      {/* Trunk */}
      <line x1={x} y1={y} x2={x} y2={y - trunkHeight} stroke="#1e2d2e" strokeWidth="2" opacity="0.5" />
      {/* Light veins in trunk */}
      <line x1={x - 0.5} y1={y - trunkHeight * 0.3} x2={x + 0.5} y2={y - trunkHeight * 0.2} stroke="#94d1c4" strokeWidth="0.3" opacity="0.3" />
      <line x1={x - 0.5} y1={y - trunkHeight * 0.6} x2={x + 0.5} y2={y - trunkHeight * 0.5} stroke="#94d1c4" strokeWidth="0.3" opacity="0.3" />
      {/* Canopy layers - concentric circles */}
      {[40, 32, 24, 16].map((radius, i) => (
        <circle
          key={i}
          cx={x}
          cy={y - trunkHeight + 20}
          r={radius}
          fill="none"
          stroke="#94d1c4"
          strokeWidth={2 - i * 0.3}
          opacity={0.3 - i * 0.05}
        />
      ))}
    </g>
  );
}

// Garden visual component - creates detailed garden representation
function GardenVisual({ state }) {
  const colors = state.visual.colors;
  const viewBox = "0 0 200 200";
  
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto bg-gradient-to-br from-magiwork-cream via-magiwork-beige to-white rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(30, 45, 46, 0.08)' }}>
      {/* Soft soil texture base */}
      <div className="absolute inset-0 opacity-40" style={{
        background: `radial-gradient(ellipse at bottom, ${colors[0]}50 0%, transparent 60%),
                     radial-gradient(circle at 30% 70%, ${colors[1] || colors[0]}30 0%, transparent 40%),
                     radial-gradient(circle at 70% 30%, ${colors[1] || colors[0]}20 0%, transparent 40%)`
      }} />
      
      {/* SVG Garden Illustration */}
      <svg
        viewBox={viewBox}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
      
        {/* Visual elements based on state */}
        {state.id === 'quiet-ground' && (
          <>
            {/* Soft ground layer */}
            <rect x="0" y="140" width="200" height="60" fill="#d4ccc0" opacity="0.2" />
            
            {/* Seeds (tiny dots with faint glow) */}
            <Seed x={80} y={170} size={2} />
            <Seed x={110} y={165} size={2.5} />
            <Seed x={130} y={172} size={2} />
            <Seed x={60} y={168} size={2.5} />
            
            {/* Tiny sprouts */}
            <Sprout x={100} y={160} height={6} hasLeaf={true} />
            
            {/* Funky worms (simple curved lines) */}
            <Worm x={70} y={175} length={12} />
            <Worm x={140} y={172} length={10} />
            
            {/* Mycelium hints (subtle white lines under soil) */}
            <Mycelium x={90} y={180} branches={3} />
            <Mycelium x={120} y={182} branches={4} />
            
            {/* Single thin root thread */}
            <line x1={100} y1={160} x2={100} y2={178} stroke="#8a7f73" strokeWidth="0.5" opacity="0.4" />
            <line x1={100} y1={178} x2={95} y2={185} stroke="#8a7f73" strokeWidth="0.3" opacity="0.3" />
            
            {/* Moss patches */}
            <circle cx={70} cy={178} r="3" fill="#94d1c4" opacity="0.15" />
            <circle cx={135} cy={180} r="2.5" fill="#94d1c4" opacity="0.15" />
          </>
        )}
      
        {state.id === 'gentle-sprouting' && (
          <>
            {/* Ground layer */}
            <rect x="0" y="140" width="200" height="60" fill="#c4d9c9" opacity="0.2" />
            
            {/* Multiple sprouts with tiny leaves */}
            <Sprout x={60} y={155} height={10} hasLeaf={true} />
            <Sprout x={90} y={150} height={12} hasLeaf={true} />
            <Sprout x={120} y={152} height={9} hasLeaf={true} />
            <Sprout x={150} y={158} height={8} hasLeaf={true} />
            
            {/* First sunlight ray entering from top-right */}
            <path d="M 180 20 L 160 40 L 140 60" fill="none" stroke="#ffd4a3" strokeWidth="8" opacity="0.15" strokeLinecap="round" />
            
            {/* Stronger, more visible root system */}
            <line x1={60} y1={155} x2={60} y2={170} stroke="#7ab8a8" strokeWidth="0.8" opacity="0.5" />
            <line x1={90} y1={150} x2={90} y2={170} stroke="#7ab8a8" strokeWidth="0.8" opacity="0.5" />
            <line x1={120} y1={152} x2={120} y2={172} stroke="#7ab8a8" strokeWidth="0.8" opacity="0.5" />
            <line x1={60} y1={170} x2={55} y2={175} stroke="#7ab8a8" strokeWidth="0.5" opacity="0.4" />
            <line x1={90} y1={170} x2={85} y2={175} stroke="#7ab8a8" strokeWidth="0.5" opacity="0.4" />
            <line x1={90} y1={170} x2={95} y2={175} stroke="#7ab8a8" strokeWidth="0.5" opacity="0.4" />
            
            {/* Dewdrops on leaves/soil */}
            <circle cx={92} cy={140} r="1.5" fill="#fff" opacity="0.5" />
            <circle cx={122} cy={142} r="1.5" fill="#fff" opacity="0.5" />
            <circle cx={152} cy={148} r="1.5" fill="#fff" opacity="0.5" />
            <circle cx={62} cy={145} r="1.5" fill="#fff" opacity="0.5" />
            
            {/* Tiny mushrooms */}
            <Mushroom x={75} y={170} size={4} />
            <Mushroom x={110} y={172} size={3.5} />
            
            {/* Slightly denser mycelium */}
            <Mycelium x={70} y={178} branches={5} />
            <Mycelium x={100} y={180} branches={4} />
            <Mycelium x={130} y={182} branches={5} />
          </>
        )}
      
        {state.id === 'rooting-in' && (
          <>
            {/* Deeper ground with roots */}
            <rect x="0" y="120" width="200" height="80" fill="#94d1c4" opacity="0.15" />
            
            {/* Stronger stems - thicker and upright */}
            <line x1={70} y1={200} x2={70} y2={130} stroke="#94d1c4" strokeWidth="1.5" opacity="0.7" />
            <line x1={100} y1={200} x2={100} y2={125} stroke="#94d1c4" strokeWidth="2" opacity="0.8" />
            <line x1={130} y1={200} x2={130} y2={135} stroke="#94d1c4" strokeWidth="1.5" opacity="0.7" />
            
            {/* Multiple leaves per plant */}
            {[70, 100, 130].map((x, i) => (
              <g key={i}>
                <ellipse cx={x - 3} cy={130 + i * 5} rx="3" ry="5" fill="#94d1c4" opacity="0.6" transform={`rotate(-20 ${x} ${130 + i * 5})`} />
                <ellipse cx={x + 3} cy={130 + i * 5} rx="3" ry="5" fill="#94d1c4" opacity="0.6" transform={`rotate(20 ${x} ${130 + i * 5})`} />
                <ellipse cx={x} cy={128 + i * 5} rx="2" ry="4" fill="#94d1c4" opacity="0.5" />
              </g>
            ))}
            
            {/* Visible, branching roots connecting across soil */}
            {/* Left plant roots */}
            <line x1={70} y1={200} x2={70} y2={185} stroke="#6ba89a" strokeWidth="1.5" opacity="0.5" />
            <line x1={70} y1={185} x2={65} y2={195} stroke="#6ba89a" strokeWidth="1" opacity="0.4" />
            <line x1={70} y1={185} x2={75} y2={190} stroke="#6ba89a" strokeWidth="1" opacity="0.4" />
            <line x1={70} y1={190} x2={60} y2={198} stroke="#6ba89a" strokeWidth="0.8" opacity="0.3" />
            
            {/* Center plant roots */}
            <line x1={100} y1={200} x2={100} y2={180} stroke="#6ba89a" strokeWidth="1.8" opacity="0.6" />
            <line x1={100} y1={180} x2={90} y2={192} stroke="#6ba89a" strokeWidth="1.2" opacity="0.4" />
            <line x1={100} y1={180} x2={110} y2={188} stroke="#6ba89a" strokeWidth="1.2" opacity="0.4" />
            <line x1={100} y1={185} x2={85} y2={195} stroke="#6ba89a" strokeWidth="1" opacity="0.3" />
            <line x1={100} y1={185} x2={115} y2={195} stroke="#6ba89a" strokeWidth="1" opacity="0.3" />
            
            {/* Right plant roots */}
            <line x1={130} y1={200} x2={130} y2={182} stroke="#6ba89a" strokeWidth="1.5" opacity="0.5" />
            <line x1={130} y1={182} x2={125} y2={190} stroke="#6ba89a" strokeWidth="1" opacity="0.4" />
            <line x1={130} y1={182} x2={138} y2={195} stroke="#6ba89a" strokeWidth="1" opacity="0.4" />
            
            {/* Roots connecting to each other */}
            <line x1={75} y1={190} x2={90} y2={188} stroke="#6ba89a" strokeWidth="0.6" opacity="0.3" />
            <line x1={110} y1={188} x2={125} y2={190} stroke="#6ba89a" strokeWidth="0.6" opacity="0.3" />
            
            {/* Moss growing along roots */}
            <circle cx={72} cy={185} r="2" fill="#7ab8a8" opacity="0.3" />
            <circle cx={102} cy={182} r="2.5" fill="#7ab8a8" opacity="0.35" />
            <circle cx={128} cy={184} r="2" fill="#7ab8a8" opacity="0.3" />
            
            {/* Early flowers */}
            <circle cx={70} cy={128} r="4" fill="#c4a8d9" opacity="0.4" />
            <circle cx={100} cy={123} r="5" fill="#a8d4d9" opacity="0.4" />
            
            {/* Pollinators - tiny bees */}
            <Bee x={75} y={120} />
            <Bee x={125} y={115} />
            
            {/* Simple butterflies */}
            <Butterfly x={85} y={110} color="#c4a8d9" />
            
            {/* Light orbs / fairies (1-2 tiny glows) */}
            <LightOrb x={50} y={80} size={4} />
            <LightOrb x={150} y={90} size={5} />
          </>
        )}
      
        {state.id === 'blossoming-light' && (
          <>
            {/* Lighter, more open ground */}
            <rect x="0" y="130" width="200" height="70" fill="#94d1c4" opacity="0.2" />
            <rect x="0" y="130" width="200" height="70" fill="#ffd4a3" opacity="0.1" />
            
            {/* Lotus flowers opening */}
            <line x1={60} y1={200} x2={60} y2={150} stroke="#94d1c4" strokeWidth="1" opacity="0.7" />
            <LotusFlower x={60} y={150} size={8} />
            
            <line x1={100} y1={200} x2={100} y2={145} stroke="#94d1c4" strokeWidth="1.2" opacity="0.8" />
            <LotusFlower x={100} y={145} size={10} />
            
            <line x1={140} y1={200} x2={140} y2={148} stroke="#94d1c4" strokeWidth="1" opacity="0.7" />
            <LotusFlower x={140} y={148} size={7} />
            
            {/* Glowing mushrooms with soft inner glow */}
            <GlowingMushroom x={50} y={175} size={6} />
            <GlowingMushroom x={80} y={180} size={5} />
            <GlowingMushroom x={120} y={178} size={6} />
            <GlowingMushroom x={160} y={182} size={5} />
            
            {/* Soft sunlight / warm beams from top */}
            <path d="M 200 0 L 180 30 L 160 50" fill="none" stroke="#ffd4a3" strokeWidth="12" opacity="0.2" strokeLinecap="round" />
            <path d="M 180 10 L 160 40 L 140 60" fill="none" stroke="#ffaf42" strokeWidth="10" opacity="0.15" strokeLinecap="round" />
            <path d="M 20 0 L 40 30 L 60 50" fill="none" stroke="#ffd4a3" strokeWidth="10" opacity="0.15" strokeLinecap="round" />
            
            {/* More light orbs / fairies as glowing particles */}
            <LightOrb x={40} y={90} size={6} />
            <LightOrb x={80} y={85} size={5} />
            <LightOrb x={120} y={95} size={6} />
            <LightOrb x={160} y={88} size={5} />
            
            {/* Bird silhouettes / tiny birds */}
            <Bird x={30} y={100} />
            <Bird x={170} y={105} />
            <Bird x={90} y={70} />
            
            {/* Taller grasses or plants gently leaning */}
            <line x1={45} y1={200} x2={42} y2={140} stroke="#7ab8a8" strokeWidth="1.2" opacity="0.6" />
            <ellipse cx={40} cy={140} rx="4" ry="6" fill="#7ab8a8" opacity="0.5" transform="rotate(-10 40 140)" />
            <ellipse cx={44} cy={150} rx="3" ry="5" fill="#7ab8a8" opacity="0.5" transform="rotate(15 44 150)" />
            
            <line x1={155} y1={200} x2={158} y2={135} stroke="#7ab8a8" strokeWidth="1.2" opacity="0.6" />
            <ellipse cx={162} cy={135} rx="4" ry="6" fill="#7ab8a8" opacity="0.5" transform="rotate(10 162 135)" />
            <ellipse cx={156} cy={145} rx="3" ry="5" fill="#7ab8a8" opacity="0.5" transform="rotate(-15 156 145)" />
          </>
        )}
      
        {state.id === 'flourishing-garden' && (
          <>
            {/* Rich, layered ground */}
            <rect x="0" y="120" width="200" height="80" fill="#7ab8a8" opacity="0.2" />
            <rect x="0" y="120" width="200" height="80" fill="#94d1c4" opacity="0.15" />
            <rect x="0" y="120" width="200" height="80" fill="#ffd4a3" opacity="0.08" />
            
            {/* Lotus ponds / water element */}
            <ellipse cx={80} cy={180} rx="25" ry="15" fill="#a8d4d9" opacity="0.3" />
            <ellipse cx={120} cy={185} rx="20" ry="12" fill="#a8d4d9" opacity="0.25" />
            {/* Water reflections - ripple pattern */}
            <circle cx={80} cy={180} r="12" fill="none" stroke="#94d1c4" strokeWidth="1" opacity="0.2" />
            <circle cx={120} cy={185} r="10" fill="none" stroke="#94d1c4" strokeWidth="1" opacity="0.2" />
            
            {/* Lightweave Tree - central focal point */}
            <LightweaveTree x={100} y={200} trunkHeight={50} />
            
            {/* All previous elements from other states present */}
            {/* Multiple sprouts and plants */}
            <Sprout x={45} y={165} height={12} hasLeaf={true} />
            <Sprout x={65} y={160} height={14} hasLeaf={true} />
            <Sprout x={135} y={162} height={13} hasLeaf={true} />
            <Sprout x={155} y={168} height={11} hasLeaf={true} />
            
            {/* More glowing mushrooms */}
            <GlowingMushroom x={40} y={175} size={5} />
            <GlowingMushroom x={55} y={180} size={6} />
            <GlowingMushroom x={145} y={178} size={5} />
            <GlowingMushroom x={165} y={182} size={6} />
            
            {/* Lotus flowers in water */}
            <LotusFlower x={75} y={170} size={7} />
            <LotusFlower x={115} y={175} size={8} />
            
            {/* Firefly-like lights */}
            <Firefly x={35} y={100} />
            <Firefly x={60} y={85} />
            <Firefly x={90} y={95} />
            <Firefly x={140} y={88} />
            <Firefly x={165} y={105} />
            
            {/* Small birds */}
            <Bird x={25} y={110} />
            <Bird x={50} y={70} />
            <Bird x={175} y={100} />
            <Bird x={150} y={75} />
            
            {/* Soft floating petals */}
            <Petal x={40} y={60} rotation={-15} />
            <Petal x={70} y={45} rotation={25} />
            <Petal x={130} y={50} rotation={-30} />
            <Petal x={160} y={55} rotation={40} />
            <Petal x={90} y={40} rotation={-20} />
            <Petal x={110} y={35} rotation={35} />
            
            {/* Slightly levitating leaves */}
            <ellipse cx={30} cy={120} rx="4" ry="6" fill="#7ab8a8" opacity="0.4" transform="rotate(-15 30 120)" />
            <circle cx={30} cy={125} r="3" fill="#94d1c4" opacity="0.1" />
            <ellipse cx={170} cy={115} rx="4" ry="6" fill="#7ab8a8" opacity="0.4" transform="rotate(20 170 115)" />
            <circle cx={170} cy={120} r="3" fill="#94d1c4" opacity="0.1" />
            
            {/* Soft glow paths connecting elements */}
            <path d="M 80 170 Q 90 150 100 130" fill="none" stroke="#ffd4a3" strokeWidth="2" opacity="0.1" strokeLinecap="round" />
            <path d="M 120 175 Q 110 155 100 130" fill="none" stroke="#ffd4a3" strokeWidth="2" opacity="0.1" strokeLinecap="round" />
            
            {/* More light orbs / fairies */}
            <LightOrb x={50} y={80} size={6} />
            <LightOrb x={75} y={75} size={5} />
            <LightOrb x={125} y={85} size={6} />
            <LightOrb x={150} y={82} size={5} />
          </>
        )}
      </svg>
    </div>
  );
}

// Creature/Plant chip component
function ElementChip({ element }) {
  return (
    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-3 border border-magiwork-green/20">
      <span className="text-2xl">{element.icon}</span>
      <div className="flex-1">
        <div className="font-hanken text-sm font-semibold text-magiwork-dark-green">
          {element.name}
        </div>
        <div className="font-hanken text-xs text-magiwork-dark-green/60">
          {element.meaning}
        </div>
      </div>
    </div>
  );
}

export default function GardenStatesDemo() {
  console.log('🌱 GardenStatesDemo component rendering');
  const [selectedStateId, setSelectedStateId] = useState(GARDEN_STATES[0].id);
  const selectedState = GARDEN_STATES.find(s => s.id === selectedStateId);
  const allElements = [...selectedState.creatures, ...selectedState.plants];

  return (
    <div className="min-h-screen bg-magiwork-beige overflow-y-auto">
      {/* Header */}
      <div 
        className="sticky top-0 z-40 bg-gradient-to-b from-[rgba(252,248,242,0.98)] to-transparent backdrop-blur-md pb-4 pt-4" 
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 24px) + 1rem)' }}
      >
        <div className="max-w-2xl mx-auto px-4 md:px-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-hanken text-2xl md:text-3xl font-semibold text-magiwork-dark-green">
                Your Magical Garden States
              </h1>
              <p className="font-hanken text-sm text-magiwork-dark-green/60 mt-1">
                Each state reflects how cared for your inner garden feels this month.
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-white/50 transition-colors flex-shrink-0"
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e2d2e" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* State Selector */}
          <div className="flex flex-wrap gap-2">
            {GARDEN_STATES.map((state) => (
              <button
                key={state.id}
                onClick={() => setSelectedStateId(state.id)}
                className={`px-4 py-2 rounded-full font-hanken text-sm transition-all ${
                  selectedStateId === state.id
                    ? 'bg-magiwork-dark-green text-white'
                    : 'bg-white/70 text-magiwork-dark-green border border-magiwork-dark-green/20 hover:bg-white/90'
                }`}
              >
                {state.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-5 pb-20 pt-6 space-y-8">
        {/* Garden Preview */}
        <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 md:p-8" style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}>
          <GardenVisual state={selectedState} />
        </div>

        {/* State Info Block */}
        <div className="bg-white/50 backdrop-blur-lg rounded-2xl p-6 md:p-8 space-y-4" style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}>
          <div>
            <h2 className="font-hanken text-xl md:text-2xl font-semibold text-magiwork-dark-green mb-2">
              {selectedState.name}
            </h2>
            <p className="font-hanken text-base text-magiwork-dark-green/80 mb-4">
              {selectedState.meaning}
            </p>
            <p className="font-hanken text-sm text-magiwork-dark-green/70 leading-relaxed">
              {selectedState.description}
            </p>
          </div>

          <div className="pt-4 border-t border-magiwork-dark-green/10">
            <h3 className="font-hanken text-sm font-semibold text-magiwork-dark-green mb-3">
              Nervous System Meaning
            </h3>
            <ul className="space-y-2">
              {selectedState.nervousSystemMeaning.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-magiwork-green mt-1">•</span>
                  <span className="font-hanken text-sm text-magiwork-dark-green/70">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Creatures & Plants Summary */}
        <div className="space-y-4">
          <h3 className="font-hanken text-lg font-semibold text-magiwork-dark-green">
            Magical Elements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allElements.map((element, index) => (
              <ElementChip key={index} element={element} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

