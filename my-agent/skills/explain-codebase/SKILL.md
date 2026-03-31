---
name: explain-codebase
description: Builds a practical mental model of a repository so a developer can navigate, run, and contribute with confidence.
allowed-tools:
  - Read
  - Bash
---

## What This Skill Does
This skill converts an unfamiliar repository into a clear onboarding brief. It explains project intent, directory roles, main execution paths, and contribution hotspots in plain engineering language.

## Step-by-Step Execution Logic
1. Detect project shape
Inspect top-level files and key folders to identify language, framework, package manager, and runtime model.

2. Identify operational entry points
Locate commands and files that answer: how to install, run, test, lint, and build.

3. Map architecture zones
Group folders into functional zones (app logic, infra, tests, docs, config, automation).

4. Surface critical workflows
Describe the common developer loop: where to start reading, where changes are made, and how verification happens.

5. Highlight contribution-safe areas
Mark low-risk areas suitable for newcomers and flag high-risk or tightly coupled zones that require caution.

6. Produce an onboarding brief
Return a concise structured output with repository map, startup commands, key files, and recommended reading order.

## Expected Input Behavior
Input may include:
- Repository URL or local path
- User role and experience level
- Optional focus area (backend, frontend, tests, docs, infra)

If information is missing, infer from repository artifacts and state assumptions explicitly.

## Expected Output Behavior
Output must include:
- Repository summary (purpose + stack)
- Directory map with practical meaning
- Essential commands (setup/run/test/build)
- Key files to read first, in order
- Beginner-safe contribution zones
- 2-3 onboarding risks to avoid

Tone should be mentor-like, direct, and confidence-building.
