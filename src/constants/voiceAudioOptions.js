/**
 * Voice Audio Options
 * Different voice/audio selections users can choose for their practice
 * Each option has a name, description, and audio file reference
 */

export const VOICE_AUDIO_OPTIONS = [
  {
    id: 'gentle-female',
    name: 'Gentle Guide',
    description: 'Soft, calming female voice',
    type: 'guided',
    icon: '🌙'
  },
  {
    id: 'warm-male',
    name: 'Warm Presence',
    description: 'Deep, reassuring male voice',
    type: 'guided',
    icon: '🌊'
  },
  {
    id: 'neutral-calm',
    name: 'Calm Voice',
    description: 'Neutral, peaceful guidance',
    type: 'guided',
    icon: '✨'
  },
  {
    id: 'ambient-only',
    name: 'Ambient Only',
    description: 'No voice, just sounds',
    type: 'ambient',
    icon: '🎵'
  },
  {
    id: 'nature-sounds',
    name: 'Nature Sounds',
    description: 'Forest, ocean, rain',
    type: 'ambient',
    icon: '🌲'
  },
  {
    id: 'meditation-bells',
    name: 'Meditation Bells',
    description: 'Gentle bell tones',
    type: 'ambient',
    icon: '🔔'
  }
];

/**
 * Get voice audio option by ID
 */
export function getVoiceAudioOption(id) {
  return VOICE_AUDIO_OPTIONS.find(option => option.id === id) || VOICE_AUDIO_OPTIONS[0];
}

/**
 * Get default voice audio option
 */
export function getDefaultVoiceAudio() {
  return VOICE_AUDIO_OPTIONS[0];
}

