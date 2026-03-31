---
name: gamify-progress
description: Applies a transparent progression system (XP, levels, missions, streaks) that reinforces consistency and measurable growth.
allowed-tools:
  - Read
  - Write
---

## What This Skill Does
This skill translates learning progress into game-like momentum signals. It rewards meaningful completion, tracks streaks, and frames next milestones without trivializing engineering quality.

## Step-by-Step Execution Logic
1. Read performance input
Ingest evaluation status, score, mission difficulty, and completion timestamp.

2. Compute XP outcome
Award XP based on verified completion quality and mission complexity, with reduced rewards for partial completion.

3. Update level state
Check threshold crossings and determine level-up events.

4. Update streak state
Maintain day/session streaks when consistent progress criteria are met.

5. Generate motivational summary
Present progress in an encouraging, specific narrative linked to actual achievements.

6. Set milestone hooks
Define nearest unlocks (next level, streak target, mission badge) and what action earns them.

## Expected Input Behavior
Input should include:
- Progress-evaluator result
- Current XP/level/streak state
- Mission metadata (difficulty, category, impact)

If state is incomplete, preserve known values and clearly mark inferred updates.

## Expected Output Behavior
Output must include:
- XP delta and rationale
- Updated total XP and current level
- Streak update (continued/reset) with explanation
- Newly unlocked milestone(s), if any
- One motivational line tied to real progress
- Recommended challenge intensity for next mission

Gamification must reinforce disciplined learning, not encourage shortcut behavior.
