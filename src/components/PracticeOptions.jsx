import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PracticeOptions({ spaceName, onSelectPractice }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Pre-configured meditations for each space with images
  const preconfiguredMeditations = {
    'Slow Morning': [
      {
        title: 'Sunrise Breath',
        duration: '5 min',
        description: 'Gentle inhales synced with morning light awareness',
        image: '/assets/meditation-previews/sunrise-breath.jpg'
      },
      {
        title: 'Gratitude Setting',
        duration: '8 min',
        description: 'Three moments of thanks before starting your day',
        image: '/assets/meditation-previews/gratitude-setting.jpg'
      },
      {
        title: 'Morning Expansion',
        duration: '12 min',
        description: 'Full body activation with mindful stretching',
        image: '/assets/meditation-previews/morning-expansion.jpg'
      }
    ],
    'Gentle De-Stress': [
      {
        title: '3-Minute Rescue',
        duration: '3 min',
        description: 'Emergency calm for overwhelming moments',
        image: '/assets/meditation-previews/3-minute-rescue.jpg'
      },
      {
        title: 'Tension Release',
        duration: '7 min',
        description: 'Systematically soften every muscle group',
        image: '/assets/meditation-previews/tension-release.jpg'
      },
      {
        title: 'Nervous System Reset',
        duration: '15 min',
        description: 'Guide your body from stress to complete ease',
        image: '/assets/meditation-previews/nervous-system-reset.jpg'
      }
    ],
    'Take a Walk': [
      {
        title: 'Aware Steps',
        duration: '10 min',
        description: 'Feel each footfall connecting with the earth',
        image: '/assets/meditation-previews/aware-steps.jpg'
      },
      {
        title: 'Sensory Immersion',
        duration: '15 min',
        description: 'Heighten awareness of sights, sounds, and scents',
        image: '/assets/meditation-previews/sensory-immersion.jpg'
      },
      {
        title: 'Slow Pilgrimage',
        duration: '20 min',
        description: 'Intentional walking as a moving meditation',
        image: '/assets/meditation-previews/slow-pilgrimage.jpg'
      }
    ],
    'Draw Your Feels': [
      {
        title: 'Emotion to Color',
        duration: '5 min',
        description: 'Let your emotions guide your brush strokes',
        image: '/assets/meditation-previews/emotion-to-color.jpg'
      },
      {
        title: 'Intuitive Sketch',
        duration: '10 min',
        description: 'Draw without thinking—just feel and create',
        image: '/assets/meditation-previews/intuitive-sketch.jpg'
      },
      {
        title: 'Heart on Paper',
        duration: '18 min',
        description: 'Deep emotional expression through artistic flow',
        image: '/assets/meditation-previews/heart-on-paper.jpg'
      }
    ],
    'Move and Cool': [
      {
        title: 'Energy Release',
        duration: '8 min',
        description: 'Shake out tension, then ease into stillness',
        image: '/assets/meditation-previews/energy-release.jpg'
      },
      {
        title: 'Dynamic Flow',
        duration: '12 min',
        description: 'Rhythmic movement that builds to calm',
        image: '/assets/meditation-previews/dynamic-flow.jpg'
      },
      {
        title: 'Cool-Down Journey',
        duration: '15 min',
        description: 'Gradually transition from movement to peace',
        image: '/assets/meditation-previews/cool-down-journey.jpg'
      }
    ],
    'Tap to Ground': [
      {
        title: 'Quick Root',
        duration: '5 min',
        description: 'Tap points to anchor yourself instantly',
        image: '/assets/meditation-previews/quick-root.jpg'
      },
      {
        title: 'Body Awakening',
        duration: '8 min',
        description: 'Reconnect with your physical form through sensation',
        image: '/assets/meditation-previews/body-awakening.jpg'
      },
      {
        title: 'Deep Earth Bond',
        duration: '12 min',
        description: 'Feel yourself becoming heavy, stable, rooted',
        image: '/assets/meditation-previews/deep-earth-bond.jpg'
      }
    ],
    'Breathe to Relax': [
      {
        title: 'Balanced Breathing',
        duration: '5 min',
        description: 'Equal inhale and exhale to center your nervous system',
        image: '/assets/meditation-previews/balanced-breathing.jpg'
      },
      {
        title: 'Extended Exhale',
        duration: '10 min',
        description: 'Longer exhales activate your parasympathetic response',
        image: '/assets/meditation-previews/extended-exhale.jpg'
      },
      {
        title: 'Breath Meditation',
        duration: '15 min',
        description: 'Ride the waves of your natural breathing rhythm',
        image: '/assets/meditation-previews/breath-meditation.jpg'
      }
    ],
    'Get in the Flow State': [
      {
        title: 'Mind Sharpening',
        duration: '5 min',
        description: 'Clear mental clutter before deep work',
        image: '/assets/meditation-previews/mind-sharpening.jpg'
      },
      {
        title: 'Flow Gateway',
        duration: '15 min',
        description: 'Guided entry into focused, effortless engagement',
        image: '/assets/meditation-previews/flow-gateway.jpg'
      },
      {
        title: 'Peak Focus',
        duration: '20 min',
        description: 'Extended journey into optimal creative state',
        image: '/assets/meditation-previews/peak-focus.jpg'
      }
    ],
    'Drift into Sleep': [
      {
        title: 'Sleep Transition',
        duration: '10 min',
        description: 'Gentle letting go as your body prepares for rest',
        image: '/assets/meditation-previews/sleep-transition.jpg'
      },
      {
        title: 'Body Softening',
        duration: '15 min',
        description: 'Progressive relaxation melting into sleep',
        image: '/assets/meditation-previews/body-softening.jpg'
      },
      {
        title: 'Dream Passage',
        duration: '20 min',
        description: 'Deep guided journey into peaceful slumber',
        image: '/assets/meditation-previews/dream-passage.jpg'
      }
    ]
  };

  const meditations = preconfiguredMeditations[spaceName] || preconfiguredMeditations['Gentle De-Stress'];

  const handleSelectPractice = (index) => {
    setSelectedIndex(index);
    setTimeout(() => {
      onSelectPractice({
        type: 'preconfigured',
        index,
        ...meditations[index]
      });
    }, 300);
  };

  const handleCustomize = () => {
    onSelectPractice({
      type: 'custom',
      title: 'Your Custom Practice',
      duration: '∞',
      description: 'Create exactly what you need'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-4">
          Guided Meditations
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {meditations.map((meditation, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPractice(index)}
              className={`overflow-hidden rounded-2xl border-2 text-left transition-all ${
                selectedIndex === index
                  ? 'border-[#1e2d2e] bg-[#1e2d2e]/5'
                  : 'border-[#1e2d2e]/10 hover:border-[#1e2d2e]/30 hover:bg-[#f5f5f5]'
              }`}
            >
              {/* Meditation Image */}
              <div className="h-40 bg-gradient-to-br from-[#94d1c4]/20 to-[#94d1c4]/5 overflow-hidden">
                {meditation.image ? (
                  <img
                    src={meditation.image}
                    alt={meditation.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
              </div>

              {/* Meditation Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-hanken font-bold text-[#1e2d2e]">
                      {meditation.title}
                    </h4>
                    <p className="text-sm text-[#1e2d2e]/60 font-hanken mt-1">
                      {meditation.description}
                    </p>
                  </div>
                  <div className="text-sm font-hanken font-bold text-[#1e2d2e]/40 ml-4 whitespace-nowrap">
                    {meditation.duration}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-hanken font-bold text-[#1e2d2e]/40 uppercase tracking-widest mb-4">
          Customize Your Experience
        </h3>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCustomize}
          className="w-full p-6 rounded-2xl border-2 border-dashed border-[#94d1c4] text-center hover:border-[#94d1c4]/80 hover:bg-[#94d1c4]/5 transition-all"
        >
          <div className="text-4xl mb-2">✨</div>
          <h4 className="font-hanken font-bold text-[#1e2d2e] mb-1">
            Create Custom Practice
          </h4>
          <p className="text-sm text-[#1e2d2e]/60 font-hanken">
            Design your perfect meditation
          </p>
        </motion.button>
      </div>
    </div>
  );
}
