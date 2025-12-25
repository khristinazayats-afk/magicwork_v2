
// Tree Growth Stage Components - Minimal, Elegant SVG Illustrations
function Stage1_GroundingFoundation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="soilGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d4ccc0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#a89b8f" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="seedGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#1e2d2e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1e2d2e" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Soft soil ground */}
      <rect x="0" y="160" width="200" height="40" fill="url(#soilGradient)" />
      
      {/* Seed - minimal, organic shape */}
      <ellipse cx="100" cy="170" rx="4" ry="5" fill="#1e2d2e" opacity="0.7" />
      <ellipse cx="100" cy="170" rx="2.5" ry="3" fill="#2d3d3e" opacity="0.5" />
      <circle cx="100" cy="170" r="6" fill="url(#seedGlow)" />
      
      {/* Early root threads - very subtle, organic curves */}
      <path
        d="M 100 175 Q 95 180 92 185 T 88 190"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="0.8"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M 100 175 Q 105 180 108 185 T 112 190"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="0.8"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M 100 175 Q 100 180 100 185 T 100 190"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="0.6"
        opacity="0.25"
        strokeLinecap="round"
      />
      
      {/* Subtle soil texture */}
      <circle cx="80" cy="175" r="1.5" fill="#a89b8f" opacity="0.2" />
      <circle cx="120" cy="178" r="1" fill="#a89b8f" opacity="0.2" />
      <circle cx="90" cy="182" r="1.2" fill="#a89b8f" opacity="0.2" />
    </svg>
  );
}

function Stage2_QuietConfidence() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="lightRay" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd4a3" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffd4a3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="leafGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#94d1c4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#94d1c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Soft soil */}
      <rect x="0" y="160" width="200" height="40" fill="#d4ccc0" opacity="0.2" />
      
      {/* Ray of light - gentle, organic */}
      <path
        d="M 180 20 Q 150 50 130 80"
        fill="none"
        stroke="#ffd4a3"
        strokeWidth="20"
        opacity="0.15"
        strokeLinecap="round"
      />
      
      {/* Thin trunk emerging */}
      <line
        x1="100"
        y1="200"
        x2="100"
        y2="140"
        stroke="#1e2d2e"
        strokeWidth="1.2"
        opacity="0.5"
        strokeLinecap="round"
      />
      
      {/* First leaf - soft, organic curve */}
      <ellipse
        cx="95"
        cy="135"
        rx="6"
        ry="8"
        fill="#94d1c4"
        opacity="0.6"
        transform="rotate(-25 95 135)"
      />
      <ellipse
        cx="95"
        cy="135"
        rx="8"
        ry="10"
        fill="url(#leafGlow)"
      />
      
      {/* Second leaf */}
      <ellipse
        cx="105"
        cy="138"
        rx="5"
        ry="7"
        fill="#94d1c4"
        opacity="0.5"
        transform="rotate(20 105 138)"
      />
      
      {/* Subtle root system */}
      <path
        d="M 100 200 Q 95 195 92 192"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="0.8"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 105 195 108 192"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="0.8"
        opacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Stage3_HarmoniousBeginning() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e2d2e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1e2d2e" stopOpacity="0.4" />
        </linearGradient>
        <radialGradient id="budGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffaf42" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffaf42" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Ground */}
      <rect x="0" y="150" width="200" height="50" fill="#d4ccc0" opacity="0.2" />
      
      {/* Stronger trunk */}
      <line
        x1="100"
        y1="200"
        x2="100"
        y2="100"
        stroke="url(#trunkGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      
      {/* Visible roots - stronger, branching */}
      <path
        d="M 100 200 Q 90 195 85 192 Q 80 190 78 188"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.2"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 110 195 115 192 Q 120 190 122 188"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.2"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 100 195 100 192"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
      
      {/* Few branches */}
      <line
        x1="100"
        y1="120"
        x2="85"
        y2="110"
        stroke="#1e2d2e"
        strokeWidth="1.5"
        opacity="0.5"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="120"
        x2="115"
        y2="110"
        stroke="#1e2d2e"
        strokeWidth="1.5"
        opacity="0.5"
        strokeLinecap="round"
      />
      
      {/* Early buds and small leaves */}
      <circle cx="85" cy="110" r="3" fill="#ffaf42" opacity="0.5" />
      <circle cx="85" cy="110" r="5" fill="url(#budGlow)" />
      
      <ellipse
        cx="115"
        cy="108"
        rx="4"
        ry="5"
        fill="#94d1c4"
        opacity="0.5"
        transform="rotate(-15 115 108)"
      />
      
      <ellipse
        cx="100"
        cy="105"
        rx="3"
        ry="4"
        fill="#94d1c4"
        opacity="0.4"
        transform="rotate(10 100 105)"
      />
    </svg>
  );
}

