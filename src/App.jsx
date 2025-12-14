import { useState, useEffect, lazy, Suspense } from 'react';
import SplashScreen from './components/SplashScreen';
import StepsScreen from './components/StepsScreen';
import Feed from './components/Feed';
import AnimationTest from './components/AnimationTest';
import ShareoutsTestSimple from './components/ShareoutsTestSimple';
import BoomerangLab from './components/animations/BoomerangLab';
import AuraDemoPage from './components/AuraDemoPage';
import AuraProgressionDemo from './components/AuraProgressionDemo';
import PracticeCompleteScreen from './components/PracticeCompleteScreen';
import AuraRingDemo from './components/AuraRingDemo';
import AuraGlowDemo from './components/AuraGlowDemo';
import HomeScreen from './components/HomeScreen';
import GardenStatesDemo from './components/GardenStatesDemo';
import TreeGrowthDemo from './components/TreeGrowthDemo';
import LottieTest from './components/LottieTest';
import CanvaDesignsDemo from './components/CanvaDesignsDemo';
import CanvaIntegrationExamples from './components/canva/CanvaIntegrationExamples';
import SimpleVideoTest from './components/SimpleVideoTest';
import VibeBadgesTest from './components/VibeBadgesTest';
import ContentAssetsTest from './components/ContentAssetsTest';
import AllContentAssetsTest from './components/AllContentAssetsTest';
import { useAmbientSound } from './contexts/AmbientSoundContext';

// Lazy load Feed to avoid loading Tone.js before user interaction
// const Feed = lazy(() => import('./components/Feed'));

// Development-only logging helper
const isDev = import.meta.env.DEV;
const devLog = isDev ? console.log.bind(console) : () => {};

function App() {
  devLog('[App] Component rendering');
  const [started, setStarted] = useState(false);
  const [sawSteps, setSawSteps] = useState(false);
  const { startAmbient, setAmbientMode } = useAmbientSound();
  
  useEffect(() => {
    devLog('[App] State changed:', { started, sawSteps });
  }, [started, sawSteps]);
  
  // Check if we're in test mode via URL (accepts both singular and plural)
  const isTestMode = window.location.search.includes('test=animation');
  const isShareoutsTest = window.location.search.includes('test=shareouts');
  const isBoomerangTest = window.location.search.includes('test=boomerang');
  const isRoadmap = window.location.search.includes('test=roadmap');
  const isAuraProgression = window.location.search.includes('test=aura-progression');
  const isPracticeComplete = window.location.search.includes('test=practice-complete');
  const isAuraRingDemo = window.location.search.includes('test=aura-ring');
  const isAuraGlowDemo = window.location.search.includes('test=aura-glow');
  const isHomeScreen = window.location.search.includes('test=homescreen');
  const isGardenStatesDemo = window.location.search.includes('test=garden-states');
  const isTreeGrowthDemo = window.location.search.includes('test=tree-growth');
  const isLottieTest = window.location.search.includes('test=lottie');
  const isCanvaDemo = window.location.search.includes('test=canva');
  const isCanvaExamples = window.location.search.includes('test=canva-examples');
  const isVideoTest = window.location.search.includes('test=video');
  const isVibeBadgesTest = window.location.search.includes('test=vibe-badges');
  const isContentAssetsTest = window.location.search.includes('test=content-assets');
  const isAllContentAssetsTest = window.location.search.includes('test=all-content-assets');
  
  // Debug: log URL check
  if (isGardenStatesDemo) {
    devLog('🌱 Garden States Demo detected in URL');
  }

  const handleStart = () => {
    // Start the calming background bowls loop once we have a user interaction.
    setAmbientMode('menu');
    startAmbient('menu');
    setStarted(true);
  };

  const handleBackToSplash = () => {
    setStarted(false);
    setSawSteps(false);
  };

  const handleBackToSteps = () => {
    setSawSteps(false);
  };

  // Render test environment
  if (isTestMode) {
    return <AnimationTest />;
  }

  // Render shareouts test environment
  if (isShareoutsTest) {
    return <ShareoutsTestSimple />;
  }

  // Render boomerang lab
  if (isBoomerangTest) {
    return <BoomerangLab />;
  }

  // Render aura demo
  if (isRoadmap) {
    return <AuraDemoPage />;
  }

  // Render aura progression demo
  if (isAuraProgression) {
    return <AuraProgressionDemo />;
  }

  // Render practice complete screen
  if (isPracticeComplete) {
    return <PracticeCompleteScreen />;
  }

  // Render aura ring demo
  if (isAuraRingDemo) {
    return <AuraRingDemo />;
  }

  // Render aura glow demo
  if (isAuraGlowDemo) {
    return <AuraGlowDemo />;
  }

  // Render HomeScreen test
  if (isHomeScreen) {
    return (
      <div className="w-full h-screen bg-[#fcf8f2] overflow-y-auto">
        <HomeScreen onExplore={() => {
          devLog('Explore clicked');
        }} />
      </div>
    );
  }

  // Render Garden States Demo - must be checked before other state checks
  if (isGardenStatesDemo) {
    return <GardenStatesDemo />;
  }

  // Render Tree Growth Demo
  if (isTreeGrowthDemo) {
    return <TreeGrowthDemo />;
  }

  // Render Lottie Test
  if (isLottieTest) {
    return <LottieTest />;
  }

  // Render Canva Designs Demo
  if (isCanvaDemo) {
    return <CanvaDesignsDemo />;
  }

  // Render Canva Integration Examples
  if (isCanvaExamples) {
    return <CanvaIntegrationExamples />;
  }

  // Render Video Test
  if (isVideoTest) {
    return <SimpleVideoTest />;
  }

  // Render Vibe Badges Test
  if (isVibeBadgesTest) {
    return <VibeBadgesTest />;
  }

  // Render Content Assets Test
  if (isContentAssetsTest) {
    return <ContentAssetsTest />;
  }

  // Render All Content Assets Test
  if (isAllContentAssetsTest) {
    return <AllContentAssetsTest />;
  }

  if (!started) {
    return <SplashScreen onEnter={handleStart} />;
  }

  if (!sawSteps) {
    return <StepsScreen onContinue={() => setSawSteps(true)} onBack={handleBackToSplash} />;
  }

  devLog('App: Rendering Feed directly (no Suspense)');
  
  return <Feed onBack={handleBackToSteps} />;
}

export default App;
