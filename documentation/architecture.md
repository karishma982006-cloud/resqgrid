# RESQ-GRID System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

```
 [ Citizen / Public Intake ]
             │
             ▼
  ┌──────────────────────────────────────────────────┐
  │         Problem Decomposition Engine             │
  │    (Rule-based NLP & Multi-Hazard Parser)        │
  └──────────────────────┬───────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌─────────────────────────┐   ┌───────────────────────────┐
│ Responsibility Mapping  │   │  Dynamic Priority Engine  │
│  (Agency Capabilities)  │   │   (Multi-Factor Scoring)  │
└───────────────┬─────────┘   └─────────────┬─────────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
  ┌──────────────────────────────────────────────────┐
  │               Master Case RG-XXXX                │
  │  Problems [P1, P2..]  ───►  Tasks [T1, T2..]     │
  └──────────────────────┬───────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌─────────────────────────┐   ┌───────────────────────────┐
│    Dependency Engine    │   │   Reassignment Engine     │
│ (Precondition Blockers) │   │ (Fleet Matching & Gaps)   │
└───────────────┬─────────┘   └─────────────┬─────────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                              ▼
  ┌──────────────────────────────────────────────────┐
  │           Execution, Proof & Verification        │
  │  Department Work Order ──► Evidence Upload       │
  │  Citizen On-Site Conf  ──► Resolution / Reopen   │
  └──────────────────────┬───────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────┐
  │             Immutable Audit Trail                │
  │  (Timestamped chronological ledger of all ops)   │
  └──────────────────────────────────────────────────┘
```

## 2. Dynamic Priority Engine Formula

Priority is calculated dynamically using a multi-factor weighting formula:

$$\text{PriorityScore} = (\text{Severity} \times W_{\text{sev}}) + (\text{SafetyRisk} \times W_{\text{safe}}) + (\text{PeopleAffected} \times W_{\text{peo}}) + (\text{Urgency} \times W_{\text{urg}}) + (\text{PublicImpact} \times W_{\text{imp}}) + (\text{DependencyFactor} \times W_{\text{dep}})$$

During **Disaster Mode**, the score is boosted by $W_{\text{disaster}}$ ($1.25\times$), and critical life-safety categories (Trapped People, Severe Injuries, Active Fire) receive an automatic priority override ($\ge 92$).

Threshold mapping:
- **CRITICAL:** Score $\ge 80$
- **HIGH:** Score $60 - 79$
- **MEDIUM:** Score $40 - 59$
- **LOW:** Score $< 40$

## 3. Dependency Pipeline Logic

When multiple interrelated problems exist within a case:
1. Hazardous preconditions (e.g. live electrical lines, active fire) are tagged as upstream blockers.
2. Downstream tasks (e.g. road repair, traffic reopening) are initialized in status `BLOCKED` with `blockedBy` pointing to the prerequisite task.
3. When the blocking department completes its work, the `DependencyEngine` detects satisfaction and transitions the blocked task to `ASSIGNED` / `READY`.
4. Notifications are automatically dispatched to the waiting department.

## 4. Reassignment & Responsibility Gap Detection

When a department reports `CANNOT HANDLE`:
1. The `ReassignmentEngine` searches candidate squads based on:
   - Capability match
   - Fleet status (`AVAILABLE` vs `BUSY`)
   - Jurisdiction and proximity distance
   - Active backlog workload
2. If an available squad exists, the task is reassigned with full handoff history.
3. If no capable squad is available, a **RESPONSIBILITY GAP** is declared and an automatic Level 2/3 Escalation is routed to the Command Center for mutual aid intervention.
