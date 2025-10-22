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

from django.db import transaction

from artifacts.models import Artifact, Tag
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
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "PRD_API_BASE_URL",
                "value": "https://api.acme-prod.example.com/v1",
                "notes": "Primary production API endpoint consumed by customer apps.",
                "tags": ["production", "api", "critical"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "PRD_STAGING_DB_URL",
                "value": "postgresql://acme_staging:supersecure@staging-db.acme.local:5432/acme",
                "notes": "Staging database connection string used for release verification.",
                "tags": ["database", "staging"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "DEV",
                "key": "PRD_DEV_APP_SECRET",
                "value": "dev-super-secret-rotate-weekly",
                "notes": "Shared dev secret for local service-to-service auth (rotate weekly).",
                "tags": ["development", "security"],
            },
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "PRD TODO: Bootstrap Onboarding Service",
                "content": (
                    "You are the lead engineer rolling out a new onboarding microservice.\n"
                    "Checklist:\n"
                    "- scaffold FastAPI service with health checks and OpenAPI docs\n"
                    "- connect to shared PostgreSQL using PRD_DEV_APP_SECRET\n"
                    "- emit structured logs with request correlation IDs\n"
                    "- write contract tests for the provisioning workflow\n"
                    "Return a task breakdown with owners, estimates, and acceptance criteria."
                ),
                "notes": "Feed into the workspace TODO board for full-stack projects.",
                "tags": ["todo", "microservices", "planning"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "PROD",
                "title": "PRD Runbook: Zero-Downtime Deployment",
                "url": "https://deadline-docs.example.com/runbooks/blue-green",
                "notes": "Operational checklist for blue/green deploys across DEV/STAGING/PROD.",
                "tags": ["runbook", "operations", "deployment"],
            },
        ],
    },
    {
        "name": "PRD AI Delivery Lab",
        "description": (
            "Reference workspace for AI feature delivery covering evaluation prompts, "
            "model governance, and production credential handling for inference."
        ),
        "artifacts": [
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "PRD_OPENAI_API_KEY",
                "value": "sk-live-***-replace-me-before-launch",
                "notes": "Live key used by the inference gateway. Rotate via secrets manager.",
                "tags": ["ai", "production", "security"],
            },
            {
                "kind": "ENV_VAR",
                "environment": "STAGING",
                "key": "PRD_VECTOR_DB_URL",
                "value": "postgresql://ai_vector:ai-vector@staging-vector.internal:5432/embeddings",
                "notes": "Vector database connection for retrieval augmented generation pipeline.",
                "tags": ["rag", "staging", "database"],
            },
            {
                "kind": "PROMPT",
                "environment": "PROD",
                "title": "PRD Prompt: Evaluate Model Drift",
                "content": (
                    "You are monitoring production model performance.\n"
                    "1. Pull weekly telemetry for latency, win rate, and guardrail triggers.\n"
                    "2. Highlight segments exceeding drift thresholds.\n"
                    "3. Recommend follow-up experiments or rollbacks.\n"
                    "Produce a concise executive summary with action owners."
                ),
                "notes": "Used by the MLOps review meeting every Monday.",
                "tags": ["ai", "governance", "mlops"],
            },
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "PRD Prompt: Rapid Agent Prototype",
                "content": (
                    "You are pairing with an AI engineer to ship a new retrieval-augmented agent.\n"
                    "Outline the system design covering: ingestion, embedding job, grounding data,\n"
                    "evaluation harness, and rollout plan. Include TODOs for data privacy checks."
                ),
                "notes": "Kickstarts new feature spikes for the applied research pod.",
                "tags": ["design", "ai", "todo"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "PRD Handbook: Responsible AI Launch Checklist",
                "url": "https://deadline-docs.example.com/ai/responsible-launch",
                "notes": "Sign-off requirements before enabling production inference traffic.",
                "tags": ["governance", "policy", "launch"],
            },
        ],
    },
    {
        "name": "PRD Project Ops Command",
        "description": (
            "Program management hub for coordinating cross-team delivery with templates "
            "for meeting notes, project scorecards, and dependency tracking."
        ),
        "artifacts": [
            {
                "kind": "ENV_VAR",
                "environment": "PROD",
                "key": "PRD_STATUS_PAGE_TOKEN",
                "value": "statuspage-token-store-securely",
                "notes": "Token for syncing incident updates into shared calendars.",
                "tags": ["operations", "status", "integration"],
            },
            {
                "kind": "PROMPT",
                "environment": "STAGING",
                "title": "PRD Prompt: Executive Weekly Update",
                "content": (
                    "Draft a crisp executive update covering delivery confidence, budget usage, "
                    "and critical risks. Pull highlights from the latest sprint review and "
                    "OKR scorecards. Close with next-week priorities and dependency asks."
                ),
                "notes": "Feeds the auto-generated status email for stakeholders.",
                "tags": ["communications", "leadership", "summary"],
            },
            {
                "kind": "PROMPT",
                "environment": "DEV",
                "title": "PRD Prompt: Project Discovery Workshop",
                "content": (
                    "Facilitate a discovery workshop for a new initiative.\n"
                    "Agenda:\n"
                    "- articulate problem statement and success metrics\n"
                    "- map stakeholders and approval milestones\n"
                    "- capture risks, mitigations, and decision log\n"
                    "Output a structured Miro board outline with ownership."
                ),
                "notes": "Supports the project management template library.",
                "tags": ["planning", "workshop", "facilitation"],
            },
            {
                "kind": "DOC_LINK",
                "environment": "DEV",
                "title": "PRD Template: Decision Record",
                "url": "https://deadline-docs.example.com/templates/adr",
                "notes": "Architecture Decision Record template for cross-team coordination.",
                "tags": ["documentation", "process", "template"],
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

            workspace_envs = _ensure_workspace_environments(workspace, env_types.values())

            tag_cache: Dict[str, Tag] = {}

            for artifact_def in template.get("artifacts", []):
                artifact = _create_artifact(workspace, workspace_envs, artifact_def)
                for tag_name in artifact_def.get("tags", []):
                    name = tag_name.strip()
                    if not name:
                        continue
                    tag = tag_cache.get(name)
                    if tag is None:
                        tag, _ = Tag.objects.get_or_create(workspace=workspace, name=name)
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
