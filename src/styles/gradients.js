// Semantic gradient system for magiwork feed screens
// Linear gradients: 180deg (top → bottom) with 4 color stops
// Source: feed_gradient.txt
// Colors: Mint=#94D1C4, Orange=#FFAF42, Purple=#BDB2CD

export const FEED_GRADIENTS = {
  slowMorning:          { dir: "180deg", stops: [["#94D1C4","0%"],["#FFAF42","30%"],["#FFAF42","70%"],["#BDB2CD","100%"]] },  // Mint → Orange → Orange → Purple
  gentleDeStress:       { dir: "180deg", stops: [["#BDB2CD","0%"],["#FFAF42","30%"],["#FFAF42","70%"],["#94D1C4","100%"]] },  // Purple → Orange → Orange → Mint
  takeAWalk:            { dir: "180deg", stops: [["#94D1C4","0%"],["#FFAF42","30%"],["#FFAF42","70%"],["#BDB2CD","100%"]] },  // Mint → Orange → Orange → Purple
  journalYourFeels:     { dir: "180deg", stops: [["#BDB2CD","0%"],["#94D1C4","30%"],["#94D1C4","70%"],["#FFAF42","100%"]] },  // Purple → Mint → Mint → Orange
  moveAndCool:          { dir: "180deg", stops: [["#FFAF42","0%"],["#94D1C4","30%"],["#94D1C4","70%"],["#BDB2CD","100%"]] },  // Orange → Mint → Mint → Purple
  drawToGround:         { dir: "180deg", stops: [["#BDB2CD","0%"],["#94D1C4","30%"],["#94D1C4","70%"],["#FFAF42","100%"]] },  // Purple → Mint → Mint → Orange
  breatheToRelax:       { dir: "180deg", stops: [["#FFAF42","0%"],["#BDB2CD","30%"],["#BDB2CD","70%"],["#94D1C4","100%"]] },  // Orange → Purple → Purple → Mint
  breatheToGetActive:   { dir: "180deg", stops: [["#94D1C4","0%"],["#BDB2CD","30%"],["#BDB2CD","70%"],["#FFAF42","100%"]] },  // Mint → Purple → Purple → Orange
  driftIntoSleep:       { dir: "180deg", stops: [["#FFAF42","0%"],["#BDB2CD","30%"],["#BDB2CD","70%"],["#94D1C4","100%"]] },  // Orange → Purple → Purple → Mint
};

/**
 * Generate CSS background string for a gradient
 * @param {keyof FEED_GRADIENTS} key - The gradient key
 * @returns {{ background: string }} Style object
 */
export const gradientStyle = (key) => {
  const g = FEED_GRADIENTS[key] || FEED_GRADIENTS.slowMorning; // fallback
  const stops = g.stops.map(([c, p]) => `${c} ${p}`).join(", ");
  return { background: `linear-gradient(${g.dir}, ${stops})` };
};

