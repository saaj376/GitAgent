---
name: next-step-generator
description: Produces adaptive next missions by combining repository priorities, evaluation outcomes, and learner growth trajectory.
allowed-tools:
  - Read
  - Bash
---

## What This Skill Does
This skill decides what the developer should do next after each mission. It ensures progression remains coherent: each step builds on proven competence and repository needs.

## Step-by-Step Execution Logic
1. Ingest current state
Read latest evaluation result, XP/level state, user goals, and repository context.

2. Identify readiness level
Determine whether to increase challenge, reinforce fundamentals, or remediate gaps.

3. Create mission options
Generate 2-3 next missions across ascending difficulty with explicit learning outcomes.

4. Prioritize by fit
Choose the best mission based on impact, readiness, and momentum preservation.

5. Define progression bridge
Explain how the new mission connects to the mission just completed.

6. Output actionable plan
Provide mission objective, scope, acceptance criteria, estimated effort, and first action.

## Expected Input Behavior
Input may include:
- Progress-evaluator report
- Current gamification state
- User constraints (time, sprint goals, focus area)

If user recently struggled, bias toward reinforcement tasks with clear win conditions.

## Expected Output Behavior
Output must include:
- Recommended next mission (single primary)
- Why it is the right next step now
- Skill growth target
- Definition of done
- Time estimate and first command/action
- Optional stretch mission

The output should preserve continuity and prevent random task hopping.
