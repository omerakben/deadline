# DEADLINE Frontend MVP Critical Fixes

**Total Estimated Time: 4 hours**
**Goal: Ship production-ready user experience after these 3 critical fixes**

> **Context**: This checklist contains ONLY MVP-blocking UX issues. All other improvements (performance optimization, advanced error recovery, loading states) are deferred to Phase 2 post-user-validation. See `../capstone-server/claudedocs/code-analysis-ultrathink-2025.md` for full analysis.

---

## ✅ Critical Fix #1: User-Facing Auth Error Notifications (1.5 hours)

**Why Critical**: When authentication fails, users see cryptic 401/403 errors with no explanation. Silent auth failures create a confusing experience for day-1 users who can't tell if the app is broken or they need to re-login.

### Step 1.1: Add Toast Import to HTTP Client

**File**: `src/lib/api/http.ts`

**Action**: Add import at top of file:

```typescript
import { toast } from "@/components/ui/use-toast";
```

**Acceptance Criteria**:

- Import added without TypeScript errors
- Toast function available in http.ts scope

---

### Step 1.2: Add User Notification for Token Fetch Failures

**File**: `src/lib/api/http.ts`

**Action**: Replace the request interceptor (lines 27-45) with:

```typescript
/**
 * Request interceptor to add Firebase ID token to requests
 */
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (tokenProviderFn) {
      try {
        const token = await tokenProviderFn();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (!token) {
          // Token fetch returned null - user not authenticated
          console.warn("Auth token unavailable - user may need to sign in");

          // Show user-facing notification
          toast({
            title: "Authentication Required",
            description: "Please sign in to continue. Redirecting to login...",
            variant: "destructive",
          });

          // Redirect to login after brief delay
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);

          // Cancel the request
          return Promise.reject(new Error("Authentication required"));
        }
      } catch (error) {
        console.error("Failed to get auth token:", error);

        // Show user-facing notification for token fetch errors
        toast({
          title: "Authentication Error",
          description: "Failed to verify your credentials. Please sign in again.",
          variant: "destructive",
        });

        // Redirect to login after brief delay
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

        // Cancel the request - don't proceed without token
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

**Explanation**:

- Shows toast when token is null (user not authenticated)
- Shows toast when token fetch throws error
- Redirects to /login after 2 seconds (time to read message)
- Cancels API request (don't send without auth)

**Acceptance Criteria**:

- User sees "Authentication Required" toast when token is null
- User sees "Authentication Error" toast when token fetch fails
- Automatically redirects to /login after 2 seconds
- API request cancelled (doesn't proceed without token)

---

## ✅ Critical Fix #2: 401 Token Expiry Handling (1.5 hours)

**Why Critical**: When Firebase tokens expire (after 1 hour), users get 401 errors with no guidance. They don't know to refresh or re-login, creating frustration and abandoned sessions.

### Step 2.1: Add User Notification for 401 Responses

**File**: `src/lib/api/http.ts`

**Action**: Replace the response interceptor (lines 47-59) with:

```typescript
/**
 * Response interceptor for error handling
 */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors (expired/invalid token)
    if (error.response?.status === 401) {
      console.warn("Unauthorized request - token expired or invalid");

      // Show user-facing notification
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });

      // Clear any cached tokens in AuthContext
      // The AuthContext handles its own state, so we just redirect

      // Redirect to login after brief delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }

    // Handle network errors
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      toast({
        title: "Connection Error",
        description: "Unable to reach the server. Please check your internet connection.",
        variant: "destructive",
      });
    }

    // Handle 5xx server errors
    if (error.response?.status >= 500) {
      toast({
        title: "Server Error",
        description: "Something went wrong on our end. Please try again later.",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);
```

**Explanation**:

- Shows "Session Expired" toast on 401 errors
- Shows "Connection Error" toast on network failures
- Shows "Server Error" toast on 5xx responses
- Redirects to /login after 2 seconds for 401s
- Keeps error rejection for component-level handling

**Acceptance Criteria**:

- User sees "Session Expired" toast on 401 response
- User sees "Connection Error" toast on network failures
- User sees "Server Error" toast on 500+ responses
- Automatically redirects to /login after 2 seconds on 401
- Component-level error handlers still work (Promise.reject maintained)

---

### Step 2.2: Update AuthContext Token Error Handling

**File**: `src/contexts/AuthContext.tsx`

**Action**: Update the `getTokenCached` function's warning messages (lines 164-188) to be more actionable:

Replace lines 164-172:

```typescript
if (configError) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "Auth: Cannot get token due to config error:",
      configError
    );
  }
  return null;
}
```

With:

```typescript
if (configError) {
  console.error("Auth: Cannot get token due to config error:", configError);
  // Note: No toast here - config errors are already shown in UI via configError state
  return null;
}
```

Replace lines 174-179:

```typescript
if (!clientConfig) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Auth: Firebase config not loaded yet");
  }
  return null;
}
```

With:

```typescript
if (!clientConfig) {
  console.warn("Auth: Firebase config not loaded yet");
  return null;
}
```

Replace lines 183-188:

```typescript
if (!currentUser) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("Auth: Cannot get token - user not authenticated");
  }
  return null;
}
```

With:

```typescript
if (!currentUser) {
  // User not signed in - this is expected for public pages
  // No warning needed, just return null
  return null;
}
```

**Explanation**:

- Removes noisy development-only warnings
- Keeps error logging for actual errors (config failures)
- Clarifies that null for unauthenticated users is expected behavior
- Reduces console noise in production

**Acceptance Criteria**:

- Config errors still logged with console.error
- No warnings for expected "user not authenticated" state
- Cleaner console output in both dev and production

---

## ✅ Critical Fix #3: Search Error User Feedback (1 hour)

**Why Critical**: When global search fails (network error, server error, auth expiry), users see no feedback. Search just returns empty results silently, making users think "no matches found" when actually the request failed.

### Step 3.1: Add Error Handling to Search Catch Block

**File**: `src/app/dashboard/page.tsx`

**Action**: Replace the search effect catch block (lines 92-98) with:

```typescript
try {
  setSearchLoading(true);
  const { results } = await searchArtifactsGlobal({ q: debouncedSearch });
  setSearchResults(results);
} catch (error) {
  console.error("Global search failed:", error);

  // Show user-facing notification
  toast({
    title: "Search Failed",
    description: "Unable to complete search. Please try again.",
    variant: "destructive",
  });

  // Keep empty results (don't show stale data)
  setSearchResults([]);
} finally {
  setSearchLoading(false);
}
```

**Explanation**:

- Logs error for debugging
- Shows toast to inform user search failed
- Clears results (avoid showing stale data)
- User understands failure vs. "no results"

**Acceptance Criteria**:

- User sees "Search Failed" toast when search API errors
- Search results cleared on error (no stale data)
- Console error logged for debugging
- Loading state properly cleared in finally block

---

## 🚀 Final MVP Validation Checklist

Before shipping, verify:

- [ ] **Auth Error Notifications Work**:
  - [ ] Trigger token failure → See "Authentication Required" toast → Redirect to /login
  - [ ] Make API call with expired token → See "Session Expired" toast → Redirect to /login
  - [ ] Disconnect internet → Make API call → See "Connection Error" toast
  - [ ] No silent failures in browser console

- [ ] **401 Handling Works**:
  - [ ] Wait for token to expire (1 hour) → Make API call → See toast + redirect
  - [ ] Clear token manually → Make API call → See appropriate error
  - [ ] Verify redirect goes to /login with proper cleanup

- [ ] **Search Error Feedback Works**:
  - [ ] Stop backend server → Search on dashboard → See "Search Failed" toast
  - [ ] Start backend → Search works normally
  - [ ] Empty search query → No error (expected behavior)

- [ ] **No Breaking Changes**:
  - [ ] Login/signup flow still works
  - [ ] Dashboard loads properly
  - [ ] Workspace operations function normally
  - [ ] All existing toast notifications still work

- [ ] **User Experience Quality**:
  - [ ] Toast messages clear and actionable
  - [ ] 2-second delay before redirects feels right (not too fast, not too slow)
  - [ ] No toast spam (multiple rapid errors don't flood screen)
  - [ ] Console errors help developers debug (not too noisy)

---

## 🧪 Manual Testing Script

**Test 1: Auth Token Failure**

```bash
# In browser DevTools console:
localStorage.clear()  # Clear any cached tokens
# Then try to access dashboard
# Expected: "Authentication Required" toast → redirect to /login
```

**Test 2: Token Expiry (401)**

```bash
# Option A: Wait 1 hour after login, then use app
# Option B: Manually expire token via Firebase Console
# Then make any API call (create workspace, search, etc.)
# Expected: "Session Expired" toast → redirect to /login
```

**Test 3: Search Failure**

```bash
# Stop Django backend:
cd ../capstone-server
# Press Ctrl+C to stop server

