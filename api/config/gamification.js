// Gamification configuration for API
// Single source of truth for LP values, caps, milestones, and targets

export const LP_VALUES = {
  tune_play: 1, // per full minute
  practice_complete: 5,
  share_post: 5,
  light_send: 1,
};

export const DAILY_CAPS = {
  practice_complete: 1, // per space per day
  share_post: 1, // per day
  light_send: 3, // per day
};

export const DAILY_LP_TARGET = 10; // soft target for UI visualization

export const MILESTONES = [
  {
    id: 1,
    lifetime_days: 1,
    consecutive_days: 1,
    title: "Dimmed Light, Spirits High",
    reward_copy: "You pressed pause — your body noticed.",
    science_link: "Single mindful pause lowers cortisol & HR.",
  },
  {
    id: 2,
    lifetime_days: 3,
    consecutive_days: 2,
    title: "Tiny Cloud of Calm",
    reward_copy: "Drifting between thoughts gets easier.",
    science_link: "Brief mindfulness enhances meta-awareness.",
  },
  {
    id: 3,
    lifetime_days: 5,
    consecutive_days: 3,
    title: "Cosmic Heartbeat",
    reward_copy: "Your calm rhythm is syncing with the world.",
    science_link: "Regular breathwork steadies HRV.",
  },
  {
    id: 4,
    lifetime_days: 7,
    consecutive_days: 5,
    title: "Parasympathetic Party",
    reward_copy: "Fewer alerts, more inner playlists.",
    science_link: "7 days of mindfulness reduces amygdala response.",
  },
  {
    id: 5,
    lifetime_days: 10,
    consecutive_days: 5,
    title: "The Universe Holds Your Hand",
    reward_copy: "Life hums in time with your nervous system.",
    science_link: "Sustained practice enhances safety perception.",
  },
  {
    id: 6,
    lifetime_days: 12,
    consecutive_days: 7,
    title: "Mind Like Water",
    reward_copy: "You ripple, not react.",
    science_link: "Vagal tone improves through daily stillness.",
  },
  {
    id: 7,
    lifetime_days: 15,
    consecutive_days: 10,
    title: "The Bloom Response",
    reward_copy: "You're photosynthesizing peace.",
    science_link: "Regular reflection increases serotonin & self-regulation.",
  },
  {
    id: 8,
    lifetime_days: 20,
    consecutive_days: 14,
    title: "Full System Sync",
    reward_copy: "Even Mondays feel manageable now.",
    science_link: "14+ days stabilizes mood & attention circuits.",
  },
  {
    id: 9,
    lifetime_days: 25,
    consecutive_days: 21,
    title: "Featherweight Mind",
    reward_copy: "Gravity's got nothing on your grace.",
    science_link: "Long-term practice lightens cognitive load.",
  },
  {
    id: 10,
    lifetime_days: 30,
    consecutive_days: 30,
    title: "Zen Central",
    reward_copy: "You live from center. Nothing to chase.",
    science_link: "30 days = habit loop solidified; stress reactivity down.",
  },
];

