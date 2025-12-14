/**
 * Example: How to use LottieAnimation component
 * 
 * This is an example file showing how to integrate Lottie animations
 * from Canva into your project.
 */

import LottieAnimation from './LottieAnimation';
// Import your Lottie JSON file (after downloading from Canva)
// import breathingAnimation from '../../assets/lottie/breathing-circle.json';

export default function ExampleLottieUsage({ isPlaying }) {
  // Example 1: Basic usage
  // return (
  //   <LottieAnimation 
  //     animationData={breathingAnimation}
  //     isActive={isPlaying}
  //     loop={true}
  //     speed={1}
  //     className="w-64 h-64"
  //   />
  // );

  // Example 2: With custom styling
  // return (
  //   <div className="flex items-center justify-center">
  //     <LottieAnimation 
  //       animationData={breathingAnimation}
  //       isActive={isPlaying}
  //       loop={true}
  //       speed={1.5} // 1.5x speed
  //       className="w-48 h-48"
  //       style={{ maxWidth: '100%' }}
  //     />
  //   </div>
  // );

  // Example 3: Replace existing framer-motion animation
  // Instead of:
  //   <CircleBreathing isActive={isPlaying} />
  // Use:
  //   <LottieAnimation 
  //     animationData={circleBreathingLottie}
  //     isActive={isPlaying}
  //     loop={true}
  //   />

  return (
    <div className="p-8">
      <p className="text-gray-600">
        Uncomment the examples above to see how to use LottieAnimation.
        <br />
        Make sure to:
        <br />
        1. Download Lottie JSON from Canva
        <br />
        2. Place it in src/assets/lottie/
        <br />
        3. Import it and pass to LottieAnimation component
      </p>
    </div>
  );
}










