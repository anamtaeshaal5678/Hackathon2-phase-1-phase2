# SDD Error Handling & Recovery Protocol

This document defines the mandatory "AI-Only" recovery process for Phase IV as per SP-5.

## 1. Automated Failure Detection (Task E1)
**Monitoring Agent:** `kagent`
**Action:** Audit cluster state every 5 minutes.
**Detection Prompt:** `kagent "List any pods in non-Running state and classify by error type (CrashLoop, OOM, ImagePullBackOff)."`

## 2. AI-Driven Diagnosis (Task E2)
**Rule:** No manual log inspection.
**Diagnosis Prompt:** `kubectl-ai "Explain why pod [POD_NAME] is failing and suggest a fix in values.yaml."`

## 3. Patching & Redeployment (Task E3)
**Workflow:**
1. AI identifies configuration error.
2. AI generates updated `values.yaml` or `Dockerfile` chunk.
3. User reviews and approves.
4. Redeploy via Helm: `helm upgrade ...`

## Example Recovery: 500 Internal Server Error
**Observation:** Dashboards show 0 tasks.
**AI Diagnosis:** "Missing 'title' column in SQLite matches evidence of model update without migration."
**AI Fix:** Generated `backend/migrate_title.py`.
**Result:** System recovered, verified via `/todos/stats` 200 OK.

---
**Status:** Protocol Active.