function Stage4_BloomingDays() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <linearGradient id="sunlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd4a3" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#ffaf42" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffd4a3" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="blossomGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffaf42" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffaf42" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="auraGlow" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#ffd4a3" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ffd4a3" stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Warm ground */}
      <rect x="0" y="140" width="200" height="60" fill="#d4ccc0" opacity="0.2" />
      
      {/* Warm sunlight - soft glow from top */}
      <ellipse cx="100" cy="30" rx="80" ry="60" fill="url(#sunlightGradient)" />
      
      {/* Medium tree trunk */}
      <line
        x1="100"
        y1="200"
        x2="100"
        y2="80"
        stroke="#1e2d2e"
        strokeWidth="3"
        opacity="0.6"
        strokeLinecap="round"
      />
      
      {/* Stronger roots */}
      <path
        d="M 100 200 Q 85 195 75 190 Q 70 188 68 186"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 115 195 125 190 Q 130 188 132 186"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.8"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 100 195 100 192"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.5"
        opacity="0.35"
        strokeLinecap="round"
      />
      
      {/* Multiple branches */}
      <line x1="100" y1="100" x2="75" y2="85" stroke="#1e2d2e" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <line x1="100" y1="100" x2="125" y2="85" stroke="#1e2d2e" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
      <line x1="100" y1="95" x2="90" y2="80" stroke="#1e2d2e" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
      <line x1="100" y1="95" x2="110" y2="80" stroke="#1e2d2e" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
      
      {/* Rich leaves - organic clusters */}
      {[75, 90, 100, 110, 125].map((x, i) => (
        <g key={i}>
          <ellipse
            cx={x}
            cy={85 - i * 2}
            rx="6"
            ry="8"
            fill="#94d1c4"
            opacity="0.6"
            transform={`rotate(${-20 + i * 10} ${x} ${85 - i * 2})`}
          />
          <ellipse
            cx={x + 2}
            cy={87 - i * 2}
            rx="5"
            ry="7"
            fill="#7ab8a8"
            opacity="0.5"
            transform={`rotate(${15 - i * 5} ${x + 2} ${87 - i * 2})`}
          />
        </g>
      ))}
      
      {/* Blossoms - soft, warm */}
      <circle cx="75" cy="85" r="4" fill="#ffaf42" opacity="0.6" />
      <circle cx="75" cy="85" r="7" fill="url(#blossomGlow)" />
      
      <circle cx="110" cy="80" r="3.5" fill="#ffaf42" opacity="0.5" />
      <circle cx="110" cy="80" r="6" fill="url(#blossomGlow)" />
      
      <circle cx="90" cy="80" r="3" fill="#ffaf42" opacity="0.5" />
      <circle cx="90" cy="80" r="5" fill="url(#blossomGlow)" />
      
      {/* Soft glow around tree */}
      <ellipse cx="100" cy="90" rx="50" ry="40" fill="url(#auraGlow)" />
    </svg>
  );
}

