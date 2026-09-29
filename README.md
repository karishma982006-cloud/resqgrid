# RESQ-GRID
### Unified Public Service & Disaster Coordination Platform

> **Hackathon Edition** — A realistic, multi-agency response platform designed to eliminate public-service silos, dynamically decompose multi-hazard citizen reports, compute life-safety priority queues, manage inter-departmental dependencies, and provide full end-to-end resolution tracking with immutable audit trails.

---

## 1. Problem Statement

In modern cities and disaster scenarios, emergency and public service coordination suffers from severe structural bottlenecks:
1. **Siloed Citizen Intake:** A citizen reporting a fallen tree that broke an electrical line, blocked drainage, and jammed traffic must file separate complaints to multiple distinct government agencies.
2. **Lack of Problem Decomposition:** Incidents are treated as single tickets rather than multi-disciplinary challenges.
3. **No Dynamic Prioritization:** Tasks are processed on static or FIFO basis rather than dynamic life-safety and structural risk calculations.
4. **Missing Dependency Management:** Road excavation crews often arrive before electrical teams isolate high-voltage cables, causing stalled work, physical danger, and administrative gridlock.
5. **No Coordinated Reassignment or Gap Detection:** When a dispatched team cannot handle a problem, tickets are abandoned rather than intelligently reassigned to alternative squads or escalated.
6. **No Citizen On-Site Verification:** Cases are closed administratively on paper without confirming that the issue was actually fixed on the ground.

---

## 2. The Solution: RESQ-GRID

RESQ-GRID provides a single unified workflow:

```
           ONE CITIZEN REPORT
                   ↓
         UNDERSTAND & DECOMPOSE
                   ↓
      BREAK INTO MULTIPLE PROBLEMS
                   ↓
    IDENTIFY RESPONSIBLE DEPARTMENTS
                   ↓
         LINK RELATED PROBLEMS
                   ↓
        DYNAMIC PRIORITY ENGINE
                   ↓
        CREATE DEPARTMENT TASKS
                   ↓
       DEPARTMENT PRIORITY QUEUES
                   ↓
            ACCEPT / REJECT
                   ↓
         AUTOMATED REASSIGNMENT
                   ↓
        RESPONSIBILITY GAP / ESCALATE
                   ↓
        COORDINATE DEPENDENCIES
                   ↓
             FIELD RESPONSE
                   ↓
           EVIDENCE & PROOF
                   ↓
        CITIZEN VERIFICATION (YES/NO)
                   ↓
           RECOVERY RESTORATION
                   ↓
          IMMUTABLE AUDIT TRAIL
```

The system operates across two operational modes:
- **NORMAL MODE:** Municipal infrastructure failures, utility repairs, and traffic management.
- **DISASTER MODE:** Mass casualty, structural collapse, search & rescue, active fire, and emergency shelter coordination.

---

## 3. Technology Stack

- **Frontend:**
  - React 18
  - Vite 5
  - Tailwind CSS (Clean, serious public-service aesthetic; no AI slop, no neon/glassmorphism)
  - React Router v6
  - Leaflet & React-Leaflet (OpenStreetMap interactive GIS map)
  - Lucide React Icons
- **Backend:**
  - Node.js (v20+ / v24)
  - Express.js
  - JWT Authentication & Bcryptjs Password Hashing
- **Database & Persistence:**
  - MongoDB via Mongoose ORM
  - Built-in **Zero-Config Persistent Document Engine** (`backend/src/data/resqgrid.db.json`): Runs 100% out-of-the-box locally even if MongoDB daemon is not running!

---

## 4. Folder Structure

