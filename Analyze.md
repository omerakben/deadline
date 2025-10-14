Critical Findings

page.tsx (40), page.tsx (18), AuthGuard.tsx (~33) — What: these client components call server-only redirect() (one even during render). Why: on Next 15 this throws NEXT_REDIRECT on the client, so healthy sign-in/out flows crash instead of navigating. How: swap to const router = useRouter(); router.replace(...) inside effects or move the guard logic to server components/route handlers; keep AuthGuard returning null while routing. When: before the next release. Verification: run through /, /login, and protected routes in the browser and confirm smooth navigation with no console errors; npm run lint should stop flagging redirect() in client code.
High Priority

src/lib/demo.ts, page.tsx (~105) — What: “Launch Demo” hits /api/v1/auth/demo/login/ and just window.location.href = '/dashboard', but Firebase auth never receives a user, so AuthGuard immediately bounces back to /login; it also depends on NEXT_PUBLIC_API_URL, defaulting to http://localhost:8000, which breaks in non-local environments. Why: recruiters evaluating the app cannot access the demo experience. How: have the endpoint return a Firebase custom token (or ID token) and call signInWithCustomToken via useAuth, or teach AuthContext/AuthGuard to trust the demo cookie; consolidate env usage by relying on NEXT_PUBLIC_API_BASE_URL. When: address before sharing the demo externally. Verification: press “Launch Demo” → land on dashboard with useAuth().user?.email === 'demo@deadline.demo' and DemoBanner visible; smoke-test both local and hosted builds.
Medium Priority

page.tsx (~50) — What: the workspace discovery fallback assumes /workspaces/ returns a bare array; the live API is paginated ({count,results}), so deep-linking without workspaceId always fails. Why: users opening an edit link from notifications/bookmarks see “Missing workspace context.” How: reuse listWorkspaces() (already handles both shapes) or look for data.results before iterating. When: next iteration on artifact editing. Verification: open /artifacts/{id}/edit without query params and confirm the form resolves.
src/contexts/AuthContext.tsx, src/lib/env.ts, client.ts — What: validatePublicEnv omits several Firebase keys (STORAGE_BUCKET, MESSAGING_SENDER_ID, etc.) even though the config dereferences them with !. Why: missing values only surface as opaque Firebase initialization errors; the UI never shows the helpful config banner. How: extend validatePublicEnv() (and the error message) to include every non-optional key used in firebaseConfig. When: ahead of production rollout. Verification: temporarily remove one of those vars and ensure the config panel lists it explicitly.
src/hooks/useWorkspaces.ts, src/app/dashboard/page.tsx, src/app/settings/page.tsx, page.tsx — What: every consumer independently calls listWorkspaces() on mount, leading to 3–4 identical requests (plus additional fetches during Docs fallback). Why: unnecessary network pressure and UI jank as each page spins. How: memoize/cached fetch via React Query/SWR or lift the data into context so dashboard/settings/docs share a single request; consider adding metadata endpoints for dashboards. When: medium-term perf pass. Verification: capture network tab before/after; the number of /workspaces/ calls should drop to one per session.
index.ts vs artifacts.ts — What: artifact unions, env codes, and color maps are duplicated. Why: future edits risk divergence (one already has additional fields like tag_objects). How: merge into a single source (e.g., keep artifacts.ts and have other modules import from it). When: during the next refactor touching types. Verification: TypeScript compile and functionality unaffected; deleting the redundant file should be trivial.
docs.ts (listDocLinksGlobal) — What: fallback path fans out Promise.all over every workspace and pulls all DOC_LINK artifacts client-side. Why: as workspaces grow, this becomes an N-request waterfall and duplicates backend aggregation logic. How: ensure /docs/ is enabled on the server and surface errors early; if the fallback must remain, page through results and short-circuit when the server advertises pagination. When: after stabilizing the server endpoint. Verification: throttle network, ensure only the single /docs/ call is made.
Low Priority

page.tsx (~262) — What: the SVG path for the “eye-off” icon contains a stray newline (-.\n 32.75) so the icon renders incorrectly. Why: minor polish issue but noticeable in the form. How: replace with the canonical path string from lucide (d="M10.58 5.08A10.94...11 8-.32.75..."). When: while touching the login form next. Verification: visual check that the icon toggles correctly.
Architecture Notes

Auth is handled entirely client-side (Firebase) with Axios interceptors injecting ID tokens; there’s no SSR protection, so sensitive pages depend on AuthGuard. Consider re-enabling middleware or server components for initial gating to avoid flashes.
Data layer is thin wrappers around Axios; no caching, optimistic updates, or error boundary integration. Introducing a query client (TanStack) would simplify retries and dedupe requests.
Large client-only pages (workspace detail, artifact edit) mix data fetching, view logic, and mutation handling in single files >600 lines, increasing maintenance cost; splitting into hooks and presentational components would improve cohesion.
Performance & Data Flow

Repeated workspace fetches (see Medium issues) and per-artifact copy flows hitting the backend sequentially (handleCopy fetches each secret) could benefit from batching or server-delivered metadata (e.g., include workspace.enabled_environments in list responses).
Docs page loads both workspaces and doc links on mount; consider deferring workspace calls until the user needs them.
No client-side caching of API responses; every navigation refetches everything.
Security Review

No major OWASP-level findings surfaced beyond the broken redirect flow (which already blocks access). Token handling is centralized, errors are normalized. Ensure backend enforces authorization on /reveal_value/, /export/, and /import/ endpoints since secrets are fetched on demand.
Test Coverage

I couldn’t find any frontend unit/integration tests. Adding smoke tests around auth routing, workspace CRUD, and the demo button would prevent regressions like the current redirect and demo failures.
Dependencies

Next 15.5.2, React 19 RC, Firebase 12 — stay alert for API shifts (React 19 final may enforce stricter async boundaries). Tailwind v4 beta suggests incoming breaking changes; pin or monitor.
Open Questions

Does the backend expose a Firebase custom-token endpoint for demo users? If so, what format does it return?
Should /workspaces/ ever be paginated client-side, or can we guarantee small datasets for now?
Migration Strategy

Not required; each fix is localized. If adopting a query client, plan an incremental rollout (wrap existing hooks gradually) with feature-flagged components.
Next Steps

Replace client redirect() calls and retest auth flows.
Rework the demo login path to actually populate Firebase auth.
Harden workspace discovery and env validation while planning caching improvements.
