"use client";
import { validatePublicEnv } from "@/lib/env";
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
  // Env validation first
  const missingEnv = validatePublicEnv();
  const [configError, setConfigError] = useState<string | null>(
    missingEnv.length
      ? `Missing required public env vars: ${missingEnv.join(", ")}`
      : null
  );

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastTokenRef = useRef<{ token: string; ts: number } | null>(null);

  useEffect(() => {
    if (configError) {
      // Skip Firebase initialization entirely
      setLoading(false);
      return;
    }
    let unsub: (() => void) | null = null;
    try {
      const auth = getFirebaseAuth();
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
    } catch (e: unknown) {
      const msg =
        typeof e === "object" && e && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Failed to initialize authentication";
      setConfigError(msg);
      setLoading(false);
    }
    return () => {
      if (unsub) unsub();
    };
  }, [configError]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (configError) throw new Error(configError);
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
    },
    [configError]
  );

  const signInWithGoogle = useCallback(async () => {
    if (configError) throw new Error(configError);
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    await signInWithPopup(auth, provider);
  }, [configError]);

  const signUp = useCallback(
    async (email: string, password: string) => {
      if (configError) throw new Error(configError);
      const auth = getFirebaseAuth();
      await createUserWithEmailAndPassword(auth, email, password);
    },
    [configError]
  );

  const signOut = useCallback(async () => {
    lastTokenRef.current = null;
    if (configError) return; // nothing to sign out
    const auth = getFirebaseAuth();
    await fbSignOut(auth);
  }, [configError]);

  // Track current user in a ref so we can access latest value in callbacks
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getTokenCached = useCallback(
    async (force = false) => {
      if (configError) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "Auth: Cannot get token due to config error:",
            configError
          );
        }
        return null;
      }

      // Special handling: if we're not loading but user is null,
      // wait briefly in case we're in the middle of auth state update
      // This prevents race conditions during sign-in
      let currentUser = userRef.current;
      if (!currentUser && !loading) {
        // Wait up to 1 second for user state to populate
        const startTime = Date.now();
        const maxWait = 1000;

        while (!userRef.current && Date.now() - startTime < maxWait) {
          if (process.env.NODE_ENV !== "production") {
            console.debug("Auth: Waiting for user state to update...");
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        currentUser = userRef.current;
      }

      // After waiting, check again
      if (!currentUser) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Auth: Cannot get token - user not authenticated");
        }
        return null;
      }
      const now = Date.now();

      // Reduce cache time to 30 seconds to be more aggressive about refresh
      if (
        !force &&
        lastTokenRef.current &&
        now - lastTokenRef.current.ts < 30_000
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
        // Always force refresh if cache is expired or force is requested
        const shouldForceRefresh =
          force ||
          !lastTokenRef.current ||
          now - lastTokenRef.current.ts > 50_000;

        // Retry logic for custom token sign-in (token might not be immediately available)
        let token: string | null = null;
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
          token = await getIdToken(currentUser, shouldForceRefresh);
          if (token) {
            break; // Success!
          }

          // Token not available yet, wait and retry
          if (retries < maxRetries - 1) {
            const waitTime = Math.min(200 * Math.pow(2, retries), 1000); // 200ms, 400ms, 800ms
            if (process.env.NODE_ENV !== "production") {
              console.debug(
                `Auth: Token not ready, retrying in ${waitTime}ms... (attempt ${
                  retries + 1
                }/${maxRetries})`
              );
            }
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
          retries++;
        }

        if (token) {
          lastTokenRef.current = { token, ts: now };
          if (process.env.NODE_ENV !== "production") {
            console.debug("Auth: Successfully obtained token");
          }
        } else {
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              "Auth: Failed to obtain token after retries - getIdToken returned null"
            );
          }
        }
        return token;
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to get Firebase token:", error);
        }
        // Clear cache on error
        lastTokenRef.current = null;
        return null;
      }
    },
    [loading, configError]
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
