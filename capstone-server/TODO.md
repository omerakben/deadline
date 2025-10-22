# DEADLINE MVP Critical Fixes

**Total Estimated Time: 6 hours**
**Goal: Ship production-ready MVP after these 2 critical fixes**

> **Context**: This checklist contains ONLY MVP-blocking items. All other improvements (performance optimization, monitoring, refactoring) are deferred to Phase 2 post-user-validation. See `claudedocs/code-analysis-ultrathink-2025.md` for full analysis.

---

## ✅ Critical Fix #1: Audit Logging for ENV_VAR Access (4 hours)

**Why Critical**: Revealing sensitive environment variables without audit trails creates trust/accountability issues for day-1 users.

### Step 1.1: Create ArtifactAccessLog Model

**File**: `capstone-server/artifacts/models.py`

**Action**: Add new model at end of file (after Artifact model):

```python
class ArtifactAccessLog(models.Model):
    """Audit log for sensitive artifact operations (especially ENV_VAR reveals)"""

    artifact = models.ForeignKey(
        Artifact,
        on_delete=models.CASCADE,
        related_name="access_logs",
        help_text="The artifact that was accessed"
    )

    action = models.CharField(
        max_length=50,
        choices=[
            ("REVEAL_VALUE", "Revealed ENV_VAR value"),
            ("CREATE", "Created artifact"),
            ("UPDATE", "Updated artifact"),
            ("DELETE", "Deleted artifact"),
        ],
        help_text="Type of action performed"
    )

    user_uid = models.CharField(
        max_length=128,
        help_text="Firebase UID of user who performed action"
    )

    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of request"
    )

    user_agent = models.TextField(
        blank=True,
        help_text="User agent string from request"
    )

    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text="When the action occurred"
    )

    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Additional context (e.g., changed fields, reason)"
    )

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["artifact", "-timestamp"]),
            models.Index(fields=["user_uid", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.action} on {self.artifact.kind} by {self.user_uid} at {self.timestamp}"
```

**Acceptance Criteria**:
- Model added to `artifacts/models.py`
- All fields properly typed with help_text
- Indexes created for performance

---

### Step 1.2: Create Migration

**Command**: From `capstone-server/` directory:

```bash
python manage.py makemigrations artifacts -n add_artifact_access_log
python manage.py migrate
```

**Acceptance Criteria**:
- Migration file created in `artifacts/migrations/`
- Migration applies without errors
- Table `artifacts_artifactaccesslog` exists in database

---

### Step 1.3: Add IP Address Utility

**File**: `capstone-server/artifacts/views.py`

**Action**: Add utility function at top of file (after imports, before ArtifactViewSet):

```python
def get_client_ip(request):
    """Extract client IP from request, handling proxy headers"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Get first IP in chain (client IP before proxies)
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
```

**Acceptance Criteria**:
- Function added before ArtifactViewSet class
- Handles both direct and proxied requests

---

### Step 1.4: Add Audit Logging Import

**File**: `capstone-server/artifacts/views.py`

**Action**: Update imports at top of file:

```python
from .models import (
    Artifact,
    WorkspaceEnvironment,
    Template,
    ArtifactAccessLog,  # Add this line
)
```

**Acceptance Criteria**:
- Import added without syntax errors

---

### Step 1.5: Modify reveal_value Endpoint

**File**: `capstone-server/artifacts/views.py`

**Action**: Replace the `reveal_value` method (lines 166-192) with:

```python
@action(detail=True, methods=["get"], url_path="reveal_value")
def reveal_value(self, request, *args, **kwargs):
    """
    Reveal the sensitive value of an ENV_VAR artifact.
    Logs access for audit trail.
    """
    artifact = self.get_object()

    if artifact.kind != "ENV_VAR":
        return Response(
            {"error": "Not an environment variable"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create audit log entry
    ArtifactAccessLog.objects.create(
        artifact=artifact,
        action="REVEAL_VALUE",
        user_uid=request.user,  # FirebaseAuthentication sets request.user to UID string
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        metadata={
            'workspace_id': artifact.workspace_id,
            'workspace_env_id': artifact.workspace_env_id,
            'artifact_key': artifact.key,
        }
    )

    return Response({
        "id": artifact.id,
        "key": artifact.key,
        "value": artifact.value,
        "is_secret": artifact.is_secret,
        "workspace_env": artifact.workspace_env_id,
    })
```

**Acceptance Criteria**:
- Old reveal_value method replaced
- Audit log created BEFORE returning value
- All original response fields preserved
- IP address and user agent captured

---

### Step 1.6: Test Audit Logging

**Manual Test Steps**:

1. Start Django server: `python manage.py runserver`
2. Make authenticated request to reveal an ENV_VAR:
   ```bash
   curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
        http://localhost:8000/api/artifacts/{artifact_id}/reveal_value/
   ```
3. Check Django admin or database for ArtifactAccessLog entry
4. Verify log contains: artifact_id, user_uid, ip_address, timestamp

**Acceptance Criteria**:
- ✅ Audit log entry created for each reveal_value call
- ✅ Log contains user_uid, IP address, user_agent
- ✅ Log metadata includes workspace context
- ✅ Endpoint returns value as before (no breaking changes)

---

## ✅ Critical Fix #2: Rate Limiting Enforcement (2 hours)

**Why Critical**: Without rate limiting, API endpoints are vulnerable to abuse/brute-force attacks, creating security liability for day-1 users.

### Step 2.1: Verify django-ratelimit Installation

**File**: `capstone-server/requirements.txt`

**Action**: Confirm line exists:
```
django-ratelimit==4.1.0
```