```
resqgrid/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Unified database connector (Mongo / JSON engine)
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── auditController.js
│   │   │   ├── authController.js
│   │   │   ├── caseController.js
│   │   │   ├── departmentController.js
│   │   │   ├── disasterController.js
│   │   │   ├── escalationController.js
│   │   │   ├── notificationController.js
│   │   │   ├── reassignmentController.js
│   │   │   ├── reportController.js
│   │   │   ├── resourceController.js
│   │   │   └── taskController.js
│   │   ├── data/
│   │   │   ├── dbStore.js            # Persistent JSON document database engine
│   │   │   └── resqgrid.db.json      # Local persistent database
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT authentication & role-based authorization
│   │   │   └── errorHandler.js       # Production error middleware
│   │   ├── models/
│   │   │   └── index.js              # All 17 required MongoDB collections/models
│   │   ├── routes/                   # Modular REST endpoints
│   │   ├── seed/
│   │   │   ├── seedData.js           # Demo scenarios RG-1042 & EQ-2026-001
│   │   │   └── seedRunner.js         # Command line seed tool
│   │   └── services/
│   │       ├── auditService.js
│   │       ├── dependencyEngine.js   # Prerequisite blocker & auto-unlocking
│   │       ├── escalationEngine.js   # Level 1 → Level 2 → Level 3 Command
│   │       ├── notificationService.js
│   │       ├── priorityEngine.js     # Multi-factor dynamic score calculation
│   │       ├── problemDecompositionEngine.js # Natural NLP triage
│   │       ├── reassignmentEngine.js # Alternative squad search & gap detector
│   │       └── responsibilityMappingService.js
│   ├── server.js                     # Express app initialization
│   ├── package.json
│   └── test_e2e.js                   # Complete 9-point integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DependencyList.jsx    # Visual dependency flow
│   │   │   ├── IncidentMap.jsx       # Leaflet OpenStreetMap with custom markers
│   │   │   ├── Navbar.jsx            # Public & role navigation + Disaster banner
│   │   │   ├── NotificationDropdown.jsx # Real-time alerts
│   │   │   ├── PriorityBadge.jsx     # CRITICAL, HIGH, MEDIUM, LOW
│   │   │   ├── ResponsibilityGraph.jsx # Tree decomposition graph
│   │   │   └── StatusBadge.jsx       # Standard statuses
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state, login, 1-click demo login
│   │   │   └── DisasterContext.jsx   # Global disaster mode broadcast
│   │   ├── pages/
│   │   │   ├── Admin/AdminDashboard.jsx
│   │   │   ├── Citizen/
│   │   │   │   ├── CaseTracking.jsx  # Live progress & YES/NO verification
│   │   │   │   ├── CitizenDashboard.jsx
│   │   │   │   ├── CitizenReports.jsx
│   │   │   │   └── ReportProblem.jsx # Natural report + 7-step analysis animation
│   │   │   ├── CommandCenter/
│   │   │   │   ├── AnalyticsCenter.jsx
│   │   │   │   ├── AuditTrail.jsx
│   │   │   │   ├── CommandDashboard.jsx
│   │   │   │   ├── CommandMap.jsx
│   │   │   │   ├── DisasterCenter.jsx
│   │   │   │   ├── EscalationCenter.jsx
│   │   │   │   ├── HandoffCenter.jsx
│   │   │   │   └── LiveIncidents.jsx
│   │   │   ├── Department/
│   │   │   │   ├── DepartmentDashboard.jsx
│   │   │   │   ├── DepartmentDependencies.jsx
│   │   │   │   ├── PriorityQueue.jsx # #1, #2, #3 work order with reasons
│   │   │   │   └── TaskDetails.jsx   # Accept, start, complete, cannot handle
│   │   │   ├── CaseDetailsView.jsx   # Full case inspector with graph & audit
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx         # 1-Click demo logins for all roles
│   │   │   └── RegisterPage.jsx
│   │   ├── services/api.js           # REST API client
│   │   ├── App.jsx                   # Role-based route guard
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── documentation/
│   └── architecture.md
├── .env.example
└── README.md
```

---

## 5. Database Collections

The database implements all 17 collections defined in the specification:
1. `users` — Citizens, Department Officers, Command Center, Admins
2. `departments` — Electricity, PWD, Drainage, Traffic, Medical, Fire, Search & Rescue, Relief, Safety
3. `agencies` — Coordinating district boards & mutual aid agencies
4. `resources` — Squads, Ambulances, Fire Engines, Clearance Trucks (Available, Busy, Offline)
5. `capabilities` — Technical capabilities required to clear incidents
6. `reports` — Raw citizen submissions with natural language text and coordinates
7. `cases` — Master coordinated multi-agency cases (e.g. `RG-1042`, `RG-2001`)
8. `problems` — Individual problems decomposed from master cases
9. `tasks` — Dedicated work orders dispatched to specific departments
10. `dependencies` — Upstream blockers and sequence constraints
11. `assignments` — Squad allocations and work order schedules
12. `escalations` — Level 1, 2, and 3 escalation records
13. `notifications` — Role-specific alerts delivered to citizens and departments
14. `auditLogs` — Complete immutable audit trail of every status transition
15. `disasterEvents` — Consolidated master disaster events (e.g. `EQ-2026-001`)
16. `priorityRules` — Configurable algorithm weights
17. `jurisdictions` — Operational zones and boundaries

---

## 6. Demo Accounts (1-Click Login Available)

