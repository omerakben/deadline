"use client";
import {
  ConfigFetchError,
  fetchClientConfig,
  FirebaseClientConfig,
} from "@/lib/api/config";
import { getFirebaseAuth } from "@/lib/firebase/client";
import {
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  getIdToken,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from "firebase/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configError: string | null;
  missingEnv: string[];
  signIn(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signUp(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  getIdToken(force?: boolean): Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [configError, setConfigError] = useState<string | null>(null);
  const [missingEnv, setMissingEnv] = useState<string[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientConfig, setClientConfig] = useState<FirebaseClientConfig | null>(
    null
  );
  const lastTokenRef = useRef<{ token: string; ts: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const { firebase } = await fetchClientConfig();
        if (!cancelled) {
          setClientConfig(firebase);
          setMissingEnv([]);
        }
      } catch (error: unknown) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load authentication configuration.";
        if (error instanceof ConfigFetchError) {
          setMissingEnv(error.missing);
        }
        setConfigError(message);
        setLoading(false);
      }
    };

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (configError) {
      setLoading(false);
      return;
    }

    if (!clientConfig) {
      return;
    }

    let unsub: (() => void) | null = null;
    try {
      const auth = getFirebaseAuth(clientConfig);
      unsub = onAuthStateChanged(auth, (u) => {
        if (process.env.NODE_ENV !== "production") {
          console.debug(
            "Auth state changed:",
            u ? `User: ${u.uid}` : "User signed out"
          );
        }
        setUser(u);
        setLoading(false);
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initialize authentication";
      setConfigError(message);
      setLoading(false);
    }

    return () => {
      if (unsub) unsub();
    };
  }, [clientConfig, configError]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (configError) throw new Error(configError);
      const auth = getFirebaseAuth(clientConfig || undefined);
      await signInWithEmailAndPassword(auth, email, password);
    },
    [configError, clientConfig]
  );

  const signInWithGoogle = useCallback(async () => {
    if (configError) throw new Error(configError);
    const auth = getFirebaseAuth(clientConfig || undefined);
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    await signInWithPopup(auth, provider);
  }, [configError, clientConfig]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (configError) throw new Error(configError);
      const auth = getFirebaseAuth(clientConfig || undefined);
      await createUserWithEmailAndPassword(auth, email, password);
    },
    [configError, clientConfig]
  );

  const signOut = useCallback(async () => {
    lastTokenRef.current = null;
    if (configError) return; // nothing to sign out
    const auth = getFirebaseAuth(clientConfig || undefined);
    await fbSignOut(auth);
  }, [configError, clientConfig]);

  // Track current user in a ref so we can access latest value in callbacks
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getTokenCached = useCallback(
    async (force = false) => {
      if (configError) {
        console.error("Auth: Cannot get token due to config error:", configError);
        // Note: No toast here - config errors are already shown in UI via configError state
        return null;
      }

      if (!clientConfig) {
        console.warn("Auth: Firebase config not loaded yet");
        return null;
      }

      // Get current user - no waiting or retries needed
      const currentUser = userRef.current;
      if (!currentUser) {
        // User not signed in - this is expected for public pages
        // No warning needed, just return null
        return null;
      }

      const now = Date.now();

      // Use cached token if available and fresh (5 minutes cache)
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      if (
        !force &&
        lastTokenRef.current &&
        now - lastTokenRef.current.ts < CACHE_DURATION
      ) {
        if (process.env.NODE_ENV !== "production") {
          console.debug("Auth: Using cached token");
        }
        return lastTokenRef.current.token;
      }

      try {
        if (process.env.NODE_ENV !== "production") {
          console.debug("Auth: Fetching fresh token, force=", force);
        }

        // Get ID token from Firebase (force refresh if requested)
        const token = await getIdToken(currentUser, force);

        if (token) {
          lastTokenRef.current = { token, ts: now };
          if (process.env.NODE_ENV !== "production") {
            console.debug("Auth: Successfully obtained token");
          }
          return token;
        } else {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Auth: getIdToken returned null");
          }
          return null;
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to get Firebase token:", error);
        }
        // Clear cache on error
        lastTokenRef.current = null;
        return null;
      }
    },
    [configError, clientConfig]
  );

  const value: AuthContextValue = {
    user,
    loading,
    configError,
    missingEnv,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    getIdToken: getTokenCached,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
