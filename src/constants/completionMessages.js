/**
 * Completion Messages
 * Rotating encouraging messages shown when user finishes a practice session
 * Each message is custom and different every time
 */

export const COMPLETION_MESSAGES = [
  "You showed up for yourself today. That matters.",
  "Every moment of presence is a gift. You just gave yourself one.",
  "You took time to breathe. Your body thanks you.",
  "In stillness, you found strength. Well done.",
  "You created space for peace. That's powerful.",
  "Your mind is clearer now. Notice the difference.",
  "You chose calm over chaos. Beautiful choice.",
  "This moment of rest will ripple through your day.",
  "You honored your need for stillness. That's self-care.",
  "Your breath just reset your entire system. Feel it.",
  "You gave yourself permission to pause. That's wisdom.",
  "In these minutes, you reconnected with yourself.",
  "You created calm. That's a superpower.",
  "Your nervous system just got a reset. Notice the shift.",
  "You chose presence. That's the foundation of everything.",
  "This practice is a gift you gave yourself. Receive it.",
  "You slowed down when the world speeds up. That's courage.",
  "Your body is more relaxed now. Trust that feeling.",
  "You made space for peace. That space is yours.",
  "Every breath you took was a step toward balance.",
  "You showed up. That's enough. That's everything.",
  "In stillness, you found what you needed.",
  "You created a moment of calm. That moment matters.",
  "Your mind is quieter now. Let that quiet settle in.",
  "You took time to be present. That's a radical act.",
  "You gave yourself permission to rest. That's healing.",
  "This practice is a seed. It will grow in you.",
  "You chose yourself. That's the most important choice.",
  "Your breath just rewired your stress response. Feel it.",
  "You created peace. That peace is real."
];

/**
 * Get a random completion message
 * Optionally exclude recently shown messages
 */
export function getRandomCompletionMessage(excludeRecent = []) {
  const available = COMPLETION_MESSAGES.filter(msg => !excludeRecent.includes(msg));
  const messages = available.length > 0 ? available : COMPLETION_MESSAGES;
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a completion message based on duration
 * Longer practices get more specific messages
 */
export function getCompletionMessageByDuration(durationSeconds) {
  const minutes = Math.floor(durationSeconds / 60);
  
  if (minutes >= 20) {
    const longMessages = [
      "You committed to a deep practice. That dedication shows.",
      "Twenty minutes of presence. You've created real change.",
      "You gave yourself extended time to reset. That's powerful.",
      "This longer practice will stay with you all day."
    ];
    return longMessages[Math.floor(Math.random() * longMessages.length)];
  }
  
  if (minutes >= 10) {
    const mediumMessages = [
      "Ten minutes of presence. You've reset your entire system.",
      "You took meaningful time for yourself. That matters.",
      "This practice will carry you through your day.",
      "You created real space for calm. Feel it."
    ];
    return mediumMessages[Math.floor(Math.random() * mediumMessages.length)];
  }
  
  // Short practice - use general messages
  return getRandomCompletionMessage();
}

