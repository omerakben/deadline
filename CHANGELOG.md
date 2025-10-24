# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- TBA

## [1.0.0] - 2025-10-22

- Added `ArtifactAccessLog` model and automatic logging for ENV_VAR reveal operations.
- Introduced per-user rate limits (10/min reveal, 60/hour search) using django-ratelimit.
- Documented audit logging workflow and rate limits in README.
