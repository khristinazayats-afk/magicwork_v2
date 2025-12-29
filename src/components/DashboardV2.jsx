import { Navigate } from 'react-router-dom';

/**
 * DashboardV2 - Redirects to FeedV2
 * 
 * DashboardV2 and FeedV2 serve the same purpose with the same design.
 * FeedV2 is the more feature-complete implementation with:
 * - ProgressStats component
 * - HomeScreenSummary (vibe system)
 * - Settings integration
 * - Profile integration
 * - PracticeCard integration for mobile
 * 
 * This redirect ensures consistency and avoids code duplication.
 */
export default function DashboardV2() {
  return <Navigate to="/feed-v2" replace />;
}