On the **Login Page (`/login`)**, click any of the 1-Click Quick Demo buttons, or use these credentials:

| Role | Email / ID | Password | Portal Access |
|---|---|---|---|
| **Citizen** | `citizen@resqgrid.demo` | `password123` | Report incident, track progress, verify resolution |
| **Electricity Dept** | `electricity@resqgrid.demo` | `password123` | Priority queue, accept, start, complete work |
| **PWD / Road Dept** | `pwd@resqgrid.demo` | `password123` | Priority queue, cannot handle / reassign |
| **Command Center** | `command@resqgrid.demo` | `password123` | GIS Map, live cases, disaster toggle, handoffs |
| **System Admin** | `admin@resqgrid.demo` | `password123` | Priority engine weights, department management |

---

## 7. How to Run the Application Locally

### Prerequisites:
- Node.js (v18, v20, or v24)
- NPM

### Step 1: Start Backend Server
```bash
cd backend
npm install
npm start
```
*The backend starts on `http://localhost:5000` and automatically initializes demo data.*

### Step 2: Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

### Running Automated Integration Tests:
```bash
cd backend
node test_e2e.js
```
*Runs the full 9-point test suite verifying decomposition, priority calculation, dependency unlocking, reassignment, and verification.*

---

## 8. Exact Hackathon Demo Walkthrough

### Scenario A: Normal Mode Municipal Breakdown (Case RG-1042)
1. **Citizen View (`/login` → 1-Click Citizen):**
   - Click **"REPORT A PROBLEM"**.
   - Click the preset button: **"Fill Demo Case RG-1042"**:
     > *"There is a damaged electrical pole near my street. The drainage is blocked, water is accumulating on the road, the road is damaged and vehicles cannot cross properly."*
   - Click **"SUBMIT REPORT & INITIATE TRIAGE"**.
   - Watch the animated 7-step analysis engine identify:
     - Problem 1: Electrical Hazard & Pole Damage (Electricity)
     - Problem 2: Road Surface & Structural Damage (PWD)
     - Problem 3: Drainage Clog & Waterlogging (Drainage)
     - Problem 4: Vehicle Access & Route Obstruction (Traffic)
   - Click **"Track This Case in Real Time"**.
2. **Electricity Department View (`/login` → 1-Click Electricity):**
   - Go to **"MY PRIORITY QUEUE"**.
   - Notice Case `RG-1042` is ranked **#1 CRITICAL** with explanation: *"Immediate safety hazard & blocks downstream road crew"*.
   - Click **"View Task Details"**.
   - Click **"ACCEPT TASK"** → Click **"START WORK"**.
   - Click **"MARK WORK COMPLETED"** with notes.
   - *Behind the scenes: The dependency engine automatically unblocks the downstream PWD road task!*
3. **PWD / Road Department View (`/login` → 1-Click PWD):**
   - Open Task Details for Road Damage.
   - The task is now unblocked and ready!
   - Demonstrate Reassignment: Click **"CANNOT HANDLE"** → Reason: *"No team available (PWD Team A busy)"*.
   - The reassignment engine searches available resources, recommends **PWD Team B (Emergency Road Clearance)**, displays match reasons, and reassigns the task!
4. **Command Center View (`/login` → 1-Click Command):**
   - Inspect the **GIS Map**, **Responsibility Graph**, **Handoff Center**, and **Audit Trail**.
5. **Citizen Verification:**
   - Return to Citizen Case Tracking.
   - When work is done, prompt appears: **"YES — RESOLVED"** or **"NO — STILL A PROBLEM"**.
   - Citizen clicks **"YES — RESOLVED"**.
   - Case transitions to `RESOLVED` and complete audit log is finalized!

---

### Scenario B: Disaster Mode Earthquake (EQ-2026-001)
1. In Command Center, click **"ACTIVATE DISASTER MODE"**.
2. A persistent red status bar appears across the platform: **"DISASTER MODE: ACTIVE"**.
3. Go to **"Disaster Center"**:
   - See 47 citizen reports consolidated under Master Event `EQ-2026-001`.
   - Priority queues auto-adjust for life safety:
     - Search & Rescue (Score 98 - CRITICAL)
     - Medical Emergency / Ambulances (Score 95 - CRITICAL)
     - Fire & Rescue (Score 92 - CRITICAL)
     - Road Clearance (Score 84 - HIGH)
     - Shelter Support (Score 68 - MEDIUM)
   - Review Resource Matching: Available ambulances, fire tenders, and rescue units.
   - Track post-disaster **Recovery Phase** checklist.