**If missing**, add it and run:
```bash
pip install -r requirements.txt
```

**Acceptance Criteria**:
- django-ratelimit in requirements.txt
- Package installed in virtual environment

---

### Step 2.2: Configure Rate Limiting in Settings

**File**: `capstone-server/deadline_api/settings.py`

**Action**: Add at end of file (before or after CORS settings):

```python
# Rate Limiting Configuration
# Enable rate limiting globally
RATELIMIT_ENABLE = True

# Use cache backend for rate limit storage (default: 'default' cache)
RATELIMIT_USE_CACHE = 'default'

# Key function: rate limit per authenticated user (Firebase UID)
# For anonymous users, falls back to IP address
def ratelimit_key(group, request):
    """Generate rate limit key from Firebase UID or IP address"""
    if hasattr(request, 'user') and request.user:
        return f"user:{request.user}"  # request.user is Firebase UID string
    return request.META.get('REMOTE_ADDR', 'unknown')

RATELIMIT_KEY_FUNC = 'deadline_api.settings.ratelimit_key'
```

**Acceptance Criteria**:
- RATELIMIT_ENABLE = True
- Custom key function defined
- Rate limiting per Firebase UID (not per IP)

---

### Step 2.3: Add Rate Limiting to reveal_value

**File**: `capstone-server/artifacts/views.py`

**Action**: Add import at top of file:
```python
from django_ratelimit.decorators import ratelimit
```

Then modify the `reveal_value` method decorator:

```python
@ratelimit(key='user', rate='10/m', method='GET', block=True)
@action(detail=True, methods=["get"], url_path="reveal_value")
def reveal_value(self, request, *args, **kwargs):
    """
    Reveal the sensitive value of an ENV_VAR artifact.
    Rate limited to 10 requests per minute per user.
    Logs access for audit trail.
    """
    # ... rest of method stays the same
```

**Explanation**:
- `key='user'`: Rate limit per authenticated user (uses RATELIMIT_KEY_FUNC)
- `rate='10/m'`: 10 requests per minute
- `method='GET'`: Only limit GET requests
- `block=True`: Return 429 error when limit exceeded (don't just warn)

**Acceptance Criteria**:
- @ratelimit decorator added above @action decorator
- Rate limit: 10 requests/minute per user
- Returns 429 status when limit exceeded

---

### Step 2.4: Add Rate Limiting to Search Endpoint

**File**: `capstone-server/artifacts/views.py`

**Action**: Find the `list` method or search functionality (around lines 148-156) and add decorator:

```python
@ratelimit(key='user', rate='60/h', method='GET', block=True)
def list(self, request, *args, **kwargs):
    """
    List artifacts with optional search.
    Rate limited to 60 requests per hour per user.
    """
    # ... existing list/search logic
```

**Note**: If search is in a separate `@action` method, apply decorator there instead.

**Acceptance Criteria**:
- Search endpoint rate limited to 60 requests/hour per user
- Returns 429 status when limit exceeded

---

### Step 2.5: Test Rate Limiting

**Manual Test Steps**:

1. Start Django server: `python manage.py runserver`
2. Make 11 rapid requests to reveal_value endpoint:
   ```bash
   for i in {1..11}; do
     curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
          http://localhost:8000/api/artifacts/{artifact_id}/reveal_value/
     echo "Request $i"
   done
   ```
3. Verify 11th request returns 429 Too Many Requests
4. Wait 60 seconds, verify request succeeds again

**Acceptance Criteria**:
- ✅ First 10 requests succeed (200 OK)
- ✅ 11th request returns 429 Too Many Requests
- ✅ Rate limit resets after 1 minute
- ✅ Error response includes helpful message

---

## 🚀 Final MVP Validation Checklist

Before shipping, verify:

- [ ] **Audit Logging Works**:
  - [ ] ArtifactAccessLog table exists in database
  - [ ] Revealing ENV_VAR creates log entry
  - [ ] Log includes user_uid, IP address, timestamp
  - [ ] Django admin can view logs (optional but nice)

- [ ] **Rate Limiting Works**:
  - [ ] 11th reveal_value call in 1 minute returns 429
  - [ ] 61st search call in 1 hour returns 429
  - [ ] Rate limits reset after time window
  - [ ] Different users have separate rate limits

- [ ] **No Breaking Changes**:
  - [ ] Frontend can still reveal ENV_VARs
  - [ ] API responses unchanged (except 429 errors)
  - [ ] All existing tests still pass
  - [ ] No performance degradation

- [ ] **Documentation Updated**:
  - [ ] API docs mention rate limits (10/min for reveals, 60/hour for search)
  - [ ] README updated with audit logging feature
  - [ ] CHANGELOG.md entry for v1.0 MVP release

---

## 📝 Post-Implementation Notes

**What's Deferred to Phase 2** (after user validation):

- Performance optimization (O(n) search → Elasticsearch)
- Token caching (100ms overhead per request)
- Security headers (HSTS, CSP, X-Content-Type-Options)
- File size refactoring (views.py 492 lines → split)
- Monitoring/observability (Sentry, metrics)
- Advanced features (bulk operations, templates)

**Next Steps After MVP Ships**:

1. Deploy to Railway (backend) + Vercel (frontend)
2. Monitor audit logs for actual usage patterns
3. Gather user feedback on pain points
4. Review `claudedocs/code-analysis-ultrathink-2025.md` for Phase 2 roadmap
5. Scale only if/when users validate the product

---

**Estimated Total Time**: 6 hours (4h audit logging + 2h rate limiting)

**Success Criteria**: Both critical fixes implemented, tested, and deployed. No other blockers for MVP launch.
