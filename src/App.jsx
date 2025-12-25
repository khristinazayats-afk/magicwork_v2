import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Auth & New Screens
import GreetingScreen from './components/screens/GreetingScreen';
import LoginScreen from './components/auth/LoginScreen';
import SignupScreen from './components/auth/SignupScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import ProfileSetupScreen from './components/screens/ProfileSetupScreen';
import WhatToExpectScreen from './components/screens/WhatToExpectScreen';
import AuthGuard from './components/auth/AuthGuard';
import AmbientSoundManager from './components/AmbientSoundManager';
import AppLayout from './components/AppLayout';
import ProfileScreen from './components/ProfileScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Check if we're in test mode via URL
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

  // Render test environments (Legacy logic)
  if (isTestMode) return <AnimationTest />;
  if (isShareoutsTest) return <ShareoutsTestSimple />;
  if (isBoomerangTest) return <BoomerangLab />;
  if (isRoadmap) return <AuraDemoPage />;
  if (isAuraProgression) return <AuraProgressionDemo />;
  if (isPracticeComplete) return <PracticeCompleteScreen />;
  if (isAuraRingDemo) return <AuraRingDemo />;
  if (isAuraGlowDemo) return <AuraGlowDemo />;
  if (isHomeScreen) return <div className="bg-[#fcf8f2] min-h-screen"><HomeScreen /></div>;
  if (isGardenStatesDemo) return <GardenStatesDemo />;
  if (isTreeGrowthDemo) return <TreeGrowthDemo />;
  if (isLottieTest) return <LottieTest />;
  if (isCanvaDemo) return <CanvaDesignsDemo />;
  if (isCanvaExamples) return <CanvaIntegrationExamples />;
  if (isVideoTest) return <SimpleVideoTest />;
  if (isVibeBadgesTest) return <VibeBadgesTest />;
  if (isContentAssetsTest) return <ContentAssetsTest />;
  if (isAllContentAssetsTest) return <AllContentAssetsTest />;

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <AmbientSoundManager />
      <Routes>
        <Route path="/" element={<Navigate to="/greeting" replace />} />
        <Route path="/greeting" element={<GreetingScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        
        {/* Protected Routes */}
        <Route path="/profile-setup" element={<AuthGuard><ProfileSetupScreen /></AuthGuard>} />
        <Route path="/what-to-expect" element={<AuthGuard><WhatToExpectScreen /></AuthGuard>} />
        <Route path="/feed" element={<AuthGuard><AppLayout><Feed onBack={() => {}} /></AppLayout></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><AppLayout><ProfileScreen onBack={() => window.history.back()} /></AppLayout></AuthGuard>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
