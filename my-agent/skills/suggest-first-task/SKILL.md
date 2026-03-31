---
name: suggest-first-task
description: Recommends high-learning, beginner-friendly first missions tailored to repository context and user skill level.
allowed-tools:
  - Read
  - Bash
---

## What This Skill Does
This skill proposes initial contribution missions that maximize understanding while minimizing breakage risk. It translates onboarding knowledge into actionable first wins.

## Step-by-Step Execution Logic
1. Gather context
Use repository map and user profile (experience, interests, available time).

2. Build candidate task pool
Generate tasks across docs, tests, small bug fixes, DX improvements, and low-risk refactors.

3. Score candidate tasks
Rank each candidate by impact, complexity, blast radius, and learning value.

4. Select top mission
Choose one primary task and up to two alternates.

5. Define completion contract
For each proposed task, include objective, exact files likely involved, acceptance criteria, and validation steps.

6. Add execution guidance
Provide first command/action, estimated duration, and common pitfalls.

## Expected Input Behavior
Input may include:
- Onboarding summary from explain-codebase
- User confidence level and goals
- Preferred learning mode (hands-on, reading-heavy, test-driven)

When user context is sparse, default to safest high-learning task category.

## Expected Output Behavior
Output must include:
- Primary first task mission
- Why this mission is the best starting point
- Acceptance checklist
- Suggested branch/commit strategy
- Two optional fallback missions

Output should feel specific to the repository, not generic advice.
