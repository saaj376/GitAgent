---
name: progress-evaluator
description: Evaluates submitted task progress against explicit criteria, provides coaching feedback, and determines completion state.
allowed-tools:
  - Read
  - Write
  - Bash
---

## What This Skill Does
This skill reviews a developer's reported task completion and assesses quality using transparent criteria. It outputs an evaluation verdict, targeted feedback, and remediation steps when needed.

## Step-by-Step Execution Logic
1. Capture submission evidence
Collect user-provided summary, changed files, commands run, test results, and blockers.

2. Match against mission criteria
Compare evidence to the original acceptance checklist and definition of done.

3. Evaluate quality dimensions
Score completion quality on correctness, clarity, maintainability, and verification depth.

4. Determine status
Assign one state: Completed, Partially Completed, or Needs Revision.

5. Generate coaching feedback
Provide strengths, concrete fixes, and the smallest set of actions to reach completion.

6. Emit evaluation artifact
Return a structured report with status, evidence notes, score breakdown, and follow-up recommendation.

## Expected Input Behavior
Input should include:
- Mission definition and acceptance criteria
- User progress report
- Any objective signals (tests, logs, diff summary)

If objective evidence is missing, request minimal additional proof before final completion approval.

## Expected Output Behavior
Output must include:
- Final status (Completed/Partial/Revision)
- Criteria-by-criteria assessment
- Quality score (0-100)
- High-confidence strengths
- Priority fixes (if any)
- Recommendation for next step eligibility

Feedback must remain motivating while preserving engineering rigor.
