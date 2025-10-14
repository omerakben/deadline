# Demo Login Race Condition Analysis

## Issue Summary
After adding real Firebase credentials, the demo login authenticates successfully but the user gets signed out immediately due to a race condition.

## Timeline of Events

```
1. User clicks "Launch Demo" button
2. POST /api/v1/auth/demo/login/ → 200 OK (custom_token received)  ✅
3. signInWithCustomToken(auth, custom_token) → Success             ✅
4. Firebase: POST /accounts:signInWithCustomToken → 200 OK          ✅
5. Firebase: POST /accounts:lookup → 200 OK                         ✅
6. onAuthStateChanged fires: "User: demo_user_deadline_2025"        ✅
7. React sets user state, sets loading = false
8. login page useEffect triggers redirect to /dashboard
9. Dashboard page loads, WorkspaceProvider mounts
10. WorkspaceProvider useEffect fires fetchWorkspaces()
11. listWorkspaces() calls http.get("/workspaces/")
12. Axios interceptor calls getIdToken()
13. getIdToken() checks: user = null ❌ (stale state!)
14. Returns null, no Authorization header added
15. Backend returns 403 Forbidden
16. 403 handler tries to refresh token, but user still null
17. 403 handler calls signOut()
18. User redirected back to /login
```

## Root Cause

**React State Update Batching + Timing**

When Firebase's `onAuthStateChanged` callback fires:
1. It calls `setUser(u)` and `setLoading(false)`
2. React batches these state updates
3. React schedules a re-render
4. But BEFORE the re-render completes, the redirect useEffect fires
5. Dashboard loads and WorkspaceProvider tries to fetch data
6. The `getIdToken` callback still closes over the OLD state where `user = null`

## Solutions Attempted

### ❌ Solution 1: Add delay after signInWithCustomToken
```typescript
await getIdToken(userCredential.user, true);
await new Promise(resolve => setTimeout(resolve, 500));
```
**Result:** Still fails. The delay happens before redirect, but the race condition occurs AFTER redirect when dashboard loads.

### ❌ Solution 2: Add retry logic in getTokenCached
```typescript
// Retry 3 times with exponential backoff
while (retries < maxRetries) {
  token = await getIdToken(user, shouldForceRefresh);
  if (token) break;
  await new Promise(resolve => setTimeout(resolve, waitTime));
  retries++;
}
```
**Result:** Doesn't help because `user` is still null when the function is called.

## Recommended Solutions

### ✅ Option A: Add token readiness check in WorkspaceProvider
Wait for both `user` AND `getIdToken()` to return a token before fetching:

```typescript
const fetchWorkspaces = useCallback(async () => {
  if (!user) {
    setWorkspaces([]);
    setLoading(false);
    return;
  }

  // ADDITION: Verify token is available before making API calls
  const token = await getIdToken();
  if (!token) {
    console.log("Token not ready yet, skipping workspace fetch");
    return; // Token not ready, will retry when user state updates again
  }

  // ... rest of fetch logic
}, [user, getIdToken]);
```

### ✅ Option B: Add global auth ready flag
Add `tokenReady` state to AuthContext that only becomes true after first successful `getIdToken()`:

```typescript
const [tokenReady, setTokenReady] = useState(false);

const getTokenCached = useCallback(async (force = false) => {
  // ... existing logic
  if (token) {
    setTokenReady(true); // Mark as ready after first success
    lastTokenRef.current = { token, ts: now };
  }
  return token;
}, [user, configError]);
```

Then in WorkspaceProvider:
```typescript
const { user, loading: authLoading, tokenReady } = useAuth();

useEffect(() => {
  if (authLoading || !tokenReady) return; // Wait for token readiness
  fetchWorkspaces();
}, [fetchWorkspaces, authLoading, tokenReady]);
```

### ✅ Option C: Make getIdToken resilient to null user state
Modify `getTokenCached` to wait for user when called shortly after sign-in:

```typescript
const getTokenCached = useCallback(async (force = false) => {
  if (configError) return null;

  // NEW: If no user but we're not loading, wait a bit (might be mid-auth)
  if (!user && !loading) {
    let retries = 0;
    while (retries < 3 && !user) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    if (!user) {
      console.warn("Auth: Cannot get token - user not authenticated");
      return null;
    }
  }

  // ... rest of existing logic
}, [user, loading, configError]);
```

## Testing Plan

1. Clear browser cache/localStorage
2. Restart both servers
3. Open http://localhost:3000/login
4. Click "Launch Demo"
5. Verify:
   - ✅ Redirects to /dashboard
   - ✅ No 403 errors in console
   - ✅ Workspaces load successfully
   - ✅ User stays on dashboard (not signed out)

## Status

- [x] Firebase credentials updated (real, not fake)
- [x] Demo endpoint returns valid custom tokens
- [x] Firebase authentication succeeds
- [x] User reaches dashboard
- [ ] **BLOCKER:** User gets signed out due to race condition
- [ ] Workspaces load successfully
- [ ] Demo mode fully functional
