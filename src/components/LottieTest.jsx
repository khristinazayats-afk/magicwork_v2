import { useRef, useEffect } from 'react';
import Lottie from 'lottie-react';
// import lottieData from '../assets/lottie/test-lottie.json'; // File not found - commented out
const lottieData = null; // Placeholder until file is added

function LottieTest() {
  const lottieRef = useRef(null);

  useEffect(() => {
    // Optional: Control the animation
    if (lottieRef.current) {
      // You can control playback here if needed
      // lottieRef.current.play();
      // lottieRef.current.pause();
      // lottieRef.current.setSpeed(1.5);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
          Lottie Animation Test
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Testing the downloaded Lottie animation file
        </p>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center">
          {lottieData ? (
            <div className="w-full max-w-md">
              <Lottie
                lottieRef={lottieRef}
                animationData={lottieData}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Lottie animation file not found.</p>
              <p className="text-sm mt-2">Add test-lottie.json to src/assets/lottie/ to test animations.</p>
            </div>
          )}
        </div>

        {lottieData && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Animation dimensions: {lottieData.w} × {lottieData.h}px
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Frame rate: {lottieData.fr} fps | Duration: {lottieData.op} frames
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LottieTest;

