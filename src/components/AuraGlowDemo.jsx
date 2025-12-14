import { motion } from 'framer-motion';
import { useState } from 'react';
import HypnoticAuraVisual from './HypnoticAuraVisual';
import { gradientStyle } from '../styles/gradients';

// Demo scenarios showing aura progression
const DEMO_SCENARIOS = [
  {
    id: 1,
    label: 'First Practice',
    sessionsThisMonth: 1,
    consecutiveDays: 1,
    description: 'Just starting your journey'
  },
  {
    id: 2,
    label: 'Building Consistency',
    sessionsThisMonth: 5,
    consecutiveDays: 3,
    description: 'Finding your rhythm'
  },
  {
    id: 3,
    label: 'Growing Strong',
    sessionsThisMonth: 10,
    consecutiveDays: 7,
    description: 'Your practice is deepening'
  },
  {
    id: 4,
    label: 'Steady Glow',
    sessionsThisMonth: 15,
    consecutiveDays: 12,
    description: 'Consistent presence'
  },
  {
    id: 5,
    label: 'Radiant Light',
    sessionsThisMonth: 22,
    consecutiveDays: 18,
    description: 'Your aura is bright'
  },
  {
    id: 6,
    label: 'Luminous Being',
    sessionsThisMonth: 30,
    consecutiveDays: 30,
    description: 'Every day presence'
  }
];

export default function AuraGlowDemo() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const scenario = DEMO_SCENARIOS[selectedScenario];
  const gradient = 'gentleDeStress';
  const bgGradient = gradientStyle(gradient);

  // Mock aura object
  const mockAura = {
    id: `demo-${scenario.id}`,
    name: scenario.label,
    label: scenario.description
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center px-4 py-12"
      style={bgGradient}
    >
      <div className="max-w-4xl w-full space-y-8 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-actay font-bold text-white text-3xl md:text-4xl mb-4 drop-shadow-lg">
            How Your Aura Glows
          </h1>
          <p className="font-hanken text-white/90 text-lg drop-shadow-sm">
            Watch how your aura becomes more luminous with consistent practice
          </p>
        </motion.div>

        {/* Scenario Selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {DEMO_SCENARIOS.map((scenario, index) => (
            <motion.button
              key={scenario.id}
              onClick={() => setSelectedScenario(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-full font-hanken text-sm font-medium transition-all ${
                selectedScenario === index
                  ? 'bg-white/90 text-[#1e2d2e] shadow-lg'
                  : 'bg-white/50 text-white hover:bg-white/70'
              }`}
            >
              {scenario.label}
            </motion.button>
          ))}
        </div>

        {/* Aura Display */}
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 flex flex-col items-center"
          style={{ boxShadow: '0 4px 16px rgba(30, 45, 46, 0.15)' }}
        >
          {/* Scenario Info */}
          <div className="text-center mb-8">
            <h2 className="font-hanken font-bold text-[#1e2d2e] text-xl md:text-2xl mb-2">
              {scenario.label}
            </h2>
            <p className="font-hanken text-[#1e2d2e]/70 text-base mb-4">
              {scenario.description}
            </p>
            <div className="flex gap-6 justify-center text-sm">
              <div>
                <span className="font-hanken text-[#1e2d2e]/60">Sessions:</span>{' '}
                <span className="font-hanken font-bold text-[#1e2d2e]">{scenario.sessionsThisMonth}</span>
              </div>
              <div>
                <span className="font-hanken text-[#1e2d2e]/60">Consecutive Days:</span>{' '}
                <span className="font-hanken font-bold text-[#1e2d2e]">{scenario.consecutiveDays}</span>
              </div>
            </div>
          </div>

          {/* Aura Visual */}
          <div className="flex justify-center items-center py-8">
            <HypnoticAuraVisual
              aura={mockAura}
              completionRatio={scenario.sessionsThisMonth / 30}
              tier={Math.min(Math.floor(scenario.sessionsThisMonth / 5) + 1, 5)}
              minutesPracticed={10}
              sessionsThisMonth={scenario.sessionsThisMonth}
              consecutiveDays={scenario.consecutiveDays}
            />
          </div>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {DEMO_SCENARIOS.map((scenario, index) => (
            <motion.div
              key={scenario.id}
              onClick={() => setSelectedScenario(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-white/80 backdrop-blur-xl rounded-xl p-4 cursor-pointer transition-all ${
                selectedScenario === index
                  ? 'ring-2 ring-white shadow-lg'
                  : 'hover:bg-white/90'
              }`}
              style={{ boxShadow: '0 2px 8px rgba(30, 45, 46, 0.1)' }}
            >
              <div className="text-center mb-3">
                <h3 className="font-hanken font-semibold text-[#1e2d2e] text-sm mb-1">
                  {scenario.label}
                </h3>
                <p className="font-hanken text-[#1e2d2e]/60 text-xs">
                  {scenario.sessionsThisMonth} sessions
                </p>
              </div>
              <div className="flex justify-center">
                <HypnoticAuraVisual
                  aura={{
                    id: `mini-${scenario.id}`,
                    name: scenario.label,
                    label: ''
                  }}
                  completionRatio={scenario.sessionsThisMonth / 30}
                  tier={Math.min(Math.floor(scenario.sessionsThisMonth / 5) + 1, 5)}
                  minutesPracticed={10}
                  sessionsThisMonth={scenario.sessionsThisMonth}
                  consecutiveDays={scenario.consecutiveDays}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="font-hanken text-white/80 hover:text-white text-sm underline"
          >
            ← Back to app
          </a>
        </div>
      </div>
    </div>
  );
}

