import { lazy, Suspense } from 'react';

// Lazy load Feed to avoid Safari initialization issues
const Feed = lazy(() => import('./Feed'));

export default function FeedWrapper({ onBack }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcf8f2] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1e2d2e]/10 border-t-[#1e2d2e] rounded-full animate-spin" />
      </div>
    }>
      <Feed onBack={onBack} />
    </Suspense>
  );
}

