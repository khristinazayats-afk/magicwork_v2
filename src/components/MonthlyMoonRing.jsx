import { motion } from 'framer-motion';

export default function MonthlyMoonRing({ daysPracticed = 0, totalDays = 30, size = 120 }) {
  const radius = size / 2 - 8;
  const centerX = size / 2;
  const centerY = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(daysPracticed / totalDays, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);

  // Create 30 dots around the circle
  const dots = Array.from({ length: totalDays }, (_, i) => {
    const angle = (i / totalDays) * 2 * Math.PI - Math.PI / 2; // Start at top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const isFilled = i < daysPracticed;
    return { x, y, isFilled, index: i };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#1e2d2e"
          strokeWidth="1"
          opacity="0.1"
        />
        
        {/* Progress arc */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#94D1C4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>

      {/* Dots for each day */}
      <div className="absolute inset-0">
        {dots.map((dot) => (
          <motion.div
            key={dot.index}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: dot.index * 0.01, duration: 0.2 }}
            className="absolute rounded-full"
            style={{
              left: dot.x - 2,
              top: dot.y - 2,
              width: 4,
              height: 4,
              background: dot.isFilled ? '#94D1C4' : '#1e2d2e',
              opacity: dot.isFilled ? 0.8 : 0.15
            }}
          />
        ))}
      </div>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="font-hanken font-semibold text-[#1e2d2e] text-lg">
            {daysPracticed}
          </div>
          <div className="font-hanken text-xs text-[#1e2d2e]/60">
            / {totalDays}
          </div>
        </div>
      </div>
    </div>
  );
}