function Stage5_QuietPeace() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      <defs>
        <radialGradient id="petalGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#BDB2CD" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#BDB2CD" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="treeAura" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#ffd4a3" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#94d1c4" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#BDB2CD" stopOpacity="0" />
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
        </filter>
      </defs>
      
      {/* Ground */}
      <rect x="0" y="130" width="200" height="70" fill="#d4ccc0" opacity="0.2" />
      
      {/* Full, serene tree trunk */}
      <line
        x1="100"
        y1="200"
        x2="100"
        y2="60"
        stroke="#1e2d2e"
        strokeWidth="4"
        opacity="0.5"
        strokeLinecap="round"
      />
      
      {/* Deep, balanced root system */}
      <path
        d="M 100 200 Q 80 195 65 190 Q 55 188 50 186"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="2"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 120 195 135 190 Q 145 188 150 186"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="2"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 100 195 100 192"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.8"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 90 198 85 196"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.5"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M 100 200 Q 110 198 115 196"
        fill="none"
        stroke="#1e2d2e"
        strokeWidth="1.5"
        opacity="0.3"
        strokeLinecap="round"
      />
      
      {/* Balanced canopy - multiple branches */}
      {[
        { x1: 100, y1: 80, x2: 70, y2: 50 },
        { x1: 100, y1: 80, x2: 130, y2: 50 },
        { x1: 100, y1: 75, x2: 85, y2: 45 },
        { x1: 100, y1: 75, x2: 115, y2: 45 },
        { x1: 100, y1: 70, x2: 90, y2: 40 },
        { x1: 100, y1: 70, x2: 110, y2: 40 },
      ].map((branch, i) => (
        <line
          key={i}
          x1={branch.x1}
          y1={branch.y1}
          x2={branch.x2}
          y2={branch.y2}
          stroke="#1e2d2e"
          strokeWidth={2 - i * 0.2}
          opacity="0.5"
          strokeLinecap="round"
        />
      ))}
      
      {/* Rich, balanced leaf clusters */}
      {[70, 85, 90, 100, 110, 115, 130].map((x, i) => {
        const y = 50 - i * 1.5;
        return (
          <g key={i}>
            <ellipse
              cx={x}
              cy={y}
              rx="7"
              ry="9"
              fill="#94d1c4"
              opacity="0.6"
              transform={`rotate(${-25 + i * 7} ${x} ${y})`}
            />
            <ellipse
              cx={x + 2}
              cy={y + 1}
              rx="6"
              ry="8"
              fill="#7ab8a8"
              opacity="0.5"
              transform={`rotate(${20 - i * 5} ${x + 2} ${y + 1})`}
            />
            <ellipse
              cx={x - 1}
              cy={y + 2}
              rx="5"
              ry="7"
              fill="#94d1c4"
              opacity="0.4"
              transform={`rotate(${-10 + i * 3} ${x - 1} ${y + 2})`}
            />
          </g>
        );
      })}
      
      {/* Floating petals - soft, lilac */}
      {[
        { x: 60, y: 70, rotation: -15 },
        { x: 140, y: 65, rotation: 25 },
        { x: 50, y: 90, rotation: -30 },
        { x: 150, y: 85, rotation: 40 },
        { x: 75, y: 50, rotation: -20 },
        { x: 125, y: 45, rotation: 35 },
      ].map((petal, i) => (
        <ellipse
          key={i}
          cx={petal.x}
          cy={petal.y}
          rx="4"
          ry="6"
          fill="#BDB2CD"
          opacity="0.5"
          transform={`rotate(${petal.rotation} ${petal.x} ${petal.y})`}
        />
      ))}
      
      {/* Warm aura - gentle shimmer effect */}
      <ellipse cx="100" cy="60" rx="60" ry="50" fill="url(#treeAura)" />
      
      {/* Soft glow points */}
      <circle cx="70" cy="50" r="3" fill="#ffd4a3" opacity="0.3" filter="url(#softGlow)" />
      <circle cx="130" cy="50" r="3" fill="#ffd4a3" opacity="0.3" filter="url(#softGlow)" />
      <circle cx="100" cy="45" r="2.5" fill="#94d1c4" opacity="0.25" filter="url(#softGlow)" />
    </svg>
  );
}

// Stage Card Component
function StageCard({ stage, index, children }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full aspect-square max-w-[280px] bg-gradient-to-br from-magiwork-cream via-magiwork-beige to-white rounded-3xl overflow-hidden shadow-lg"
        style={{ boxShadow: '0 8px 32px rgba(30, 45, 46, 0.08)' }}>
        <div className="absolute inset-0 p-6">
          {children}
        </div>
      </div>
      <div className="text-center">
        <div className="font-hanken text-sm font-medium text-magiwork-dark-green/60">
          Stage {index + 1}
        </div>
        <div className="font-hanken text-xs text-magiwork-dark-green/40 mt-1">
          {stage.name}
        </div>
      </div>
    </div>
  );
}

const TREE_STAGES = [
  {
    id: 'grounding',
    name: 'Grounding Foundation',
    component: Stage1_GroundingFoundation,
  },
  {
    id: 'confidence',
    name: 'Quiet Confidence',
    component: Stage2_QuietConfidence,
  },
  {
    id: 'beginning',
    name: 'Harmonious Beginning',
    component: Stage3_HarmoniousBeginning,
  },
  {
    id: 'blooming',
    name: 'Blooming Days',
    component: Stage4_BloomingDays,
  },
  {
    id: 'peace',
    name: 'Quiet Peace',
    component: Stage5_QuietPeace,
  },
];

export default function TreeGrowthDemo() {
  return (
    <div className="min-h-screen bg-magiwork-beige overflow-y-auto">
      {/* Header */}
      <div 
        className="sticky top-0 z-40 bg-gradient-to-b from-[rgba(252,248,242,0.98)] to-transparent backdrop-blur-md pb-6 pt-6" 
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 24px) + 1.5rem)' }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-actay font-bold text-3xl md:text-4xl text-magiwork-dark-green">
              Tree Growth Demo
            </h1>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-20 pt-8">
        {/* Five Tree Stages - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 mb-12">
          {TREE_STAGES.map((stage, index) => {
            const StageComponent = stage.component;
            return (
              <StageCard key={stage.id} stage={stage} index={index}>
                <StageComponent />
              </StageCard>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-hanken text-base md:text-lg text-magiwork-dark-green/70 leading-relaxed">
            Visual exploration of how the user's inner world evolves.
          </p>
        </div>
      </div>
    </div>
  );
}

