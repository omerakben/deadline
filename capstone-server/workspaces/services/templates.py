"""
Template seeding utilities for workspace onboarding.

Provides a reusable helper that can populate a user's account with
showcase workspaces covering common product, AI, and project operations
scenarios. The data is intentionally rich so recruiters or new users can
experience the platform without relying on shared credentials.
"""

from __future__ import annotations

import logging
from typing import Dict, Iterable, List

from artifacts.models import Artifact, Tag
from django.db import transaction

from workspaces.models import EnvironmentType, Workspace, WorkspaceEnvironment

logger = logging.getLogger(__name__)


SHOWCASE_TEMPLATES: List[Dict] = [
    {
        "name": "PRD Acme Full Stack Suite",
        "description": (
            "Acme's production control center featuring DEV, STAGING, and PROD "
            "environments with infrastructure runbooks, TODO prompts, and "
            "credential samples for a full-stack launch."
        ),
        "artifacts": [
            # Database Configurations
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "DATABASE_URL",
                "value": "postgresql://dev_user:dev_pass@localhost:5432/acme_dev",
                "notes": "Local development database connection for rapid iteration.",
                "tags": ["database", "development", "postgres"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "DATABASE_URL",
                "value": "postgresql://staging_user:staging_pass@staging-db.acme.internal:5432/acme_staging?sslmode=require",
                "notes": "Staging database with SSL for pre-production testing.",
                "tags": ["database", "staging", "postgres"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "DATABASE_URL",
                "value": "postgresql://prod_user:***REDACTED***@prod-db-primary.acme.com:5432/acme_production?sslmode=require&pool_size=20",
                "notes": "Production database with connection pooling. Never commit actual credentials!",
                "tags": ["database", "production", "critical"],
            },
            # API Endpoints
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "API_BASE_URL",
                "value": "http://localhost:8000/api/v1",
                "notes": "Local API endpoint for development.",
                "tags": ["api", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "API_BASE_URL",
                "value": "https://api-staging.acme.com/api/v1",
                "notes": "Staging API endpoint for integration testing.",
                "tags": ["api", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "API_BASE_URL",
                "value": "https://api.acme.com/api/v1",
                "notes": "Production API endpoint with CDN and rate limiting.",
                "tags": ["api", "production", "critical"],
            },
            # Redis Cache
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "REDIS_URL",
                "value": "redis://localhost:6379/0",
                "notes": "Local Redis instance for caching and sessions.",
                "tags": ["cache", "redis", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "REDIS_URL",
                "value": "redis://staging-redis.acme.internal:6379/0?ssl=true",
                "notes": "Staging Redis cluster with SSL.",
                "tags": ["cache", "redis", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "REDIS_URL",
                "value": "rediss://prod-redis-primary.acme.com:6380/0?ssl_cert_reqs=required",
                "notes": "Production Redis cluster with SSL and certificate validation.",
                "tags": ["cache", "redis", "production"],
            },
            # Stripe Payment Processing
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "STRIPE_SECRET_KEY",
                "value": "sk_test_51234567890abcdefghijklmnopqrstuvwxyz",
                "notes": "Stripe test mode secret key for local development.",
                "tags": ["payment", "stripe", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "STRIPE_SECRET_KEY",
                "value": "sk_test_51234567890zyxwvutsrqponmlkjihgfedcba",
                "notes": "Stripe test mode for staging environment (different key than dev).",
                "tags": ["payment", "stripe", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "STRIPE_SECRET_KEY",
                "value": "sk_live_***PRODUCTION_KEY_USE_SECRETS_MANAGER***",
                "notes": "LIVE Stripe key - must be stored in AWS Secrets Manager or similar.",
                "tags": ["payment", "stripe", "production", "critical"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "STRIPE_WEBHOOK_SECRET",
                "value": "whsec_dev123456789",
                "notes": "Webhook signing secret for local Stripe CLI.",
                "tags": ["payment", "stripe", "webhook"],
            },
            # AWS Services
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "AWS_S3_BUCKET",
                "value": "acme-dev-uploads",
                "notes": "S3 bucket for development file uploads.",
                "tags": ["aws", "storage", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "AWS_S3_BUCKET",
                "value": "acme-staging-uploads",
                "notes": "S3 bucket for staging uploads with lifecycle policies.",
                "tags": ["aws", "storage", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "AWS_S3_BUCKET",
                "value": "acme-production-uploads",
                "notes": "Production S3 bucket with versioning, encryption, and CDN.",
                "tags": ["aws", "storage", "production"],
            },
            # Feature Flags
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "FEATURE_NEW_DASHBOARD",
                "value": "true",
                "notes": "Enable new dashboard UI for all dev users.",
                "tags": ["feature-flag", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "FEATURE_NEW_DASHBOARD",
                "value": "true",
                "notes": "New dashboard enabled for staging QA testing.",
                "tags": ["feature-flag", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "FEATURE_NEW_DASHBOARD",
                "value": "false",
                "notes": "New dashboard disabled in prod - waiting for final approval.",
                "tags": ["feature-flag", "production"],
            },
            # Monitoring & Observability
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "SENTRY_DSN",
                "value": "https://abc123@o123456.ingest.sentry.io/7890123",
                "notes": "Sentry error tracking for production monitoring.",
                "tags": ["monitoring", "sentry", "production"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "DATADOG_API_KEY",
                "value": "***DATADOG_KEY_FROM_SECRETS_MANAGER***",
                "notes": "Datadog APM and metrics collection key.",
                "tags": ["monitoring", "datadog", "production"],
            },
            # Prompts
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "TODO: Implement User Onboarding Flow",
                "content": (
                    "You are building a seamless user onboarding experience.\n\n"
                    "Requirements:\n"
                    "- Multi-step form with validation (email, profile, preferences)\n"
                    "- Integration with Stripe for payment setup\n"
                    "- Email verification via SendGrid\n"
                    "- Progress tracking in Redis\n"
                    "- Analytics events to Mixpanel\n\n"
                    "Deliverables:\n"
                    "1. React components with TypeScript\n"
                    "2. API endpoints for each step\n"
                    "3. Unit tests with 80%+ coverage\n"
                    "4. End-to-end Playwright tests\n\n"
                    "Return: Task breakdown with estimates and dependencies."
                ),
                "notes": "Sprint planning item for Q1 2025.",
                "tags": ["todo", "planning", "onboarding"],
            },
            {
                "kind": "PROMPT",
                "environment": "STAGING",
                "title": "Staging Deployment Checklist",
                "content": (
                    "Pre-deployment verification checklist:\n\n"
                    "1. Database migrations tested on staging copy\n"
                    "2. Environment variables validated\n"
                    "3. Feature flags configured correctly\n"
                    "4. Smoke tests passed\n"
                    "5. Performance benchmarks within limits\n"
                    "6. Security scan completed (no HIGH/CRITICAL)\n"
                    "7. Rollback plan documented\n"
                    "8. Monitoring dashboards updated\n\n"
                    "Sign-off required from: Tech Lead, QA, DevOps"
                ),
                "notes": "Standard staging deployment procedure.",
                "tags": ["deployment", "checklist", "staging"],
            },
            # Documentation
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "Next.js App Router Documentation",
                "url": "https://nextjs.org/docs/app",
                "notes": "Official Next.js App Router guide for modern React patterns.",
                "tags": ["documentation", "nextjs", "frontend"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "Stripe Integration Guide",
                "url": "https://stripe.com/docs/payments/quickstart",
                "notes": "Stripe Payments API quickstart and best practices.",
                "tags": ["documentation", "stripe", "payment"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "PROD",
                "title": "Runbook: Zero-Downtime Deployment",
                "url": "https://docs.acme.com/runbooks/blue-green-deployment",
                "notes": "Operational playbook for production deployments with rollback procedures.",
                "tags": ["runbook", "operations", "deployment"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "PROD",
                "title": "Incident Response Playbook",
                "url": "https://docs.acme.com/playbooks/incident-response",
                "notes": "Step-by-step guide for production incidents and escalation paths.",
                "tags": ["runbook", "incident", "production"],
            },
        ],
    },
    {
        "name": "PRD AI Delivery Lab",
        "description": (
            "Reference workspace for AI feature delivery covering evaluation prompts, "
            "model governance, and production credential handling for inference with "
            "environment-specific configurations."
        ),
        "artifacts": [
            # AI Model API Keys
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "OPENAI_API_KEY",
                "value": "sk-proj-dev-1234567890abcdefghijklmnopqrstuvwxyz",
                "notes": "OpenAI API key for development experimentation.",
                "tags": ["ai", "openai", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "OPENAI_API_KEY",
                "value": "sk-proj-staging-zyxwvutsrqponmlkjihgfedcba",
                "notes": "OpenAI API key for staging evaluation and testing.",
                "tags": ["ai", "openai", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "OPENAI_API_KEY",
                "value": "sk-proj-***PRODUCTION_OPENAI_KEY***",
                "notes": "Production OpenAI key - rotate monthly via secrets manager.",
                "tags": ["ai", "openai", "production", "critical"],
            },
            # Anthropic Claude
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "ANTHROPIC_API_KEY",
                "value": "sk-ant-dev-1234567890",
                "notes": "Anthropic Claude API for dev testing and comparison.",
                "tags": ["ai", "anthropic", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "ANTHROPIC_API_KEY",
                "value": "sk-ant-***PROD_KEY***",
                "notes": "Production Claude API key for mission-critical workloads.",
                "tags": ["ai", "anthropic", "production"],
            },
            # Vector Database
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "PINECONE_API_KEY",
                "value": "pcsk_dev_123456",
                "notes": "Pinecone vector DB for local RAG development.",
                "tags": ["ai", "vector-db", "pinecone", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "PINECONE_ENVIRONMENT",
                "value": "us-west1-gcp-free",
                "notes": "Free tier Pinecone instance for development.",
                "tags": ["ai", "vector-db", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "PINECONE_API_KEY",
                "value": "***PROD_PINECONE_KEY***",
                "notes": "Production Pinecone index with high-performance pods.",
                "tags": ["ai", "vector-db", "production"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "PINECONE_INDEX_NAME",
                "value": "prod-embeddings-1536d",
                "notes": "Production vector index for semantic search (1536 dimensions).",
                "tags": ["ai", "vector-db", "production"],
            },
            # LangSmith for Tracing
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "LANGCHAIN_API_KEY",
                "value": "ls_dev_1234567890",
                "notes": "LangSmith tracing for debugging AI chains locally.",
                "tags": ["ai", "langchain", "development", "observability"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "LANGCHAIN_API_KEY",
                "value": "***LANGSMITH_PROD_KEY***",
                "notes": "Production LangSmith for AI observability and performance monitoring.",
                "tags": ["ai", "langchain", "production", "observability"],
            },
            # Model Configuration
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "DEFAULT_MODEL",
                "value": "gpt-4o-mini",
                "notes": "Fast, cost-effective model for development iteration.",
                "tags": ["ai", "config", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "DEFAULT_MODEL",
                "value": "gpt-4o",
                "notes": "Full GPT-4o for staging evaluation and QA.",
                "tags": ["ai", "config", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "DEFAULT_MODEL",
                "value": "gpt-4o",
                "notes": "Production model with fallback to Claude for reliability.",
                "tags": ["ai", "config", "production"],
            },
            # Temperature & Generation Settings
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "MODEL_TEMPERATURE",
                "value": "0.7",
                "notes": "Higher temperature for creative exploration in dev.",
                "tags": ["ai", "config", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "MODEL_TEMPERATURE",
                "value": "0.2",
                "notes": "Lower temperature for consistent, deterministic outputs in prod.",
                "tags": ["ai", "config", "production"],
            },
            # AI Prompts
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "System Prompt: Customer Support Agent",
                "content": (
                    "You are a helpful customer support agent for Acme Corp.\n\n"
                    "Your personality:\n"
                    "- Professional yet friendly\n"
                    "- Patient and empathetic\n"
                    "- Clear and concise\n\n"
                    "Guidelines:\n"
                    "1. Always greet the user warmly\n"
                    "2. Ask clarifying questions when needed\n"
                    "3. Provide step-by-step solutions\n"
                    "4. Offer to escalate complex issues\n"
                    "5. End with asking if there's anything else you can help with\n\n"
                    "Knowledge base: {context}\n"
                    "User query: {query}"
                ),
                "notes": "Production-ready system prompt for RAG-powered support chatbot.",
                "tags": ["ai", "prompt", "customer-support"],
            },
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "Evaluation: Check Response Quality",
                "content": (
                    "You are evaluating AI-generated customer support responses.\n\n"
                    "Evaluation criteria:\n"
                    "1. Accuracy: Is the information factually correct? (0-10)\n"
                    "2. Relevance: Does it address the user's question? (0-10)\n"
                    "3. Completeness: Are all aspects covered? (0-10)\n"
                    "4. Tone: Is it professional and empathetic? (0-10)\n"
                    "5. Safety: No harmful or inappropriate content? (0-10)\n\n"
                    "Response to evaluate: {response}\n"
                    "Expected answer: {expected}\n\n"
                    "Return JSON with scores and reasoning:\n"
                    "{\n"
                    '  "accuracy": {"score": X, "reason": "..."},\n'
                    '  "relevance": {"score": X, "reason": "..."},\n'
                    '  "overall": X\n'
                    "}"
                ),
                "notes": "LLM-as-judge evaluation prompt for CI/CD pipeline.",
                "tags": ["ai", "evaluation", "quality"],
            },
            {
                "kind": "PROMPT",
                "environment": "PROD",
                "title": "Monitoring: Detect Model Drift",
                "content": (
                    "Analyze production AI metrics and flag anomalies:\n\n"
                    "Weekly telemetry data: {telemetry}\n\n"
                    "Check for:\n"
                    "1. Response latency > 2s (P95)\n"
                    "2. User satisfaction < 4.0/5.0\n"
                    "3. Escalation rate > 15%\n"
                    "4. Error rate > 1%\n"
                    "5. Token usage spike > 30%\n\n"
                    "For each threshold breach:\n"
                    "- Identify affected user segments\n"
                    "- Suggest root cause\n"
                    "- Recommend immediate action\n\n"
                    "Format: Executive summary with action items and owners."
                ),
                "notes": "Weekly MLOps review prompt - runs every Monday 9am.",
                "tags": ["ai", "mlops", "monitoring", "drift"],
            },
            {
                "kind": "PROMPT",
                "environment": "STAGING",
                "title": "RAG Pipeline Testing",
                "content": (
                    "Test the retrieval-augmented generation pipeline:\n\n"
                    "Test cases:\n"
                    "1. Query: 'How do I reset my password?'\n"
                    "   - Expected: Retrieve password reset docs\n"
                    "   - Validate: Response includes step-by-step instructions\n\n"
                    "2. Query: 'What's your refund policy?'\n"
                    "   - Expected: Retrieve refund policy from KB\n"
                    "   - Validate: Response cites policy correctly\n\n"
                    "3. Query: 'Why is the sky blue?'\n"
                    "   - Expected: Detect out-of-scope query\n"
                    "   - Validate: Politely decline and offer to redirect\n\n"
                    "For each test:\n"
                    "- Log retrieved chunks and relevance scores\n"
                    "- Measure response latency\n"
                    "- Calculate semantic similarity to expected answer"
                ),
                "notes": "Automated RAG testing suite for staging deployments.",
                "tags": ["ai", "testing", "rag", "staging"],
            },
            # Documentation
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "OpenAI API Reference",
                "url": "https://platform.openai.com/docs/api-reference",
                "notes": "Complete OpenAI API documentation with code examples.",
                "tags": ["documentation", "openai", "api"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "LangChain Documentation",
                "url": "https://python.langchain.com/docs/get_started/introduction",
                "notes": "LangChain framework for building LLM applications.",
                "tags": ["documentation", "langchain", "ai"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "Pinecone Vector Database Guide",
                "url": "https://docs.pinecone.io/docs/overview",
                "notes": "Vector database setup and best practices for RAG.",
                "tags": ["documentation", "pinecone", "vector-db"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "PROD",
                "title": "AI Safety & Responsible AI Guidelines",
                "url": "https://docs.acme.com/ai/responsible-ai",
                "notes": "Internal guidelines for AI safety, bias mitigation, and ethics.",
                "tags": ["documentation", "ai-safety", "governance"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "PROD",
                "title": "Production AI Incident Runbook",
                "url": "https://docs.acme.com/runbooks/ai-incidents",
                "notes": "Step-by-step response for AI failures, hallucinations, or safety issues.",
                "tags": ["runbook", "ai", "incident", "production"],
            },
        ],
    },
    {
        "name": "PRD Project Ops Command",
        "description": (
            "Program management hub for coordinating cross-team delivery with templates "
            "for meeting notes, project scorecards, dependency tracking, and stakeholder "
            "communication across all environments."
        ),
        "artifacts": [
            # Integration Tokens
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "JIRA_API_TOKEN",
                "value": "ATATT3xFfGF0_dev_token_12345",
                "notes": "Jira API token for local project automation testing.",
                "tags": ["integration", "jira", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "JIRA_API_TOKEN",
                "value": "***JIRA_PROD_TOKEN***",
                "notes": "Production Jira token for automated sprint reports and metrics.",
                "tags": ["integration", "jira", "production"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "SLACK_WEBHOOK_URL",
                "value": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX",
                "notes": "Slack webhook for automated deployment notifications.",
                "tags": ["integration", "slack", "notifications"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "GITHUB_TOKEN",
                "value": "ghp_***PRODUCTION_GITHUB_TOKEN***",
                "notes": "GitHub PAT for automated PR checks and deployment status updates.",
                "tags": ["integration", "github", "production"],
            },
            # Status Page & Monitoring
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "STATUSPAGE_API_KEY",
                "value": "dev-statuspage-key-12345",
                "notes": "Status page API for dev incident testing.",
                "tags": ["monitoring", "statuspage", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "STATUSPAGE_API_KEY",
                "value": "***STATUSPAGE_PROD_KEY***",
                "notes": "Production status page for public incident communication.",
                "tags": ["monitoring", "statuspage", "production"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "PAGERDUTY_API_KEY",
                "value": "***PAGERDUTY_PROD_KEY***",
                "notes": "PagerDuty integration for on-call escalation.",
                "tags": ["monitoring", "pagerduty", "production"],
            },
            # Analytics & Reporting
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "MIXPANEL_PROJECT_TOKEN",
                "value": "mixpanel_dev_1234567890",
                "notes": "Mixpanel dev project for analytics testing.",
                "tags": ["analytics", "mixpanel", "development"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "MIXPANEL_PROJECT_TOKEN",
                "value": "***MIXPANEL_PROD_TOKEN***",
                "notes": "Production Mixpanel for user behavior analytics.",
                "tags": ["analytics", "mixpanel", "production"],
            },
            # Communication Tools
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "SENDGRID_API_KEY",
                "value": "SG.***SENDGRID_PRODUCTION_KEY***",
                "notes": "SendGrid API for transactional emails and stakeholder updates.",
                "tags": ["email", "sendgrid", "production"],
            },
            # Project Management Prompts
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "Sprint Planning Facilitator",
                "content": (
                    "You are facilitating a sprint planning session.\n\n"
                    "Inputs:\n"
                    "- Product backlog: {backlog}\n"
                    "- Team velocity: {velocity} story points\n"
                    "- Team capacity: {capacity} person-days\n"
                    "- Technical debt: {tech_debt}\n\n"
                    "Process:\n"
                    "1. Review and refine top backlog items\n"
                    "2. Break down large stories into tasks\n"
                    "3. Estimate effort and identify dependencies\n"
                    "4. Balance new features vs tech debt (80/20 rule)\n"
                    "5. Ensure sprint goal is clear and achievable\n\n"
                    "Output: Sprint commitment with tasks, owners, and acceptance criteria."
                ),
                "notes": "AI-assisted sprint planning for agile teams.",
                "tags": ["planning", "agile", "sprint"],
            },
            {
                "kind": "PROMPT",
                "environment": "STAGING",
                "title": "Executive Status Report Generator",
                "content": (
                    "Generate an executive status report for stakeholders.\n\n"
                    "Data sources:\n"
                    "- Sprint velocity: {velocity_data}\n"
                    "- OKR progress: {okr_data}\n"
                    "- Budget utilization: {budget_data}\n"
                    "- Risk register: {risks}\n\n"
                    "Report structure:\n"
                    "1. Executive Summary (2-3 sentences)\n"
                    "2. Key Achievements this week\n"
                    "3. Metrics & KPIs (visual-friendly format)\n"
                    "4. Risks & Blockers (RED/YELLOW/GREEN)\n"
                    "5. Next Week Priorities\n"
                    "6. Asks & Dependencies\n\n"
                    "Tone: Professional, data-driven, action-oriented.\n"
                    "Length: Max 1 page."
                ),
                "notes": "Automated weekly stakeholder update - sent every Friday 4pm.",
                "tags": ["communication", "executive", "reporting"],
            },
            {
                "kind": "PROMPT",
                "environment": "PROD",
                "title": "Incident Post-Mortem Template",
                "content": (
                    "Create a blameless post-mortem for production incident.\n\n"
                    "Incident data: {incident_details}\n\n"
                    "Required sections:\n"
                    "1. Incident Summary\n"
                    "   - Date/time, duration, severity\n"
                    "   - Impact: users affected, revenue impact\n\n"
                    "2. Timeline\n"
                    "   - Detection, escalation, mitigation, resolution\n\n"
                    "3. Root Cause Analysis\n"
                    "   - What happened and why\n"
                    "   - Contributing factors (technical, process, human)\n\n"
                    "4. Action Items\n"
                    "   - Immediate fixes (done)\n"
                    "   - Short-term improvements (< 2 weeks)\n"
                    "   - Long-term prevention (< quarter)\n"
                    "   - Assign owners and due dates\n\n"
                    "5. Lessons Learned\n"
                    "   - What went well\n"
                    "   - What could be improved\n\n"
                    "Principle: Focus on systems and processes, not individuals."
                ),
                "notes": "Standard post-mortem format for all production incidents.",
                "tags": ["incident", "post-mortem", "production"],
            },
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "Project Kickoff Agenda Builder",
                "content": (
                    "Create a comprehensive project kickoff meeting agenda.\n\n"
                    "Project: {project_name}\n"
                    "Duration: {duration}\n"
                    "Stakeholders: {stakeholders}\n\n"
                    "Agenda (90 minutes):\n"
                    "1. Introductions & Roles (10 min)\n"
                    "2. Project Vision & Goals (15 min)\n"
                    "   - Problem statement\n"
                    "   - Success metrics\n"
                    "   - Business value\n\n"
                    "3. Scope & Deliverables (20 min)\n"
                    "   - In scope / Out of scope\n"
                    "   - Key milestones\n"
                    "   - Dependencies\n\n"
                    "4. Team Structure & Communication (15 min)\n"
                    "   - RACI matrix\n"
                    "   - Communication channels\n"
                    "   - Meeting cadence\n\n"
                    "5. Risks & Constraints (15 min)\n"
                    "   - Technical risks\n"
                    "   - Resource constraints\n"
                    "   - Mitigation strategies\n\n"
                    "6. Next Steps & Action Items (15 min)\n\n"
                    "Output: Structured agenda with time boxes and facilitator notes."
                ),
                "notes": "Template for launching new cross-functional initiatives.",
                "tags": ["planning", "kickoff", "project-management"],
            },
            {
                "kind": "PROMPT",
                "environment": "STAGING",
                "title": "Release Notes Generator",
                "content": (
                    "Generate customer-facing release notes from git commits and PRs.\n\n"
                    "Inputs:\n"
                    "- Version: {version}\n"
                    "- Git commits: {commits}\n"
                    "- Closed issues: {issues}\n\n"
                    "Format:\n"
                    "# Release v{version}\n"
                    "Release Date: {date}\n\n"
                    "## ✨ New Features\n"
                    "- [Feature] Description with benefit\n\n"
                    "## 🐛 Bug Fixes\n"
                    "- [Fix] User-friendly description\n\n"
                    "## 🔧 Improvements\n"
                    "- [Enhancement] What changed and why it matters\n\n"
                    "## ⚠️ Breaking Changes\n"
                    "- [Breaking] Migration guide\n\n"
                    "## 📚 Documentation\n"
                    "- Updated guides and tutorials\n\n"
                    "Style: Customer-friendly, benefit-focused, avoid jargon."
                ),
                "notes": "Automated release notes for staging deployments.",
                "tags": ["release", "documentation", "communication"],
            },
            # Documentation Links
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "Architecture Decision Records (ADR) Template",
                "url": "https://adr.github.io/",
                "notes": "Industry-standard ADR format for documenting important decisions.",
                "tags": ["documentation", "adr", "template"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "Agile Best Practices Guide",
                "url": "https://www.atlassian.com/agile",
                "notes": "Atlassian's comprehensive guide to agile methodologies.",
                "tags": ["documentation", "agile", "process"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "PROD",
                "title": "Incident Response Playbook",
                "url": "https://docs.acme.com/runbooks/incident-response",
                "notes": "Internal incident response procedures with escalation paths.",
                "tags": ["runbook", "incident", "production"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "PROD",
                "title": "On-Call Engineer Handbook",
                "url": "https://docs.acme.com/oncall/handbook",
                "notes": "Complete guide for on-call duties, escalation, and war room protocols.",
                "tags": ["runbook", "oncall", "production"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "Project Management Templates",
                "url": "https://docs.acme.com/templates/project-management",
                "notes": "Collection of PM templates: kickoff decks, status reports, RFCs, etc.",
                "tags": ["documentation", "templates", "pm"],
            },
        ],
    },
]


def apply_showcase_templates(owner_uid: str) -> List[Workspace]:
    """Create showcase workspaces populated with sample data for a user."""

    if not owner_uid or not owner_uid.strip():
        raise ValueError("owner_uid is required to apply templates")

    env_types = {
        et.slug.upper(): et for et in EnvironmentType.objects.all()
    }  # type: Dict[str, EnvironmentType]

    if not env_types:
        raise RuntimeError("Environment types must be seeded before applying templates")

    created_workspaces: List[Workspace] = []

    with transaction.atomic():
        for template in SHOWCASE_TEMPLATES:
            workspace = Workspace.objects.create(
                owner_uid=owner_uid,
                name=_unique_workspace_name(owner_uid, template["name"].strip()),
                description=template.get("description", "").strip(),
            )

            workspace_envs = _ensure_workspace_environments(
                workspace, env_types.values()
            )

            tag_cache: Dict[str, Tag] = {}

            for artifact_def in template.get("artifacts", []):
                artifact = _create_artifact(workspace, workspace_envs, artifact_def)
                for tag_name in artifact_def.get("tags", []):
                    name = tag_name.strip()
                    if not name:
                        continue
                    tag = tag_cache.get(name)
                    if tag is None:
                        tag, _ = Tag.objects.get_or_create(
                            workspace=workspace, name=name
                        )
                        tag_cache[name] = tag
                    artifact.tags.add(tag)

            created_workspaces.append(workspace)

    logger.info(
        "Applied showcase templates for UID %s (created %s workspaces)",
        owner_uid,
        len(created_workspaces),
    )

    return created_workspaces


def _unique_workspace_name(owner_uid: str, base_name: str) -> str:
    """Ensure workspace names are unique per owner without using illegal characters."""

    name = base_name
    suffix = 2
    while Workspace.objects.filter(owner_uid=owner_uid, name=name).exists():
        name = f"{base_name} - {suffix}"
        suffix += 1
    return name


def _ensure_workspace_environments(
    workspace: Workspace, env_types: Iterable[EnvironmentType]
) -> Dict[str, WorkspaceEnvironment]:
    """Create WorkspaceEnvironment joins for all known environment types."""

    env_map: Dict[str, WorkspaceEnvironment] = {}
    for env_type in env_types:
        workspace_env, _ = WorkspaceEnvironment.objects.get_or_create(
            workspace=workspace, environment_type=env_type
        )
        env_map[env_type.slug.upper()] = workspace_env
    return env_map


def _create_artifact(
    workspace: Workspace,
    workspace_envs: Dict[str, WorkspaceEnvironment],
    artifact_def: Dict,
) -> Artifact:
    """Instantiate an artifact from a definition dictionary."""

    kind = artifact_def["kind"].upper()
    environment = artifact_def.get("environment", "DEV").upper()

    artifact_kwargs = {
        "workspace": workspace,
        "kind": kind,
        "environment": environment,
        "notes": artifact_def.get("notes", ""),
        "workspace_env": workspace_envs.get(environment),
        "metadata": artifact_def.get("metadata", {}),
    }

    if kind == "ENV_VAR":
        artifact_kwargs["key"] = artifact_def["key"].strip()
        artifact_kwargs["value"] = artifact_def["value"]
    elif kind == "PROMPT":
        artifact_kwargs["title"] = artifact_def["title"].strip()
        artifact_kwargs["content"] = artifact_def.get("content", "")
    elif kind == "DOC_LINK":
        artifact_kwargs["title"] = artifact_def["title"].strip()
        artifact_kwargs["url"] = artifact_def["url"].strip()
    else:
        raise ValueError(f"Unsupported artifact kind: {kind}")

    artifact = Artifact.objects.create(**artifact_kwargs)
    return artifact
