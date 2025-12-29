import { useEffect, useState } from 'react';

export default function AdminAnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analytics-summary');
        if (!res.ok) throw new Error('Failed to load analytics summary');
        const data = await res.json();
        if (mounted) setSummary(data);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#fcf8f2]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-serif font-bold text-sage-800 mb-4">Analytics Dashboard</h1>
        <p className="text-sage-600 mb-6">Admin-only. Desktop-only. Aggregated practice analytics.</p>

        {loading && (
          <div className="p-4 rounded-xl bg-white border border-sage-100 text-sage-700">Loading…</div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">{error}</div>
        )}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-sage-100 p-6">
              <h2 className="text-sage-800 font-semibold mb-2">Streak</h2>
              <div className="text-3xl font-bold text-sage-900">{summary.streak ?? 0} days</div>
            </div>
            <div className="bg-white rounded-2xl border border-sage-100 p-6">
              <h2 className="text-sage-800 font-semibold mb-2">Last 7 Days</h2>
              <div className="text-3xl font-bold text-sage-900">{summary.last7PracticeCount ?? 0} sessions</div>
            </div>
            <div className="bg-white rounded-2xl border border-sage-100 p-6">
              <h2 className="text-sage-800 font-semibold mb-2">Avg Duration</h2>
              <div className="text-3xl font-bold text-sage-900">{summary.avgPracticeDurationSec ? Math.round(summary.avgPracticeDurationSec/60) : '-'} min</div>
            </div>

            <div className="bg-white rounded-2xl border border-sage-100 p-6 lg:col-span-2">
              <h2 className="text-sage-800 font-semibold mb-2">Top Spaces (30 days)</h2>
              <div className="space-y-2">
                {(summary.topSpaces || []).map(ts => (
                  <div key={ts.space} className="flex items-center justify-between">
                    <span className="text-sage-800">{ts.space}</span>
                    <span className="text-sage-600">{ts.count} visits • {ts.lastSeenDaysAgo ?? '-'} days ago</span>
                  </div>
                ))}
                {(summary.topSpaces || []).length === 0 && (
                  <div className="text-sage-600">No data yet</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-sage-100 p-6">
              <h2 className="text-sage-800 font-semibold mb-2">Preferred Time</h2>
              <div className="text-3xl font-bold text-sage-900 capitalize">{summary.timeOfDayPreference || '—'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
