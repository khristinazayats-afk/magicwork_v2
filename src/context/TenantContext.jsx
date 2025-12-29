import { createContext, useContext, useMemo } from 'react';

const TenantContext = createContext({ tenant: 'default' });

export function TenantProvider({ children }) {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const parts = host.split('.');
  const subdomain = parts.length > 2 ? parts[0] : null;
  const envDefault = import.meta?.env?.VITE_DEFAULT_TENANT || 'default';
  const tenant = subdomain && subdomain !== 'www' ? subdomain : envDefault;

  const value = useMemo(() => ({ tenant }), [tenant]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext);
}
