import { FirebaseApp, initializeApp, getApps, getApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Singleton Firebase app instance
let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

/**
 * Initialize Firebase app with configuration
 * Returns existing instance if already initialized
 */
export function initializeFirebase(config: FirebaseClientConfig): FirebaseApp {
  // Return existing app if already initialized
  if (firebaseApp) {
    return firebaseApp;
  }

  // Check if Firebase is already initialized (e.g., by another module)
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseApp = existingApps[0];
    return firebaseApp;
  }

  // Initialize new Firebase app
  try {
    firebaseApp = initializeApp(config);
    return firebaseApp;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw error;
  }
}

/**
 * Get Firebase Auth instance
 * Initializes Firebase with provided config if not already initialized
 */
export function getFirebaseAuth(config?: FirebaseClientConfig): Auth {
  // Return existing auth instance if available
  if (firebaseAuth) {
    return firebaseAuth;
  }

  // Get or initialize Firebase app
  let app: FirebaseApp;

  if (config) {
    app = initializeFirebase(config);
  } else {
    // Try to get existing app
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      throw new Error(
        "Firebase not initialized. Call initializeFirebase() with config first or provide config to getFirebaseAuth()"
      );
    }
  }

  // Get and cache auth instance
  firebaseAuth = getAuth(app);
  return firebaseAuth;
}

/**
 * Reset Firebase instances (useful for testing)
 */
export function resetFirebase() {
  firebaseApp = null;
  firebaseAuth = null;
}
