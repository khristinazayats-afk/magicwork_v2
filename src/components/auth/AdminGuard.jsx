import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        // Block mobile viewports entirely
        const width = window.innerWidth || document.documentElement.clientWidth;
        if (width < 1024) {
          if (mounted) {
            setAllowed(false);
            setLoading(false);
          }
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) {
            setAllowed(false);
            setLoading(false);
          }
          return;
        }

        // Fetch profile to check role/is_admin flags
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('user_id', user.id)
          .maybeSingle();

        const isAdmin = Boolean(
          (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
          // optional fallback: allow certain email domains (customizable)
          (user.email && user.email.endsWith('@magicwork.app'))
        );

        if (mounted) {
          setAllowed(isAdmin);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setAllowed(false);
          setLoading(false);
        }
      }
    }
    check();
    return () => { mounted = false; };
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sage-700 text-sm">Checking access…</div>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/feed-v2" replace />;
  }

  return children;
}
