import { useEffect, useRef } from 'react';
import Lottie from 'lottie-react';

/**
 * Reusable Lottie Animation Component
 * 
 * Usage:
 * ```jsx
 * import LottieAnimation from './animations/LottieAnimation';
 * import animationData from '../../assets/lottie/my-animation.json';
 * 
 * <LottieAnimation 
 *   animationData={animationData}
 *   isActive={isPlaying}
 *   loop={true}
 *   speed={1}
 *   className="w-64 h-64"
 * />
 * ```
 * 
 * @param {Object} animationData - The Lottie JSON animation data
 * @param {boolean} isActive - Whether the animation should play
 * @param {boolean} loop - Whether to loop the animation
 * @param {number} speed - Animation speed (1 = normal, 2 = 2x, 0.5 = half speed)
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Inline styles
 */
export default function LottieAnimation({ 
  animationData, 
  isActive = true, 
  loop = true, 
  speed = 1,
  className = '',
  style = {}
}) {
  const lottieRef = useRef(null);

  // Control playback based on isActive
  useEffect(() => {
    if (!lottieRef.current) return;

    if (isActive) {
      lottieRef.current.play();
    } else {
      lottieRef.current.pause();
    }
  }, [isActive]);

  // Update speed when it changes
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  if (!animationData) {
    return null;
  }

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={isActive}
      className={className}
      style={style}
    />
  );
}

