"use client";

import { useAuth } from "@/contexts/AuthContext";
import { attachAuth } from "@/lib/api/http";
import { useEffect, useRef } from "react";

/**
 * Component that wires up HTTP client authentication with AuthContext
 * Should be mounted once under AuthProvider to initialize axios interceptors
 */
export function HttpAuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading, configError } = useAuth();
  const attachedRef = useRef(false);

  useEffect(() => {
    if (loading) return; // wait for auth init
    if (configError) return; // don't attach if config broken

    // Attach user to http client (or null when logged out)
    attachAuth(user);
    attachedRef.current = true;
  }, [user, loading, configError]);

  return <>{children}</>;
}
