# 🎯 DEADLINE - Technical Debt & Improvement Tasks

**Generated**: October 18, 2025  
**Last Updated**: October 19, 2025  
**Status**: Active Backlog  
**Priority System**: P0 (Critical) → P1 (High) → P2 (Medium) → P3 (Low)

---

## 📋 Executive Summary

This document serves as the **single source of truth** for all technical debt, improvements, and enhancement tasks for the DEADLINE project. It is designed to help developers, stakeholders, and contributors understand what needs to be done, why it matters, and how to achieve excellence in delivery.

**Key Objectives:**
- 🔒 **Security First**: Eliminate critical vulnerabilities before any deployment
- 🚀 **Production Ready**: Ensure stability and reliability for end users
- 📈 **Scalability**: Build foundations for future growth
- 🎨 **Code Quality**: Maintain clean, maintainable, well-tested code
- 📚 **Documentation**: Keep comprehensive guides for all stakeholders

**Quick Navigation:**

📍 **Essential Sections** (Read these first):
- [📊 Quick Stats](#-quick-stats) - Overview of all tasks
- [🎓 Getting Started](#-getting-started-for-contributors) - New contributor onboarding
- [🚨 P0 Critical Issues](#-p0-critical---must-fix-before-any-deployment) - **START HERE** - Must fix before any deployment
- [📋 Sprint Planning](#-sprint-planning-suggestions) - Pre-planned work sprints

📚 **Reference Sections**:
- [🔴 P1 High Priority](#-p1-high-priority---fix-before-production-launch) - Production readiness
- [🟡 P2 Medium Priority](#-p2-medium-priority---technical-debt--quality) - Technical debt
- [🟢 P3 Low Priority](#-p3-low-priority---nice-to-have) - Enhancements
- [🕸️ Task Dependencies](#️-task-dependency-graph) - What blocks what

🔧 **Support Sections**:
- [🎯 Why Priorities Matter](#-why-each-priority-level-matters) - Understanding the impact
- [📊 P0 Risk Assessment](#-p0-risk-assessment--impact-analysis) - Security risk matrix
- [🤖 Automation Opportunities](#-automation-opportunities) - Quick wins
- [🔧 Troubleshooting](#-troubleshooting-common-issues) - Common problems & solutions
- [📚 Glossary](#-glossary) - Terms and abbreviations
- [🎯 Decision Log](#-decision-log) - Architecture decisions
- [📈 Progress Dashboard](#-progress-tracking-dashboard) - Current status
- [🎯 Success Criteria](#-success-criteria-by-milestone) - Milestone definitions
- [🔗 Related Resources](#-related-resources) - Documentation links

---

## 📊 Quick Stats

- **Total Tasks**: 45
- **P0 Critical**: 5 ⚠️ (Block deployment)
- **P1 High**: 7 🔴 (Production requirements)
- **P2 Medium**: 15 🟡 (Quality improvements)
- **P3 Low**: 18 🟢 (Enhancements)

**Estimated Total Effort**: ~120 hours  
**Critical Path Completion**: ~4 hours (P0 only)  
**Production Ready**: ~10 hours (P0 + P1 essentials)

---

## 🎓 Getting Started for Contributors

### Prerequisites
- Python 3.11+, Node.js 18+, Git
- Firebase account (for auth testing)
- Basic knowledge of Django REST Framework and Next.js

### Quick Setup
```bash
# Clone and setup backend
cd capstone-server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate

# Setup frontend
cd ../capstone-client
npm install
cp .env.local.example .env.local
# Update .env.local with your Firebase credentials

# Run tests to verify setup
cd ../capstone-server && python manage.py test
cd ../capstone-client && npm run typecheck && npm run lint
```

### Recommended Tools
- **IDE**: VS Code with Python, ESLint, Prettier extensions
- **API Testing**: Postman, Bruno, or HTTPie
- **Database**: DB Browser for SQLite (dev), pgAdmin (production)
- **Git GUI**: GitKraken, Sourcetree, or built-in IDE tools

### Before Starting Any Task
1. ✅ Read this TODO and identify your task
2. ✅ Check [Analyze.md](./Analyze.md) for related code analysis
3. ✅ Review [CLAUDE.md](./CLAUDE.md) for architecture context
4. ✅ Create a feature branch: `git checkout -b feature/TASK-ID-description`
5. ✅ Run existing tests to establish baseline
6. ✅ Make minimal, focused changes
7. ✅ Add/update tests for your changes
8. ✅ Run linters and tests before committing
9. ✅ Reference this TODO task in your commit message

---

## 🎯 Why Each Priority Level Matters

### P0 - Critical (Security & Functionality Blockers)
**Impact**: These issues will cause **immediate security breaches** or **complete app failure** in production.  
**Risk**: Data theft, unauthorized access, app crashes, legal liability.  
**Business Impact**: Cannot launch to production, potential reputation damage.  
**Action**: Fix ALL P0 issues before any deployment to staging or production.

### P1 - High Priority (Production Readiness)
**Impact**: These issues won't break the app but will cause **poor user experience** or **maintenance nightmares**.  
**Risk**: Performance problems, difficult debugging, increased support costs.  
**Business Impact**: Can deploy but with reduced confidence and higher support burden.  
**Action**: Fix before production launch for optimal stability.

### P2 - Medium Priority (Technical Debt & Quality)
**Impact**: Code quality issues that make **future development slower** and **harder to maintain**.  
**Risk**: Accumulating technical debt, harder onboarding, increased bug introduction.  
**Business Impact**: Slower feature velocity over time, higher development costs.  
**Action**: Address in regular sprints to keep codebase healthy.

### P3 - Low Priority (Nice to Have)
**Impact**: Quality of life improvements and **optional enhancements**.  
**Risk**: Minimal - these are genuine nice-to-haves.  
**Business Impact**: Improved developer experience, better user features, competitive advantage.  
**Action**: Pick up during slack time or when strategically aligned.

---

## 🚨 P0: CRITICAL - MUST FIX BEFORE ANY DEPLOYMENT

**⚠️ WARNING**: These issues represent **critical security vulnerabilities** or **complete functionality failures**. The application CANNOT be deployed to production until ALL P0 issues are resolved.

### Why P0 Issues Block Deployment

**Security Risks**: 
- Attackers can forge sessions with the hardcoded SECRET_KEY
- DEBUG=True exposes sensitive stack traces and database queries
- Missing API client causes complete frontend failure

**Functional Risks**:
- Demo login doesn't work (recruiters can't evaluate the product)
- Firebase credentials are fake/invalid (no authentication possible)
- App crashes on first API call

**Business Impact**: 
- Legal/compliance violations
- Immediate security breach on deployment
- Zero user functionality
- Professional reputation damage

---

### Security & Functionality Blockers

#### SEC-001: Remove Insecure SECRET_KEY Default 🔴

**Severity**: CRITICAL - Active Security Vulnerability  
**Related**: [Django Security Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/#secret-key)

- **File**: `capstone-server/deadline_api/settings.py:26-29`
- **Issue**: Hardcoded insecure default `django-insecure-5s4zka&...` is committed to repo and publicly visible on GitHub
- **Attack Vector**: Anyone can forge sessions, bypass CSRF protection, decrypt tokens
- **Risk Level**: 🔴 CRITICAL
  - Session forgery → unauthorized access to any account
  - CSRF bypass → account takeover
  - Token decryption → password reset exploits

- **Implementation**:

  ```python
  # Current (INSECURE) ❌
  SECRET_KEY = config("SECRET_KEY", default="django-insecure-...")
  
  # Fixed (SECURE) ✅
  SECRET_KEY = config("SECRET_KEY")
  
  # Add validation guard
  if not SECRET_KEY or SECRET_KEY.startswith("django-insecure-"):
      raise ImproperlyConfigured(
          "SECRET_KEY must be set securely in environment. "
          "Generate with: python -c 'from django.core.management.utils "
          "import get_random_secret_key; print(get_random_secret_key())'"
      )
  ```

- **Testing Checklist**:
  - [ ] Remove `SECRET_KEY` from `.env` → server fails to start with clear error
  - [ ] Set weak SECRET_KEY → server fails to start with validation error
  - [ ] Set strong SECRET_KEY → server starts successfully
  - [ ] Run `python manage.py check --deploy` → passes SECRET_KEY checks

- **Success Criteria**: 
  - ✅ Server refuses to start without SECRET_KEY environment variable
  - ✅ No hardcoded default in settings.py
  - ✅ Deployment checklist passes
  
- **Time Estimate**: 15 minutes
- **Dependencies**: None
- **Security Impact**: 🔴 HIGH - Prevents session hijacking attacks

---

#### SEC-002: Change DEBUG Default to False 🔴

**Severity**: HIGH - Information Disclosure Vulnerability  
**Related**: [Django Deployment Security](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/#debug)

- **File**: `capstone-server/deadline_api/settings.py:33`
- **Issue**: `DEBUG = config("DEBUG", default=True)` exposes sensitive information in production
- **Attack Vector**: Attacker triggers errors to gather intelligence for targeted attacks
- **Risk Level**: 🔴 HIGH
  - Exposes full stack traces with source code snippets
  - Reveals file system paths and structure
  - Shows SQL queries (potential injection points)
  - Discloses Django/Python versions (known vulnerability lookup)
  - Exposes environment variable names

- **Real-World Impact**: 
  - Attackers use error pages to map your infrastructure
  - SQL queries reveal database schema for targeted injection
  - File paths help find file upload vulnerabilities
  - Version info directs attackers to known exploits

- **Implementation**:

  ```python
  # Current (INSECURE) ❌
  DEBUG = config("DEBUG", default=True)
  
  # Fixed (SECURE) ✅
  DEBUG = config("DEBUG", default=False, cast=bool)
  
  # Add production safety check
  if not DEBUG and SECRET_KEY.startswith("django-insecure-"):
      raise ImproperlyConfigured(
          "Cannot run in production mode with insecure SECRET_KEY. "
          "This indicates misconfiguration."
      )
  ```

- **Testing Checklist**:
  - [ ] Remove `DEBUG` from `.env` → server starts with DEBUG=False
  - [ ] Set `DEBUG=False` → error pages show generic message (not stack trace)
  - [ ] Set `DEBUG=True` in dev → detailed error pages work
  - [ ] Deploy without DEBUG env var → Railway uses DEBUG=False
  - [ ] Run `python manage.py check --deploy` → passes all checks

- **Success Criteria**:
  - ✅ Default is False when DEBUG not set
  - ✅ Production errors show generic "500 Server Error" page
  - ✅ No stack traces visible to end users
  
- **Time Estimate**: 5 minutes
- **Dependencies**: None
- **Security Impact**: 🔴 HIGH - Prevents information disclosure

---

#### APP-001: Create Missing HTTP Client Implementation 💥

**Severity**: CRITICAL - Complete Frontend Failure  
**Related**: See [Analyze.md](./Analyze.md) - High Priority Findings

- **Files** (ALL MISSING):
  - `capstone-client/src/lib/api/http.ts` 
  - `capstone-client/src/lib/api/workspaces.ts`
  - `capstone-client/src/lib/api/artifacts.ts`
  - `capstone-client/src/lib/api/docs.ts`
  - `capstone-client/src/lib/api/search.ts`

- **Issue**: Application imports non-existent modules → **instant crash on load**
- **Current State**: TypeScript compilation fails, app cannot start
- **User Impact**: 100% of users cannot use the application at all

- **Risk Level**: 💥 BLOCKER
  - Application won't compile
  - Cannot make any API requests
  - No authentication token injection
  - No error handling or retries

- **Root Cause**: 
  - Files referenced in components but never created
  - Missing foundational API infrastructure
  - No centralized error handling

- **Implementation Plan**:

  **Step 1: Create Base HTTP Client** (`http.ts`)
  ```typescript
  import axios, { AxiosInstance, AxiosError } from 'axios';
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
  
  export const httpClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Request interceptor: Inject Firebase token
  httpClient.interceptors.request.use(
    async (config) => {
      // Token injection will be set by HttpAuthProvider
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Response interceptor: Normalize errors
  httpClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const normalized = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data,
      };
      return Promise.reject(normalized);
    }
  );
  ```

  **Step 2: Create Workspace API** (`workspaces.ts`)
  ```typescript
  import { httpClient } from './http';
  
  export interface Workspace {
    id: number;
    name: string;
    description: string;
    owner_uid: string;
    created_at: string;
    updated_at: string;
    artifact_count: number;
    enabled_environments: string[];
  }
  
  export async function listWorkspaces(): Promise<Workspace[]> {
    const { data } = await httpClient.get('/workspaces/');
    // Handle both array and paginated responses
    return Array.isArray(data) ? data : data.results;
  }
  
  export async function getWorkspace(id: number): Promise<Workspace> {
    const { data } = await httpClient.get(`/workspaces/${id}/`);
    return data;
  }
  
  export async function createWorkspace(payload: Partial<Workspace>): Promise<Workspace> {
    const { data } = await httpClient.post('/workspaces/', payload);
    return data;
  }
  
  export async function updateWorkspace(id: number, payload: Partial<Workspace>): Promise<Workspace> {
    const { data } = await httpClient.put(`/workspaces/${id}/`, payload);
    return data;
  }
  
  export async function deleteWorkspace(id: number): Promise<void> {
    await httpClient.delete(`/workspaces/${id}/`);
  }
  ```

  **Step 3: Create Artifacts API** (`artifacts.ts`)
  ```typescript
  import { httpClient } from './http';
  
  export type ArtifactKind = 'ENV_VAR' | 'PROMPT' | 'DOC_LINK';
  
  export interface Artifact {
    id: number;
    workspace: number;
    kind: ArtifactKind;
    environment: string;
    key?: string;
    value?: string;
    title?: string;
    content?: string;
    url?: string;
    notes?: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  }
  
  export async function listArtifacts(
    workspaceId: number,
    params?: { kind?: string; environment?: string; search?: string }
  ): Promise<Artifact[]> {
    const { data } = await httpClient.get(`/workspaces/${workspaceId}/artifacts/`, { params });
    return Array.isArray(data) ? data : data.results;
  }
  
  export async function getArtifact(workspaceId: number, artifactId: number): Promise<Artifact> {
    const { data } = await httpClient.get(`/workspaces/${workspaceId}/artifacts/${artifactId}/`);
    return data;
  }
  
  export async function createArtifact(workspaceId: number, payload: Partial<Artifact>): Promise<Artifact> {
    const { data } = await httpClient.post(`/workspaces/${workspaceId}/artifacts/`, payload);
    return data;
  }
  
  export async function updateArtifact(
    workspaceId: number,
    artifactId: number,
    payload: Partial<Artifact>
  ): Promise<Artifact> {
    const { data } = await httpClient.put(`/workspaces/${workspaceId}/artifacts/${artifactId}/`, payload);
    return data;
  }
  
  export async function deleteArtifact(workspaceId: number, artifactId: number): Promise<void> {
    await httpClient.delete(`/workspaces/${workspaceId}/artifacts/${artifactId}/`);
  }
  
  export async function revealValue(workspaceId: number, artifactId: number): Promise<{ value: string }> {
    const { data } = await httpClient.post(`/workspaces/${workspaceId}/artifacts/${artifactId}/reveal_value/`);
    return data;
  }
  ```

  **Step 4: Create Docs API** (`docs.ts`)
  ```typescript
  import { httpClient } from './http';
  import { Artifact } from './artifacts';
  
  export async function listDocLinksGlobal(): Promise<Artifact[]> {
    try {
      const { data } = await httpClient.get('/docs/');
      return Array.isArray(data) ? data : data.results;
    } catch (error) {
      // Fallback: aggregate from workspaces
      return [];
    }
  }
  ```

  **Step 5: Create Search API** (`search.ts`)
  ```typescript
  import { httpClient } from './http';
  import { Artifact } from './artifacts';
  
  export async function searchArtifacts(query: string): Promise<Artifact[]> {
    const { data } = await httpClient.get('/search/artifacts/', {
      params: { q: query },
    });
    return Array.isArray(data) ? data : data.results;
  }
  ```

- **Testing Checklist**:
  - [ ] Create all 5 API module files
  - [ ] Run `npm run typecheck` → no errors
  - [ ] Run `npm run build` → compiles successfully
  - [ ] Start app → loads without import errors
  - [ ] Login → see Bearer token in network tab
  - [ ] Create workspace → API call succeeds with auth header
  - [ ] Test error handling → see normalized error messages
  - [ ] Test pagination → both formats handled correctly

- **Success Criteria**:
  - ✅ All TypeScript files exist and compile
  - ✅ App starts without import errors
  - ✅ API calls include authentication headers
  - ✅ Both array and paginated responses work
  - ✅ Error handling provides useful feedback

- **Time Estimate**: 3 hours
- **Dependencies**: None
- **Blocks**: APP-002 (demo module), all frontend functionality

---

#### APP-002: Create Missing Demo Module 🎯

**Severity**: CRITICAL - Demo Feature Completely Broken  
**Related**: See [Analyze.md](./Analyze.md) - High Priority, [DEMO_LOGIN_DEBUG.md](./DEMO_LOGIN_DEBUG.md)

- **File**: `capstone-client/src/lib/demo.ts` (MISSING)
- **Issue**: Login page imports `loginAsDemoUser` but file doesn't exist → compile error
- **User Impact**: Recruiters/evaluators cannot access demo → lost opportunities

- **Risk Level**: 💥 BLOCKER (for demo deployments)
  - Demo login button doesn't work
  - Potential clients can't evaluate product
  - Professional credibility damaged

- **Current Broken Flow**:
  1. User clicks "Launch Demo"
  2. App calls `/api/v1/auth/demo/login/`
  3. Backend returns custom token
  4. **Frontend does `window.location.href = '/dashboard'`** (wrong!)
  5. AuthGuard sees no Firebase user → redirects to login
  6. Infinite redirect loop

- **Root Cause Analysis**:
  - Missing demo.ts module causes import failure
  - No Firebase authentication integration
  - Demo endpoint returns token but client doesn't use it
  - AuthContext never receives demo user

- **Implementation**:

  ```typescript
  // capstone-client/src/lib/demo.ts
  import { httpClient } from './api/http';
  import { signInWithCustomToken } from 'firebase/auth';
  import { getFirebaseAuth } from './firebase/client';
  
  export interface DemoLoginResponse {
    custom_token: string;
    user: {
      uid: string;
      email: string;
      displayName: string;
    };
  }
  
  /**
   * Authenticate as demo user via backend-generated custom token
   * 
   * Flow:
   * 1. Backend creates Firebase custom token for demo user
   * 2. Client exchanges token for full Firebase auth
   * 3. AuthContext automatically picks up authenticated user
   * 4. App grants access to demo workspace
   */
  export async function loginAsDemoUser(): Promise<{ success: boolean; error?: string }> {
    try {
      // Request demo custom token from backend
      const response = await httpClient.post<DemoLoginResponse>('/auth/demo/login/');
      const { custom_token } = response.data;
      
      if (!custom_token) {
        throw new Error('Backend did not return custom token');
      }
      
      // Authenticate with Firebase using custom token
      const auth = getFirebaseAuth();
      const userCredential = await signInWithCustomToken(auth, custom_token);
      
      // Verify authentication succeeded
      if (!userCredential.user) {
        throw new Error('Firebase authentication failed');
      }
      
      console.info('Demo login successful:', userCredential.user.uid);
      return { success: true };
      
    } catch (error: any) {
      console.error('Demo login failed:', error);
      return {
        success: false,
        error: error.message || 'Demo login failed. Please try again.',
      };
    }
  }
  
  /**
   * Check if current user is demo user
   */
  export function isDemoUser(userEmail: string | null): boolean {
    return userEmail === 'demo@deadline.demo';
  }
  ```

- **Usage in Login Page**:
  ```typescript
  // In login page component
  const handleDemoLogin = async () => {
    setIsLoading(true);
    const result = await loginAsDemoUser();
    
    if (result.success) {
      // AuthContext will handle automatic redirect to dashboard
      // No need for manual window.location.href
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };
  ```

- **Backend Requirements**:
  - Ensure `DEMO_MODE=True` in backend `.env`
  - Endpoint `/api/v1/auth/demo/login/` must return:
    ```json
    {
      "custom_token": "firebase-custom-token-here",
      "user": {
        "uid": "demo-user-uid",
        "email": "demo@deadline.demo",
        "displayName": "Demo User"
      }
    }
    ```

- **Testing Checklist**:
  - [ ] Create `src/lib/demo.ts` file
  - [ ] Update login page to use new demo module
  - [ ] Verify TypeScript compilation succeeds
  - [ ] Test demo login with network inspector → see custom token
  - [ ] Verify Firebase authentication completes
  - [ ] Check AuthContext updates with demo user
  - [ ] Navigate to dashboard → no redirect loop
  - [ ] Verify DemoBanner appears
  - [ ] Test on both localhost and deployed environment

- **Success Criteria**:
  - ✅ Demo button works without errors
  - ✅ User authenticated as demo@deadline.demo
  - ✅ Dashboard loads with demo workspace
  - ✅ DemoBanner displays correctly
  - ✅ No redirect loops

- **Time Estimate**: 30 minutes
- **Dependencies**: APP-001 (HTTP client must exist first)
- **Blocks**: Demo deployments, recruitment/evaluation flows

---

#### CONFIG-001: Replace Fake Firebase Web Credentials 🔐

**Severity**: CRITICAL - Authentication Completely Broken  
**Related**: [URGENT_FIREBASE_FIX.md](./URGENT_FIREBASE_FIX.md), [Analyze.md](./Analyze.md) Medium Priority

- **File**: `capstone-client/.env.local`
- **Issue**: Contains **fake placeholder credentials** that don't work
  - `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBVm4sR9v...` (invalid)
  - Other Firebase config values are also placeholders

- **Current State**: Firebase SDK initialization fails silently or with cryptic errors
- **User Impact**: **Nobody can log in** - authentication is 100% broken

- **Risk Level**: 💥 BLOCKER
  - Firebase.initializeApp() fails
  - All authentication attempts fail
  - Users see "Invalid API key" errors
  - No way to access the application

- **Root Cause**:
  - Fake credentials committed to repo for security
  - Real credentials must be obtained from Firebase Console
  - Missing validation in env.ts allows app to start with invalid config

- **Step-by-Step Fix**:

  **1. Get Real Firebase Credentials**
  ```bash
  # Navigate to Firebase Console
  # https://console.firebase.google.com/
  
  # Steps:
  # 1. Select your project (or create new one)
  # 2. Click gear icon → Project Settings
  # 3. Scroll down to "Your apps" section
  # 4. Click "</>" (Web app) icon
  # 5. If no web app exists, click "Add app"
  # 6. Register app (any name, e.g., "DEADLINE Web")
  # 7. Copy the firebaseConfig object
  ```

  **2. Update .env.local**
  ```bash
  # capstone-client/.env.local
  
  # API Configuration
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
  
  # Firebase Configuration (REPLACE WITH YOUR REAL VALUES)
  NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... # From Firebase Console
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
  NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXX  # Optional
  ```

  **3. Enable Firebase Authentication**
  ```bash
  # In Firebase Console:
  # 1. Click "Authentication" in left sidebar
  # 2. Click "Get started" (if first time)
  # 3. Go to "Sign-in method" tab
  # 4. Enable "Email/Password" provider
  # 5. Save changes
  ```

  **4. Add Service Account for Backend**
  ```bash
  # Backend needs service account for token verification
  # In Firebase Console:
  # 1. Project Settings → Service Accounts
  # 2. Click "Generate new private key"
  # 3. Save the JSON file securely
  # 4. Add to backend .env:
  
  # Option 1: File path
  FIREBASE_CREDENTIALS_FILE=/path/to/serviceAccountKey.json
  
  # Option 2: Individual env vars (better for production)
  FIREBASE_TYPE=service_account
  FIREBASE_PROJECT_ID=your-project-id
  FIREBASE_PRIVATE_KEY_ID=abc123...
  FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
  FIREBASE_CLIENT_ID=123456789
  FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
  FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
  FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
  FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
  ```

  **5. Improve Validation** (optional but recommended)
  ```typescript
  // capstone-client/src/lib/env.ts
  
  export function validatePublicEnv() {
    const required = [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('Missing required environment variables:', missing);
      return false;
    }
    
    // Validate API key format (basic check)
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey.startsWith('AIzaSy') || apiKey.length < 30) {
      console.error('NEXT_PUBLIC_FIREBASE_API_KEY appears to be invalid');
      return false;
    }
    
    return true;
  }
  ```

- **Security Best Practices**:
  - ✅ Never commit real credentials to Git
  - ✅ Use `.env.local` (in .gitignore)
  - ✅ For production: Use hosting provider's secret management
  - ✅ Restrict Firebase API key to your domain
  - ✅ Enable App Check for additional security

- **Testing Checklist**:
  - [ ] Get real Firebase config from Console
  - [ ] Update all `NEXT_PUBLIC_FIREBASE_*` variables
  - [ ] Restart dev server: `npm run dev`
  - [ ] Open browser console → no Firebase errors
  - [ ] Navigate to `/login` → page loads correctly
  - [ ] Attempt login → see Firebase auth requests in network tab
  - [ ] Create test account → succeeds
  - [ ] Login with test account → succeeds
  - [ ] Backend accepts Firebase tokens → verified

- **Common Errors & Solutions**:
  ```
  Error: "Firebase: Error (auth/invalid-api-key)"
  → Solution: API key is wrong, get correct one from Console
  
  Error: "Firebase: Error (auth/project-not-found)"
  → Solution: PROJECT_ID doesn't match, verify in Console
  
  Error: "Firebase: Error (auth/operation-not-allowed)"
  → Solution: Enable Email/Password auth in Firebase Console
  ```

- **Success Criteria**:
  - ✅ Firebase initializes without errors
  - ✅ Login page loads successfully
  - ✅ Can create new accounts
  - ✅ Can sign in with email/password
  - ✅ Backend verifies Firebase tokens
  - ✅ No console errors about Firebase config

- **Time Estimate**: 10 minutes (if you have Firebase access)
- **Dependencies**: None
- **Blocks**: All authentication, entire application functionality
- **Documentation**: See [GET_FIREBASE_CREDENTIALS.md](./GET_FIREBASE_CREDENTIALS.md)

---

---

## 📊 P0 Risk Assessment & Impact Analysis

### Security Risk Matrix

| Task | Exploitability | Impact | Detection | Overall Risk |
|------|---------------|---------|-----------|--------------|
| SEC-001 (SECRET_KEY) | 🔴 Easy | 🔴 Critical | 🟡 Medium | **CRITICAL** |
| SEC-002 (DEBUG) | 🟡 Medium | 🔴 High | 🟢 Easy | **HIGH** |
| APP-001 (HTTP Client) | N/A | 💥 Blocker | 🔴 Immediate | **BLOCKER** |
| APP-002 (Demo) | N/A | 🟡 Feature Break | 🟢 Easy | **HIGH** |
| CONFIG-001 (Firebase) | N/A | 💥 Blocker | 🔴 Immediate | **BLOCKER** |

### P0 Completion Metrics

**Before P0 Fix**:
- 🔴 Application: Cannot compile or run
- 🔴 Authentication: Completely broken
- 🔴 Security: Multiple critical vulnerabilities
- 🔴 Demo: Non-functional
- 🔴 Production Ready: 0%

**After P0 Fix**:
- 🟢 Application: Compiles and runs
- 🟢 Authentication: Fully functional
- 🟢 Security: Critical issues resolved
- 🟢 Demo: Working for evaluators
- 🟡 Production Ready: 60% (needs P1 for 100%)

### Estimated ROI

**Investment**: 4 hours of development time  
**Return**:
- **Security**: Prevent legal liability, data breaches ($$$$$)
- **Functionality**: 0% → 100% working app (infinite ROI)
- **Business**: Enable product evaluation, demos, early adopters
- **Reputation**: Professional credibility maintained
- **Opportunity Cost**: Enables all future development

**Verdict**: **MUST DO IMMEDIATELY** - Highest ROI of any work

---

## 🔴 P1: HIGH PRIORITY - Fix Before Production Launch

### Security Hardening

- [ ] **SEC-003: Add Input Sanitization for User Content**
  - **Files**: `capstone-server/artifacts/serializers.py`
  - **Issue**: No validation on `content`, `notes`, `url` fields
  - **Risk**: XSS, script injection, malformed URLs
  - **Action**:

    ```python
    def validate_content(self, value):
        if value:
            value = value.replace('\x00', '')  # Remove null bytes
            if len(value) > 100_000:  # 100KB limit
                raise ValidationError("Content too large")
        return value

    def validate_url(self, value):
        if value and not value.startswith(('http://', 'https://')):
            raise ValidationError("Invalid URL scheme")
        # Block javascript:, data:, vbscript: URIs
        if value.lower().startswith(('javascript:', 'data:', 'vbscript:')):
            raise ValidationError("Invalid URL scheme")
        return value
    ```

  - **Verify**: Try creating artifact with `<script>alert(1)</script>` → rejected
  - **Time**: 1 hour
  - **Dependencies**: None

---

- [ ] **SEC-004: Add Rate Limiting to Auth Endpoints**
  - **Files**:
    - `capstone-server/auth_firebase/demo_views.py`
    - `capstone-server/auth_firebase/views.py`
  - **Issue**: No protection against brute force or abuse
  - **Risk**: Credential stuffing, quota exhaustion, DoS
  - **Action**:
    1. Add `django-ratelimit>=4.1.0` to requirements.txt
    2. Apply decorators:

    ```python
    from django_ratelimit.decorators import ratelimit

    @ratelimit(key='ip', rate='10/h', method='POST')
    @api_view(["POST"])
    def demo_login(request):
        if getattr(request, 'limited', False):
            return Response({"error": "Rate limited"},
                          status=429)
        # ... existing logic
    ```

  - **Verify**: 11th request in an hour returns 429
  - **Time**: 1 hour
  - **Dependencies**: None

---

### Performance & Stability

- [ ] **PERF-001: Simplify Token Caching Logic**
  - **File**: `capstone-client/src/contexts/AuthContext.tsx:127-200`
  - **Issue**: Complex retry loops with race conditions, tight polling
  - **Risk**: CPU waste, intermittent auth failures, duplicate refreshes
  - **Action**: Remove waiting loop, simplify cache logic
  - **Implementation**: See analysis report section 2.1
  - **Verify**: Network tab shows minimal token refresh calls during navigation
  - **Time**: 1 hour
  - **Dependencies**: None

---

- [ ] **PERF-002: Replace Broad Exception Handling**
  - **Files**:
    - `capstone-server/workspaces/views.py:52, 83`
    - `capstone-server/artifacts/views.py:55, 135`
    - `capstone-server/auth_firebase/demo_views.py:112`
  - **Issue**: `except Exception:` masks bugs and prevents debugging
  - **Risk**: Silent failures, impossible troubleshooting in production
  - **Action**:

    ```python
    # Bad ❌
    except Exception:
        pass

    # Good ✅
    except (IntegrityError, DatabaseError) as e:
        logger.warning("Operation failed: %s", e)
    ```

  - **Verify**: Pytest with coverage shows specific exceptions tested
  - **Time**: 2 hours
  - **Dependencies**: None

---

- [ ] **CODE-001: Fix Protected Member Access**
  - **Files**:
    - `capstone-server/deadline_api/settings.py:269`
    - `capstone-server/auth_firebase/demo_views.py:70`
  - **Issue**: Direct access to `firebase_admin._apps` (private attribute)
  - **Risk**: May break in future firebase-admin versions
  - **Action**:

    ```python
    # Bad ❌
    if len(firebase_admin._apps) == 0:

    # Good ✅
    try:
        firebase_admin.get_app()
    except ValueError:
        firebase_admin.initialize_app(cred)
    ```

  - **Verify**: Pylint errors disappear
  - **Time**: 30 min
  - **Dependencies**: None

---

- [ ] **API-001: Create TypeScript API Wrapper Layer**
  - **Files**: Create complete `lib/api/` directory structure
  - **Issue**: No type-safe API client, every component reimplements calls
  - **Risk**: Type safety gaps, duplicate code, hard to refactor
  - **Action**: Create wrappers for all endpoints:
    - `workspaces.ts`: listWorkspaces, getWorkspace, createWorkspace, etc.
    - `artifacts.ts`: listArtifacts, createArtifact, etc.
    - `auth.ts`: verifyToken, userInfo, etc.
  - **Verify**: Full TypeScript type coverage, zero compiler errors
  - **Time**: 4 hours
  - **Dependencies**: APP-001

---

- [ ] **API-002: Add Request/Response Type Definitions**
  - **File**: `capstone-client/src/types/api.ts` (CREATE)
  - **Issue**: API response shapes not defined
  - **Action**:

    ```typescript
    export interface Workspace {
      id: number;
      name: string;
      description: string;
      owner_uid: string;
      created_at: string;
      updated_at: string;
      artifact_count: number;
      enabled_environments?: string[];
    }

    export interface Artifact {
      id: number;
      workspace: number;
      kind: 'ENV_VAR' | 'PROMPT' | 'DOC_LINK';
      environment: string;
      key: string;
      title: string;
      content: string;
      // ... etc
    }

    export interface PaginatedResponse<T> {
      count: number;
      next: string | null;
      previous: string | null;
      results: T[];
    }
    ```

  - **Verify**: Import types in all API functions
  - **Time**: 1 hour
  - **Dependencies**: None

---

## 🟡 P2: MEDIUM PRIORITY - Technical Debt & Quality

### Code Quality

- [ ] **LINT-001: Fix Unused Import Violations**
  - **Files**: Throughout backend (see `get_errors` output)
  - **Examples**:
    - `auth_firebase/authentication.py:16` - unused `firebase_admin` import
    - Multiple ViewSet methods with unused arguments
  - **Action**:

    ```python
    # Remove truly unused imports
    # Prefix intentionally unused params with underscore
    def export_workspace(self, _request, _pk=None):
    ```

  - **Verify**: `pylint capstone-server --max-warnings=0` passes
  - **Time**: 2 hours
  - **Dependencies**: None

---

- [ ] **LINT-002: Fix Argument Naming Violations**
  - **Files**: All ViewSets
  - **Issue**: DRF ViewSet methods have unused `request`, `pk`, `args`, `kwargs`
  - **Action**: Prefix with underscore: `_request`, `_pk`, `_args`, `_kwargs`
  - **Verify**: Pylint warnings gone
  - **Time**: 30 min
  - **Dependencies**: None

---

- [ ] **LINT-003: Fix Variable Redefinition**
  - **File**: `capstone-server/workspaces/views.py:293`
  - **Issue**: `WorkspaceSerializer` redefined in local scope
  - **Action**: Rename inner import to `WSSerializer` or remove if unnecessary
  - **Verify**: Pylint clean
  - **Time**: 10 min
  - **Dependencies**: None

---

- [ ] **LINT-004: Add Exception Chaining**
  - **File**: `capstone-server/artifacts/views.py:366`
  - **Issue**: Re-raising without `from exc` loses traceback
  - **Action**:

    ```python
    except IntegrityError as exc:
        raise ValidationError({"name": "Tag exists"}) from exc
    ```

  - **Verify**: Better error messages in logs
  - **Time**: 15 min
  - **Dependencies**: None

---

### Architecture Improvements

- [ ] **ARCH-001: Decide on Middleware Strategy**
  - **File**: `capstone-client/src/middleware.ts`
  - **Issue**: Middleware configured but does nothing (just returns `next()`)
  - **Options**:
    1. **Remove entirely** if client-side auth is sufficient
    2. **Implement properly** with server-side session checks
  - **Recommendation**: Implement for defense-in-depth
  - **Action** (if implementing):

    ```typescript
    const PUBLIC_PATHS = ['/login', '/signup', '/'];

    export function middleware(request: NextRequest) {
      const { pathname } = request.nextUrl;
      if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.next();
      }

      const session = request.cookies.get('session');
      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    }
    ```

  - **Verify**: Unauthenticated user redirected before page loads
  - **Time**: 1 hour
  - **Dependencies**: Architecture decision needed

---

- [ ] **ARCH-002: Consolidate Firebase Configuration Methods**
  - **File**: `capstone-server/deadline_api/settings.py:230-290`
  - **Issue**: Three different initialization paths (file, runtime file, env vars)
  - **Risk**: Confusing, hard to debug which method is active
  - **Action**: Choose ONE method (recommend: individual env vars)
  - **Implementation**: See analysis report section 3.4
  - **Verify**: Deploy with only env vars → works without file
  - **Time**: 2 hours
  - **Dependencies**: None

---

- [ ] **ARCH-003: Add Global Error Boundary**
  - **Files**:
    - `capstone-client/src/app/error.tsx` (CREATE)
    - `capstone-client/src/app/global-error.tsx` (CREATE)
  - **Issue**: Unhandled errors crash entire app
  - **Action**: Implement Next.js error boundaries
  - **Implementation**: See analysis report section 3.3
  - **Verify**: Trigger error → see friendly error page instead of crash
  - **Time**: 1 hour
  - **Dependencies**: None

---

- [ ] **ARCH-004: Add Centralized API Error Handling**
  - **File**: `capstone-client/src/lib/api/http.ts`
  - **Issue**: Each component handles errors differently
  - **Action**: Add response interceptor with global error handling
  - **Implementation**:

    ```typescript
    httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await signOutFn?.();
        }
        // Add toast notifications for 403, 500, etc.
        return Promise.reject(error);
      }
    );
    ```

  - **Verify**: Consistent error UX across app
  - **Time**: 2 hours
  - **Dependencies**: APP-001

---

- [ ] **ARCH-005: Simplify Demo Mode Implementation**
  - **Files**:
    - `capstone-server/auth_firebase/demo_middleware.py`
    - `capstone-server/auth_firebase/demo_views.py`
  - **Issue**: Dual auth paths (session-based demo vs Firebase)
  - **Recommendation**: Demo mode should ONLY use Firebase custom tokens
  - **Action**: Remove session-based demo auth, keep only custom token generation
  - **Benefit**: Single code path, simpler to maintain
  - **Verify**: Demo still works with simplified flow
  - **Time**: 3 hours
  - **Dependencies**: Architecture review

---

### Error Handling & Logging

- [ ] **LOG-001: Add Production Logging Strategy**
  - **File**: `capstone-server/deadline_api/settings.py` (add LOGGING config)
  - **Issue**: No structured logging configuration
  - **Action**:

    ```python
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'verbose': {
                'format': '{levelname} {asctime} {module} {message}',
                'style': '{',
            },
        },
        'handlers': {
            'console': {
                'class': 'logging.StreamHandler',
                'formatter': 'verbose',
            },
        },
        'root': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': False,
            },
        },
    }
    ```

  - **Verify**: Logs appear in Railway dashboard
  - **Time**: 1 hour
  - **Dependencies**: None

---

- [ ] **LOG-002: Add Structured Error Logging**
  - **Files**: All ViewSets
  - **Issue**: Errors caught but not logged with context
  - **Action**: Add logger calls in exception handlers
  - **Example**:

    ```python
    except IntegrityError as e:
        logger.error(
            "Failed to create workspace: %s",
            e,
            extra={"user_uid": request.user.uid, "data": serializer.data}
        )
    ```

  - **Verify**: Error logs include actionable context
  - **Time**: 2 hours
  - **Dependencies**: LOG-001

---

- [ ] **LOG-003: Remove Console.log from Production Code**
  - **Files**: `capstone-client/src/contexts/AuthContext.tsx` and others
  - **Issue**: Debug console.log calls will run in production
  - **Action**:

    ```typescript
    // Replace console.log with conditional logging
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Auth state changed:', u ? `User: ${u.uid}` : 'Signed out');
    }
    ```

  - **Verify**: Production build has no console output
  - **Time**: 30 min
  - **Dependencies**: None

---

### Testing

- [ ] **TEST-001: Add Authentication Flow Tests**
  - **File**: `capstone-server/auth_firebase/tests/test_authentication.py` (CREATE)
  - **Issue**: No tests for Firebase auth integration
  - **Action**: Test token verification, user creation, error cases
  - **Coverage Target**: 80%
  - **Time**: 3 hours
  - **Dependencies**: None

---

- [ ] **TEST-002: Add ViewSet Integration Tests**
  - **Files**:
    - `capstone-server/workspaces/tests/test_viewsets.py` (CREATE)
    - `capstone-server/artifacts/tests/test_viewsets.py` (CREATE)
  - **Issue**: No API endpoint tests
  - **Action**: Test CRUD operations, permissions, filtering
  - **Implementation**: See analysis report section 3.5
  - **Coverage Target**: 80%
  - **Time**: 4 hours
  - **Dependencies**: None

---

- [ ] **TEST-003: Add Frontend Unit Tests**
  - **Files**: Create `__tests__/` directories
  - **Issue**: Zero frontend test coverage
  - **Action**:
    1. Install Jest + React Testing Library
    2. Test AuthContext, hooks, components
  - **Coverage Target**: 70%
  - **Time**: 8 hours
  - **Dependencies**: None

---

- [ ] **TEST-004: Add E2E Tests**
  - **Tool**: Playwright (already has MCP integration)
  - **Scenarios**:
    - Complete demo login flow
    - Create workspace → add artifacts → export
    - Error handling paths
  - **Time**: 6 hours
  - **Dependencies**: APP-001, APP-002

---

- [ ] **TEST-005: Set Up CI Pipeline**
  - **Platform**: GitHub Actions
  - **Jobs**:
    - Backend: pytest, pylint, mypy, safety check
    - Frontend: jest, eslint, typecheck, build
  - **Action**: Create `.github/workflows/ci.yml`
  - **Verify**: All checks pass on every PR
  - **Time**: 2 hours
  - **Dependencies**: TEST-001, TEST-002, TEST-003

---

## 🟢 P3: LOW PRIORITY - Nice to Have

### Developer Experience

- [ ] **DX-001: Add Pre-commit Hooks**
  - **Tool**: `pre-commit` package
  - **Hooks**: black, isort, eslint, prettier
  - **Time**: 30 min
  - **Dependencies**: None

---

- [ ] **DX-002: Create Docker Compose for Local Dev**
  - **File**: `docker-compose.yml` (CREATE)
  - **Services**: postgres, redis (future), backend, frontend
  - **Time**: 2 hours
  - **Dependencies**: None

---

- [ ] **DX-003: Add API Documentation UI**
  - **Tool**: drf-spectacular (already installed)
  - **Action**: Deploy Swagger UI at `/api/docs/`
  - **Time**: 30 min
  - **Dependencies**: None

---

- [ ] **DX-004: Create CONTRIBUTING.md**
  - **Content**: Setup instructions, coding standards, PR process
  - **Time**: 1 hour
  - **Dependencies**: None

---

- [ ] **DX-005: Add Database Seed Script**
  - **File**: `capstone-server/workspaces/management/commands/seed_data.py`
  - **Purpose**: Populate dev DB with realistic test data
  - **Time**: 2 hours
  - **Dependencies**: None

---

### Performance Optimization

- [ ] **OPT-001: Add React Query for Data Caching**
  - **Package**: `@tanstack/react-query`
  - **Benefit**: Reduce API calls, optimistic updates
  - **Files**: Refactor all data-fetching hooks
  - **Time**: 4 hours
  - **Dependencies**: API-001

---

- [ ] **OPT-002: Add Response Compression**
  - **Backend**: Add `django.middleware.gzip.GZipMiddleware`
  - **Frontend**: Configure Next.js compression
  - **Benefit**: Faster load times
  - **Time**: 30 min
  - **Dependencies**: None

---

- [ ] **OPT-003: Implement Database Query Caching**
  - **Tool**: Redis + django-redis
  - **Scope**: Cache workspace lists, artifact counts
  - **Benefit**: Reduce DB load
  - **Time**: 3 hours
  - **Dependencies**: Infrastructure (Redis)

---

- [ ] **OPT-004: Add Next.js Image Optimization**
  - **Action**: Replace `<img>` with `<Image>` from next/image
  - **Benefit**: Automatic resizing, lazy loading, WebP
  - **Time**: 2 hours
  - **Dependencies**: None

---

- [ ] **OPT-005: Implement API Response Pagination Optimization**
  - **Issue**: Default page size is 20, may be too small
  - **Action**: Make page size configurable, add cursor pagination
  - **Time**: 2 hours
  - **Dependencies**: None

---

### Security Enhancements

- [ ] **SEC-005: Add Dependency Vulnerability Scanning**
  - **Backend**: `pip install safety && safety check`
  - **Frontend**: `npm audit`
  - **Frequency**: Weekly + on every deploy
  - **Time**: 1 hour
  - **Dependencies**: TEST-005 (CI setup)

---

- [ ] **SEC-006: Add Content Security Policy**
  - **File**: `capstone-client/next.config.ts`
  - **Action**: Configure CSP headers
  - **Benefit**: XSS protection
  - **Time**: 1 hour
  - **Dependencies**: None

---

- [ ] **SEC-007: Add HSTS Headers**
  - **Backend**: Configure secure headers middleware
  - **Action**:

    ```python
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    ```

  - **Time**: 15 min
  - **Dependencies**: None

---

- [ ] **SEC-008: Implement Audit Logging**
  - **Scope**: Log all create/update/delete operations
  - **Fields**: user, action, timestamp, IP, changes
  - **Storage**: Separate audit table
  - **Time**: 4 hours
  - **Dependencies**: None

---

- [ ] **SEC-009: Add CSRF Token Rotation**
  - **Issue**: CSRF tokens never rotate
  - **Action**: Configure rotation on sensitive operations
  - **Time**: 1 hour
  - **Dependencies**: None

---

### Feature Enhancements

- [ ] **FEAT-001: Add Workspace Sharing**
  - **Scope**: Share workspaces with other users (read/write permissions)
  - **DB**: New `WorkspaceCollaborator` model
  - **API**: Invite endpoints
  - **Time**: 12 hours
  - **Dependencies**: None

---

- [ ] **FEAT-002: Add Full-Text Search**
  - **Tool**: PostgreSQL full-text search or Elasticsearch
  - **Scope**: Search across all artifact content
  - **Time**: 6 hours
  - **Dependencies**: Infrastructure decision

---

- [ ] **FEAT-003: Add Workspace Backup/Export**
  - **Format**: JSON export with all artifacts
  - **Schedule**: Automatic daily backups
  - **Time**: 4 hours
  - **Dependencies**: None

---

- [ ] **FEAT-004: Add Workspace Templates**
  - **Scope**: Pre-built workspace structures (e.g., "Node.js API", "React App")
  - **Time**: 6 hours
  - **Dependencies**: DX-005

---

- [ ] **FEAT-005: Add Dark Mode Toggle Persistence**
  - **Issue**: Theme preference not saved
  - **Action**: Store in localStorage or user preferences
  - **Time**: 1 hour
  - **Dependencies**: None

---

### Documentation

- [ ] **DOC-001: Add Architecture Diagram**
  - **Tool**: Mermaid or draw.io
  - **Content**: System architecture, data flow, auth flow
  - **Time**: 2 hours
  - **Dependencies**: None

---

- [ ] **DOC-002: Create API Usage Examples**
  - **File**: `docs/API_EXAMPLES.md`
  - **Content**: CURL examples for all endpoints
  - **Time**: 2 hours
  - **Dependencies**: None

---

- [ ] **DOC-003: Add Environment Variable Documentation**
  - **File**: `docs/ENVIRONMENT_VARIABLES.md`
  - **Content**: Complete list with descriptions, defaults, requirements
  - **Time**: 1 hour
  - **Dependencies**: None

---

- [ ] **DOC-004: Create Deployment Runbook**
  - **File**: `docs/DEPLOYMENT_RUNBOOK.md`
  - **Content**: Step-by-step deployment, rollback, troubleshooting
  - **Time**: 2 hours
  - **Dependencies**: None

---

## 🕸️ Task Dependency Graph

Understanding task dependencies helps prioritize work and avoid blockers. Here's the critical path:

### Critical Path (Must be done in order)

```
P0 Critical Tasks:
┌─────────────┐
│  SEC-001    │  Remove insecure SECRET_KEY
│  SEC-002    │  Change DEBUG default
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  APP-001    │  Create HTTP client (BLOCKS everything frontend)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  APP-002    │  Create demo module (DEPENDS on APP-001)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│CONFIG-001   │  Real Firebase credentials
└─────────────┘

Total Critical Path Time: ~4 hours
```

### P1 Dependencies

```
P1 High Priority Tasks:

SEC-003 (Input Sanitization) ─┐
SEC-004 (Rate Limiting)       ├─→ Independent, can be done in parallel
PERF-001 (Token Caching)      │
PERF-002 (Exception Handling) │
CODE-001 (Protected Member)   ┘

APP-001 ─→ API-001 (TypeScript Wrappers) ─→ API-002 (Type Definitions)
               │
               └─→ ARCH-004 (Error Handling)
```

### Parallelization Opportunities

**Can be done simultaneously** (no dependencies):
- SEC-001, SEC-002, CONFIG-001 (3 people can work in parallel)
- All LINT tasks (LINT-001 through LINT-004)
- All SEC tasks in P1 (SEC-003, SEC-004)
- All LOG tasks (LOG-001, LOG-002, LOG-003)

**Must be done sequentially**:
1. APP-001 (HTTP client) → APP-002 (demo module)
2. APP-001 → API-001 (TypeScript wrappers) → API-002 (types)
3. LOG-001 (logging strategy) → LOG-002 (structured logging)
4. TEST-001, TEST-002, TEST-003 → TEST-005 (CI pipeline)

### Quick Reference: What Blocks What

| This Task | Blocks These Tasks |
|-----------|-------------------|
| APP-001 (HTTP client) | APP-002, API-001, ARCH-004, all frontend work |
| API-001 (TS wrappers) | API-002, OPT-001, TEST-003 |
| TEST-001, TEST-002 | TEST-005 (CI setup) |
| LOG-001 (logging) | LOG-002 (structured logs) |
| DX-005 (seed data) | FEAT-004 (templates) |

---

## 📋 Sprint Planning Suggestions

### Sprint 1: Critical Fixes - "Make It Work" (Week 1)

**Goal**: Transform non-functional app into working demo  
**Duration**: 1 day (4 hours of focused work)  
**Team Size**: 1-2 developers

**Tasks** (in recommended order):
1. [ ] **CONFIG-001**: Get Firebase credentials (10 min) - Do this first!
2. [ ] **SEC-001**: SECRET_KEY fix (15 min)
3. [ ] **SEC-002**: DEBUG default fix (5 min)
4. [ ] **APP-001**: Create HTTP client layer (3 hours)
   - Create http.ts base client
   - Create workspaces.ts API
   - Create artifacts.ts API
   - Create docs.ts and search.ts APIs
5. [ ] **APP-002**: Create demo module (30 min)

**Parallelization**:
- If 2 developers: One does CONFIG-001 + SEC-001/002, other starts APP-001
- If 1 developer: Follow the order above

**Success Metrics**:
- ✅ `npm run build` succeeds without errors
- ✅ `npm run dev` starts the app
- ✅ Login page loads and displays correctly
- ✅ Can create account and login
- ✅ "Launch Demo" button works end-to-end
- ✅ Dashboard shows demo workspace
- ✅ Can create and view artifacts
- ✅ Backend has no critical security warnings

**Acceptance Test**:
```bash
# Run this checklist to verify sprint 1 complete
cd capstone-server
python manage.py check --deploy  # Should pass
python manage.py test            # Should pass

cd ../capstone-client
npm run typecheck                # Should pass
npm run lint                     # Should pass
npm run build                    # Should succeed

# Manual test
npm run dev
# → Navigate to localhost:3000
# → Click "Launch Demo"
# → Should land on dashboard without errors
# → Create a workspace
# → Add an ENV_VAR artifact
# → Verify it saves and displays
```

**Deliverables**:
- ✅ Deployable to staging environment
- ✅ Demo ready for recruiters/stakeholders
- ✅ No critical security vulnerabilities
- ✅ All P0 tasks marked complete in TODO.md

**Time Estimate**: ~4 hours  
**Outcome**: Working demo, deployable to staging, demo-ready for evaluation

---

### Sprint 2: Security & Stability - "Make It Safe" (Week 2)

**Goal**: Harden security for production deployment  
**Duration**: 1 day (6 hours of focused work)  
**Team Size**: 1-2 developers  
**Prerequisites**: Sprint 1 must be complete

**Tasks** (can be parallelized):

**Security Hardening** (3 hours):
1. [ ] **SEC-003**: Input sanitization (1 hour)
   - Add content/URL validation
   - Block XSS attempts
   - Test with malicious inputs
2. [ ] **SEC-004**: Rate limiting (1 hour)
   - Add django-ratelimit dependency
   - Apply to auth endpoints
   - Test with repeated requests
3. [ ] **CODE-001**: Protected member fix (30 min)
   - Replace firebase_admin._apps usage
   - Use public API

**Performance & Stability** (3 hours):
4. [ ] **PERF-001**: Token caching simplification (1 hour)
   - Refactor AuthContext retry logic
   - Remove tight polling
   - Test navigation flows
5. [ ] **PERF-002**: Exception handling (2 hours)
   - Replace broad `except Exception`
   - Add specific exception types
   - Add logging to all handlers
   - Write tests for error cases

**Parallelization Strategy**:
- Developer 1: Security tasks (SEC-003, SEC-004, CODE-001)
- Developer 2: Performance tasks (PERF-001, PERF-002)
- Solo developer: Do security first (higher priority)

**Success Metrics**:
- ✅ Can't inject `<script>` tags in artifacts
- ✅ 11th login attempt in an hour returns 429
- ✅ No pylint warnings about _apps usage
- ✅ Token refresh only happens when needed
- ✅ Errors are logged with useful context
- ✅ All tests still pass

**Testing Checklist**:
```bash
# Security tests
curl -X POST http://localhost:8000/api/v1/workspaces/1/artifacts/ \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "<script>alert(1)</script>"}'
# → Should return validation error

# Rate limiting test
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/v1/auth/demo/login/
done
# → 11th request should return 429

# Performance test
# → Navigate around app and check network tab
# → Token should refresh maximum once per session
```

**Code Review Checklist**:
- [ ] All `except Exception` replaced with specific types
- [ ] All validation errors have clear messages
- [ ] Rate limiting applied to all auth endpoints
- [ ] No protected member access (_attribute)
- [ ] Token caching doesn't have race conditions
- [ ] All error handlers include logging

**Deliverables**:
- ✅ Production-grade security hardening
- ✅ Improved error handling and logging
- ✅ Performance optimizations
- ✅ All P1 tasks marked complete

**Time Estimate**: ~6 hours  
**Outcome**: Production-ready security, stable error handling, optimized performance

---

### Sprint 3: API & Testing - "Make It Reliable" (Week 3)

**Goal**: Add comprehensive testing and type safety  
**Duration**: 2 days (12 hours of focused work)  
**Team Size**: 2-3 developers  
**Prerequisites**: Sprint 1 and 2 complete

**Day 1: API Layer & Types** (6 hours):
1. [ ] **API-002**: Type definitions (1 hour)
   - Create comprehensive TypeScript interfaces
   - Document all API shapes
   - Export from central location
2. [ ] **API-001**: TypeScript API wrappers (4 hours)
   - Wrap all endpoints with type-safe functions
   - Add JSDoc comments
   - Handle edge cases
   - Export clean public API
3. [ ] **LOG-001**: Logging strategy (1 hour)
   - Configure Django LOGGING
   - Add log levels
   - Set up handlers

**Day 2: Testing** (6 hours):
4. [ ] **TEST-001**: Auth flow tests (3 hours)
   - Test token verification
   - Test demo mode
   - Test error cases
   - Achieve 80% coverage
5. [ ] **TEST-002**: ViewSet tests (3 hours)
   - Test all CRUD operations
   - Test permissions
   - Test filtering/search
   - Achieve 80% coverage

**Parallelization Strategy**:
- Developer 1: API-002 → API-001
- Developer 2: LOG-001 → TEST-001
- Developer 3: TEST-002
- If 2 devs: Split Day 1 and Day 2 work
- If 1 dev: Follow the order above

**Success Metrics**:
- ✅ All API functions have TypeScript types
- ✅ IntelliSense works in IDE for all API calls
- ✅ Backend test coverage >80%
- ✅ All tests pass
- ✅ Logs provide useful debugging info
- ✅ No `any` types in API layer

**Testing Checklist**:
```bash
# Backend tests
cd capstone-server
python manage.py test -v 2
# → All tests pass
# → Coverage report shows >80%

coverage run --source='.' manage.py test
coverage report
# → auth_firebase: >80%
# → workspaces: >80%
# → artifacts: >80%

# Frontend type checking
cd ../capstone-client
npm run typecheck
# → Zero errors

# Verify types work in IDE
# → Open any component
# → Start typing API call
# → Should see IntelliSense with types
```

**Code Quality Checklist**:
- [ ] All API functions have JSDoc comments
- [ ] All TypeScript interfaces exported
- [ ] Test cases cover success and error paths
- [ ] Tests use realistic data
- [ ] Log messages are actionable
- [ ] No hardcoded values in tests
- [ ] All tests are deterministic

**Deliverables**:
- ✅ Type-safe API layer with full IntelliSense
- ✅ 80%+ backend test coverage
- ✅ Production-ready logging configuration
- ✅ Comprehensive auth and ViewSet tests
- ✅ All P1 API tasks complete

**Documentation**:
- Update README with testing instructions
- Document API types in code comments
- Create testing best practices doc

**Time Estimate**: ~12 hours  
**Outcome**: Type-safe frontend, well-tested backend, production logging

---

### Sprint 4: Quality & Polish - "Make It Beautiful" (Week 4)

**Goal**: Clean code, excellent developer experience  
**Duration**: 2 days (10 hours of focused work)  
**Team Size**: 2 developers  
**Prerequisites**: Sprints 1, 2, and 3 complete

**Day 1: Code Quality** (5 hours):
1. [ ] **LINT-001 → LINT-004**: Fix all linter issues (2 hours)
   - Remove unused imports
   - Fix argument naming
   - Fix variable redefinition
   - Add exception chaining
2. [ ] **ARCH-002**: Firebase config consolidation (2 hours)
   - Choose one initialization method
   - Remove duplicate code
   - Update documentation
3. [ ] **ARCH-003**: Error boundaries (1 hour)
   - Add global error boundary
   - Add page-level error handling
   - Test error scenarios

**Day 2: Frontend Testing & Architecture** (5 hours):
4. [ ] **TEST-003**: Frontend unit tests (4 hours)
   - Setup Jest + React Testing Library
   - Test AuthContext
   - Test key components
   - Test hooks
   - Achieve 70% coverage
5. [ ] **ARCH-001**: Middleware decision (1 hour)
   - Decide: implement or remove
   - Document decision
   - Implement if chosen

**Success Metrics**:
- ✅ `pylint` runs with zero warnings
- ✅ Frontend test coverage >70%
- ✅ Errors show user-friendly pages
- ✅ Firebase initialization is clean
- ✅ Code is well-organized

**Testing Checklist**:
```bash
# Backend linting
cd capstone-server
pylint **/*.py --max-warnings=0
# → Zero warnings

# Frontend testing
cd ../capstone-client
npm test -- --coverage
# → 70%+ coverage
# → All tests pass

npm run lint
# → Zero warnings
```

**Deliverables**:
- ✅ Zero linting warnings
- ✅ Clean error handling UI
- ✅ Frontend test suite
- ✅ Consolidated Firebase config
- ✅ Documented architecture decisions

**Time Estimate**: ~10 hours  
**Outcome**: Clean, well-tested codebase ready for production

---

### Sprint 5: Production Launch - "Make It Live" (Week 5)

**Goal**: Deploy to production with confidence  
**Duration**: 1 day (6 hours of focused work)  
**Team Size**: 1-2 developers  
**Prerequisites**: All previous sprints complete

**Morning: Automation & Scanning** (3 hours):
1. [ ] **TEST-005**: CI/CD pipeline (2 hours)
   - Create GitHub Actions workflows
   - Configure automated testing
   - Setup deployment checks
   - Test on PR
2. [ ] **SEC-005**: Vulnerability scanning (1 hour)
   - Add `safety` to backend CI
   - Add `npm audit` to frontend CI
   - Fix any critical vulnerabilities
   - Setup automated scanning

**Afternoon: Documentation & Deployment** (3 hours):
3. [ ] **DX-003**: API documentation UI (30 min)
   - Deploy Swagger UI
   - Configure drf-spectacular
   - Test API docs
4. [ ] **DOC-003**: Environment variables doc (1 hour)
   - Document all required env vars
   - Add descriptions and examples
   - Include security notes
5. [ ] **DOC-004**: Deployment runbook (1.5 hours)
   - Write step-by-step deployment guide
   - Include rollback procedures
   - Add troubleshooting section
   - Test deployment following guide

**Success Metrics**:
- ✅ CI runs on every PR
- ✅ No known vulnerabilities
- ✅ API documentation accessible
- ✅ Complete deployment guide
- ✅ Successful production deployment

**Pre-Launch Checklist**:
```bash
# 1. Verify all tests pass
cd capstone-server && python manage.py test
cd capstone-client && npm test

# 2. Run security checks
cd capstone-server && safety check
cd capstone-client && npm audit --production

# 3. Deployment check
cd capstone-server
python manage.py check --deploy
# → All checks pass

# 4. Build verification
cd capstone-client
npm run build
# → Builds successfully

# 5. Environment verification
# → All required env vars documented
# → All env vars set in production
# → Secrets properly secured

# 6. Smoke tests on staging
# → Can load homepage
# → Can login
# → Can create workspace
# → Can create artifacts
# → Demo mode works

# 7. Monitoring setup
# → Error tracking configured
# → Logs accessible
# → Performance monitoring active
```

**Launch Day Checklist**:
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Run smoke tests on production
- [ ] Verify DNS/SSL configured
- [ ] Check error tracking working
- [ ] Monitor logs for issues
- [ ] Test key user flows
- [ ] Verify demo mode works
- [ ] Send announcement

**Rollback Plan**:
```bash
# If issues found in production:
1. Note the issue and user impact
2. Revert to previous deployment
3. Verify previous version works
4. Fix issue in staging
5. Re-test thoroughly
6. Deploy again
```

**Deliverables**:
- ✅ Automated CI/CD pipeline
- ✅ Security vulnerability scanning
- ✅ API documentation live
- ✅ Complete environment variable docs
- ✅ Deployment runbook tested
- ✅ **PRODUCTION DEPLOYMENT** 🚀

**Post-Launch**:
- Monitor error rates for 24 hours
- Check performance metrics
- Gather user feedback
- Create backlog for improvements
- Celebrate the launch! 🎉

**Time Estimate**: ~6 hours  
**Outcome**: Production deployment with confidence, comprehensive documentation

---

## 🎯 Definition of Done

### For Each Task

- [ ] Code implemented and tested locally
- [ ] Linter passes (no new warnings)
- [ ] Type checker passes (TypeScript/mypy)
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if public API changed)
- [ ] PR reviewed and approved
- [ ] Merged to main branch

### For Each Sprint

- [ ] All sprint tasks completed
- [ ] Regression testing passed
- [ ] Deployed to staging
- [ ] Smoke tests passed
- [ ] Sprint retrospective completed

---

## 📊 Progress Tracking

**Last Updated**: October 18, 2025

| Priority  | Total  | Completed | In Progress | Blocked | Not Started |
| --------- | ------ | --------- | ----------- | ------- | ----------- |
| P0        | 5      | 0         | 0           | 0       | 5           |
| P1        | 7      | 0         | 0           | 0       | 7           |
| P2        | 15     | 0         | 0           | 0       | 15          |
| P3        | 18     | 0         | 0           | 0       | 18          |
| **Total** | **45** | **0**     | **0**       | **0**   | **45**      |

---

## 🔗 Related Documents

- [Analyze.md](./Analyze.md) - Detailed analysis findings
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [URGENT_FIREBASE_FIX.md](./URGENT_FIREBASE_FIX.md) - Firebase credential setup

---

## 📝 Notes

- **Prioritization**: P0 tasks MUST be completed before any production deployment
- **Dependencies**: Some tasks depend on others - check before starting
- **Time Estimates**: Based on single developer, may vary with team size
- **Testing**: All code changes should include tests where applicable
- **Documentation**: Update relevant docs when changing public APIs or configs

---

## 🤖 Automation Opportunities

### Quick Wins (High ROI, Low Effort)

1. **Pre-commit Hooks** (P3-DX-001)
   - Auto-format with Black, Prettier
   - Run linters before commit
   - Block commits with errors
   - **Time to setup**: 30 min
   - **Time saved**: 2-3 hours/week

2. **GitHub Actions CI** (P2-TEST-005)
   - Automated testing on every PR
   - Deployment checks before merge
   - Security scanning
   - **Time to setup**: 2 hours
   - **Time saved**: 5+ hours/week

3. **Dependency Updates** (Dependabot)
   - Automated security patches
   - Keep dependencies current
   - Reduce technical debt
   - **Time to setup**: 15 min
   - **Time saved**: 1 hour/week

### Medium-Term Automation

4. **API Documentation Generation** (P3-DX-003)
   - Auto-generate from Django REST Framework
   - Deploy Swagger UI
   - Always up-to-date docs

5. **Database Seeding** (P3-DX-005)
   - Automated dev environment setup
   - Consistent test data
   - Faster onboarding

6. **Code Quality Dashboards**
   - CodeClimate or SonarQube
   - Track technical debt over time
   - Visualize test coverage

---

## 🔧 Troubleshooting Common Issues

### Backend Issues

**Problem**: `SECRET_KEY not set` error
```bash
Solution:
1. Copy .env.example to .env
2. Generate key: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
3. Add to .env: SECRET_KEY=<generated-key>
```

**Problem**: Firebase authentication fails
```bash
Solution:
1. Check FIREBASE_* env vars are set
2. Verify credentials file exists and is valid JSON
3. Test: python manage.py shell
   >>> import firebase_admin
   >>> firebase_admin.get_app()
4. Should not raise ValueError
```

**Problem**: Tests fail with database errors
```bash
Solution:
1. Delete db.sqlite3
2. python manage.py migrate
3. python manage.py test
```

**Problem**: `ModuleNotFoundError` on import
```bash
Solution:
1. Activate venv: source .venv/bin/activate
2. pip install -r requirements.txt
3. Verify: pip list | grep <module-name>
```

### Frontend Issues

**Problem**: TypeScript compilation errors
```bash
Solution:
1. npm run typecheck -- to see specific errors
2. Check all imports have matching files
3. Verify @types/* packages installed
4. Clear cache: rm -rf .next && npm run dev
```

**Problem**: Firebase initialization failed
```bash
Solution:
1. Check all NEXT_PUBLIC_FIREBASE_* vars in .env.local
2. Verify API key is real (starts with AIzaSy, 30+ chars)
3. Check browser console for specific Firebase errors
4. See CONFIG-001 for full setup guide
```

**Problem**: API calls return 401 Unauthorized
```bash
Solution:
1. Check user is logged in (useAuth().user)
2. Verify Bearer token in network tab
3. Check backend ALLOWED_HOSTS includes frontend domain
4. Verify Firebase service account configured in backend
```

**Problem**: Next.js build fails
```bash
Solution:
1. npm run lint -- fix any warnings
2. npm run typecheck -- fix type errors
3. Check for dynamic imports without proper loading states
4. Clear cache: rm -rf .next node_modules && npm install
```

### Deployment Issues

**Problem**: Railway deployment fails
```bash
Solution:
1. Check all required env vars are set in Railway dashboard
2. Verify SECRET_KEY is strong (not django-insecure-*)
3. Set DEBUG=False
4. Check logs: railway logs
```

**Problem**: Vercel deployment fails
```bash
Solution:
1. Verify all NEXT_PUBLIC_* vars set in Vercel dashboard
2. Check build logs for specific errors
3. Ensure API_BASE_URL points to production backend
4. Review vercel.json configuration
```

---

## 📚 Glossary

**Terms & Abbreviations**:

- **P0/P1/P2/P3**: Priority levels (Critical/High/Medium/Low)
- **ROI**: Return on Investment
- **DRF**: Django REST Framework
- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **CORS**: Cross-Origin Resource Sharing
- **CSRF**: Cross-Site Request Forgery
- **XSS**: Cross-Site Scripting
- **JWT**: JSON Web Token
- **UID**: User Identifier
- **ENV_VAR**: Environment Variable artifact type
- **PROMPT**: Code prompt artifact type
- **DOC_LINK**: Documentation link artifact type

**Project-Specific Terms**:

- **Workspace**: Container for artifacts, scoped to one user
- **Artifact**: Any ENV_VAR, PROMPT, or DOC_LINK item
- **Environment**: DEV, STAGING, or PROD context for artifacts
- **Demo Mode**: Public access mode with pre-configured demo user
- **Firebase UID**: Unique identifier from Firebase Authentication
- **Custom Token**: Backend-generated token for demo authentication

---

## 🎯 Decision Log

### Architecture Decisions

**AD-001: Firebase for Authentication** (October 2025)
- **Decision**: Use Firebase Authentication instead of Django sessions
- **Rationale**: 
  - Simplifies frontend auth state management
  - Provides secure token-based auth
  - Reduces backend complexity
  - Industry-standard solution
- **Trade-offs**: External dependency, requires Firebase account
- **Status**: ✅ Implemented

**AD-002: Monorepo Structure** (October 2025)
- **Decision**: Keep backend and frontend in same repo
- **Rationale**:
  - Easier coordination during initial development
  - Atomic commits across stack
  - Simplified deployment scripts
- **Trade-offs**: Larger repo, mixed language tooling
- **Status**: ✅ Implemented
- **Future**: Consider splitting after v1.0

**AD-003: SQLite for Development** (October 2025)
- **Decision**: Use SQLite locally, PostgreSQL in production
- **Rationale**:
  - Zero-config local development
  - Easy to reset/seed
  - PostgreSQL for production performance
- **Trade-offs**: Different DB engines can cause subtle bugs
- **Status**: ✅ Implemented
- **Mitigation**: Extensive testing on staging (PostgreSQL)

**AD-004: Demo Mode via Custom Tokens** (October 2025)
- **Decision**: Demo mode uses Firebase custom tokens, not separate session auth
- **Rationale**:
  - Single authentication code path
  - Simpler to maintain
  - Works with existing AuthContext
- **Trade-offs**: Requires Firebase Admin SDK in backend
- **Status**: ⏳ In Progress (see APP-002)

### Technology Decisions

**TD-001: Next.js 15 with App Router** (October 2025)
- **Decision**: Use Next.js 15 App Router (not Pages Router)
- **Rationale**:
  - Latest React features (Server Components)
  - Better performance
  - Future-proof architecture
- **Trade-offs**: Steeper learning curve, some ecosystem gaps
- **Status**: ✅ Implemented

**TD-002: Tailwind CSS v4** (October 2025)
- **Decision**: Use Tailwind CSS v4 (beta)
- **Rationale**: 
  - Rapid UI development
  - Consistent design system
  - Small bundle size
- **Trade-offs**: v4 is still beta, breaking changes possible
- **Status**: ✅ Implemented
- **Risk**: Monitor for v4 stable release, be ready to adapt

**TD-003: No State Management Library** (October 2025)
- **Decision**: Use React Context for state, no Redux/Zustand
- **Rationale**:
  - Simple app, doesn't need heavy state management
  - Contexts sufficient for auth and workspace
  - Reduces bundle size and complexity
- **Trade-offs**: May need to refactor if app grows significantly
- **Status**: ✅ Implemented
- **Future**: Consider React Query for server state if needed

---

## 🔗 Related Resources

### Internal Documentation
- [Analyze.md](./Analyze.md) - Code analysis findings
- [CLAUDE.md](./CLAUDE.md) - Project architecture guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions
- [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [URGENT_FIREBASE_FIX.md](./URGENT_FIREBASE_FIX.md) - Firebase credential setup
- [GET_FIREBASE_CREDENTIALS.md](./GET_FIREBASE_CREDENTIALS.md) - Firebase guide
- [DEMO_LOGIN_DEBUG.md](./DEMO_LOGIN_DEBUG.md) - Demo login troubleshooting

### External Resources
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Next.js Production Best Practices](https://nextjs.org/docs/deployment)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Tools & Libraries
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Axios](https://axios-http.com/)
- [React Query](https://tanstack.com/query/latest) - Recommended for P3-OPT-001

---

## 📈 Progress Tracking Dashboard

### Current Sprint: Critical Fixes (P0)

```
Progress: ████░░░░░░░░░░░░░░░░ 20% (1/5 complete)

✅ [Completed]  None yet
🔄 [In Progress] None yet
⏳ [Blocked]     None
🎯 [Next Up]     SEC-001, SEC-002, APP-001, APP-002, CONFIG-001
```

### Velocity Metrics

**Estimated** (based on time estimates):
- P0: 4 hours → 1 day for 1 developer
- P1: 6 hours → 1 day for 1 developer
- P2: 30 hours → 1 week for 1 developer
- P3: 80 hours → 2-3 weeks for 1 developer

**Actual**: (to be tracked as tasks complete)
- Will update as work progresses
- Use for future sprint planning

### Definition of "Done"

For a task to be considered complete, ALL of the following must be true:

- [ ] ✅ Code implemented and working locally
- [ ] ✅ All tests pass (existing + new tests)
- [ ] ✅ Linters pass with zero warnings
- [ ] ✅ TypeScript compilation succeeds (frontend)
- [ ] ✅ Manual testing completed per checklist
- [ ] ✅ Documentation updated (if public API changed)
- [ ] ✅ PR created and reviewed
- [ ] ✅ PR approved by at least 1 reviewer
- [ ] ✅ Merged to main branch
- [ ] ✅ Deployed to staging environment
- [ ] ✅ Smoke tests pass on staging
- [ ] ✅ Task marked as complete in this TODO

---

## 🎯 Success Criteria by Milestone

### Milestone 1: MVP - Functional Demo (P0 Complete)
**Target**: Week 1  
**Criteria**:
- ✅ Application compiles and runs
- ✅ Authentication works end-to-end
- ✅ Demo login functional
- ✅ No critical security vulnerabilities
- ✅ Can create workspaces and artifacts
- ✅ All P0 tasks complete

### Milestone 2: Production Ready (P0 + P1 Complete)
**Target**: Week 2  
**Criteria**:
- ✅ All P0 criteria met
- ✅ Security hardened (rate limiting, input validation)
- ✅ Performance optimized (no obvious bottlenecks)
- ✅ Error handling comprehensive
- ✅ Can handle production load
- ✅ All P1 tasks complete

### Milestone 3: Quality Codebase (P0 + P1 + P2 Complete)
**Target**: Month 1  
**Criteria**:
- ✅ All P0 and P1 criteria met
- ✅ Test coverage >70%
- ✅ No linting warnings
- ✅ Clean code architecture
- ✅ Comprehensive documentation
- ✅ CI/CD pipeline functional
- ✅ All P2 tasks complete

### Milestone 4: Feature Complete (All Priorities Complete)
**Target**: Month 2  
**Criteria**:
- ✅ All previous milestones met
- ✅ All nice-to-have features implemented
- ✅ Developer experience optimized
- ✅ Full test coverage
- ✅ Production monitoring setup
- ✅ All P3 tasks complete

---

**Maintained by**: Development Team  
**Review Frequency**: Weekly (Fridays 3pm)  
**Next Review**: October 25, 2025  
**Version**: 2.0 (Enhanced for Excellence)  
**Contributors**: See Git history for all contributors

---

**📝 Document Change Log**:
- **v2.0** (Oct 19, 2025) - Major enhancement: Added executive summary, getting started guide, troubleshooting, decision log, glossary, automation suggestions, risk assessment
- **v1.0** (Oct 18, 2025) - Initial version with 45 tasks across 4 priority levels
