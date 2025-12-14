import { motion } from 'framer-motion';
import AuraBadge from './AuraBadge';
import MonthlyMoonRing from './MonthlyMoonRing';

export default function MonthlyAuraCard({ 
  monthName, 
  daysPracticedThisMonth, 
  consecutiveDaysThisMonth, 
  aura 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 md:p-8"
      style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.1)' }}
    >
      {/* Month Header */}
      <div className="text-center mb-6">
        <h2 className="font-hanken text-xl md:text-2xl font-semibold text-[#1e2d2e] mb-1">
          {monthName}
        </h2>
        <p className="font-hanken text-sm text-[#1e2d2e]/60">
          You've practiced {daysPracticedThisMonth} {daysPracticedThisMonth === 1 ? 'day' : 'days'} this month, 
          with a {consecutiveDaysThisMonth}-day streak.
        </p>
      </div>

      {/* Aura Badge */}
      <div className="flex justify-center mb-6">
        <AuraBadge aura={aura} size="lg" />
      </div>

      {/* Moon Ring Progress */}
      <div className="flex justify-center mb-6">
        <MonthlyMoonRing daysPracticed={daysPracticedThisMonth} totalDays={30} size={140} />
      </div>

      {/* Aura Description */}
      <div className="text-center space-y-2">
        <h3 className="font-hanken text-lg font-semibold text-[#1e2d2e]">
          {aura.phaseName} — {aura.label}
        </h3>
        <p className="font-hanken text-base text-[#1e2d2e]/70 leading-relaxed">
          {aura.copy}
        </p>
        {daysPracticedThisMonth >= 7 && (
          <p className="font-hanken text-sm text-[#1e2d2e]/60 italic mt-2">
            Your nervous system is noticing your consistency.
          </p>
        )}
      </div>
    </motion.div>
  );
}


