import { motion } from 'framer-motion';

export default function LightBar({ todayLP, dailyTarget = 10 }) {
  const progress = Math.min(todayLP / dailyTarget, 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="font-hanken text-sm text-[#172223]/70">
          Light Points
        </span>
        <span className="font-hanken text-sm text-[#172223]">
          {todayLP} / {dailyTarget}
        </span>
      </div>
      <div className="w-full h-2 bg-[#172223]/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#172223] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

