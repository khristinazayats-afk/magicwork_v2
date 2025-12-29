import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import ProtectedFeedRoute from './components/ProtectedFeedRoute';
import FeedV2 from './components/FeedV2';
import DashboardV2 from './components/DashboardV2';
import LoginV2 from './components/auth/LoginV2';
import LandingV2 from './components/LandingV2';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on root path
    return location.pathname === '/';
  });

  // Redirect /greeting to /login immediately
  useEffect(() => {
    if (location.pathname === '/greeting') {
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

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

  // Handle splash screen dismissal
  const handleSplashEnter = () => {
    setShowSplash(false);
    navigate('/login', { replace: true });
  };

  if (showSplash) {
    return <SplashScreen onEnter={handleSplashEnter} />;
  }

  return (
    <>
      <AmbientSoundManager />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/greeting" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        
        {/* V2 Routes - New Design */}
        <Route path="/landing-v2" element={<LandingV2 />} />
        <Route path="/login-v2" element={<LoginV2 />} />
        <Route path="/feed-v2" element={<AuthGuard><FeedV2 /></AuthGuard>} />
        <Route path="/dashboard-v2" element={<AuthGuard><DashboardV2 /></AuthGuard>} />
        
        {/* Protected Routes */}
        <Route path="/profile-setup" element={<AuthGuard><ProfileSetupScreen /></AuthGuard>} />
        <Route path="/what-to-expect" element={<AuthGuard><WhatToExpectScreen /></AuthGuard>} />
        <Route path="/feed" element={<ProtectedFeedRoute />} />
        <Route path="/profile" element={<AuthGuard><AppLayout><ProfileScreen onBack={() => window.history.back()} /></AppLayout></AuthGuard>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/feed" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
