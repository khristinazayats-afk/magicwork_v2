import { motion } from 'framer-motion';

export default function ProgressOrb({ todayLP, streak, dailyTarget = 10 }) {
  const progress = Math.min(todayLP / dailyTarget, 1);
  const circumference = 2 * Math.PI * 40; // radius = 40
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90 w-24 h-24">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-[#172223]/10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-[#172223]"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-hanken font-semibold text-[#172223] text-lg">
              {todayLP}
            </div>
            <div className="font-hanken text-[#172223]/60 text-xs">
              LP
            </div>
          </div>
        </div>
      </div>
      {/* Streak indicator */}
      {streak > 0 && (
        <div className="text-center">
          <div className="font-hanken text-[#172223]/70 text-sm">
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
          <div className="font-hanken text-[#172223]/50 text-xs">
            streak
          </div>
        </div>
      )}
    </div>
  );
}