# In browser:
# Navigate to dashboard, enter search query
# Expected: "Search Failed" toast, empty results
```

**Test 4: Network Error**

```bash
# In browser DevTools → Network tab:
# Enable "Offline" throttling
# Try any API operation
# Expected: "Connection Error" toast
```

**Test 5: Server Error (5xx)**

```bash
# Temporarily break backend API to return 500:
# Edit views.py to: raise Exception("Test error")
# Make API call
# Expected: "Server Error" toast
```

---

## 📝 Post-Implementation Notes

**What's Deferred to Phase 2** (after user validation):

- Token refresh automation (retry 401 with force refresh before redirecting)
- Advanced error recovery (exponential backoff, retry logic)
- Loading state refinements (skeleton screens, progressive loading)
- Toast queuing system (prevent spam when multiple requests fail)
- Offline mode detection and graceful degradation
- Performance monitoring (error rates, response times)
- Sentry/error tracking integration

**Why These Fixes Are MVP-Critical**:

1. **User Trust**: Silent failures erode trust ("Is this app even working?")
2. **User Guidance**: Clear error messages help users self-recover (re-login vs. check internet)
3. **Support Reduction**: Users understand what went wrong, don't immediately contact support
4. **Professional Polish**: Error handling is the difference between "beta" and "production-ready"

**Integration with Backend TODO**:

- Backend: Rate limiting + audit logging (security/compliance)
- Frontend: Error notifications + auth handling (user experience)
- Together: Complete MVP-ready application for day-1 users

---

## 🎯 Success Criteria

**All 3 Fixes Implemented**:

- ✅ Users never see silent auth failures
- ✅ Users always know when/why they need to re-login
- ✅ Users understand when search/API operations fail

**Testing Complete**:

- ✅ Manual test script executed successfully
- ✅ No regressions in existing functionality
- ✅ Toast messages clear and helpful

**Ready to Ship**:

- ✅ No MVP-blocking UX issues remain
- ✅ Error handling meets professional standards
- ✅ User experience ready for public showcase

---

**Estimated Total Time**: 4 hours (1.5h auth notifications + 1.5h 401 handling + 1h search feedback)

**Success Criteria**: All critical UX issues resolved, comprehensive error notifications, ready for MVP launch.
