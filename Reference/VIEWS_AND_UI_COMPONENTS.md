# Views & UI Components Reference

This document describes the structure, data bindings, user interactions, and visual layout of all pages and reusable UI components in **Capsul (OpsLens)**.

---

## 1. Application Header Component (`src/components/header.js`)

The persistent top header bar (`#header`) contains:
- **Brand Title**: Capsul wordmark.
- **View Navigation Tabs (`#tabs`)**: Tab buttons dynamically filtered by user permissions (`canAccessView(k)`). Active view highlighted with `aria-current="page"`.
- **Historical Replay Popover Trigger (`#replay-toggle`)**: Button showing active replay date (`dS(S.ms, true)`). Toggles collapsible date slider & event stepper.
- **User Account Menu (`#user-menu-toggle`)**: User avatar, name, role badge. Opens dropdown containing:
  - Guided Demo (`#demo`)
  - How it Works modal (`#how`)
  - Theme Switcher (`#theme`)
  - Sign Out (`#logout-btn`)
- **Collapsible Replay Panel (`#replay-popover`)**: Historical view banner, range slider (`#day`), step buttons (`◄ Prev`, `Next ►`, `Play/Pause`), and jump selector (`#jump`).

---

## 2. Views Breakdown

### 2.1 Manufacturing Command Center (`cmd` — `src/views/command.js`)
*Primary executive and operations overview page.*

- **Header Section**: Page title, governed view indicator, active replay date.
- **Plant Health KPIs**: 4 summary cards:
  1. *Production Performance*: Target rate %, shift trend.
  2. *Plant Reliability*: Availability %, online critical asset count.
  3. *Specific Energy*: GJ/ton, deviation vs forecast.
  4. *Active Operational Risk*: Count of flagged abnormalities & critical risk priority.
- **Attention Required Hero Card**: High-priority card featuring the top degraded asset (`KO-3201` or active tripped/warning asset):
  - Asset status badge (`TRIPPED`, `HIGH RISK`, `WARNING`, `NORMAL`).
  - Primary & secondary telemetry readings with threshold limits.
  - Time-aware RCA state & cause chain hypothesis.
  - Action button navigating directly to Investigate (`Investigate KO-3201 ►`).
- **Plant & Unit Overview Matrix**: Operational status cards for major processing units (ARP, ZCU, NUP, OPP).
- **Side-by-Side Lower Panels**:
  - *Recent Operational Events*: Chronological log up to current date `S.ms`.
  - *CAPA Action Status Summary*: Priority ranking queue (`tankRows()`) driven by score weights.

---

### 2.2 Investigate / Asset Root Cause (`inv` — `src/views/investigate.js`)
*Deep-dive diagnostics page for individual equipment assets.*

- **Top Asset Selection Chips**: Quick switcher buttons (`KO-3201`, `PU-2101B`, `HE-3301`, `PM-4405B`, `BL-5702`) displaying current status badge.
- **Equipment Header**: Asset tag, full title, plant unit, criticality class, discipline, AR number, priority index score.
- **Replay Status Banner**: Lead time summary comparing Capsul early warning vs DCS alarm and trip date.
- **Left Column — Telemetry & Evidence**:
  - *Synchronized Telemetry SVG Charts*: 4 micro-charts (`multiple()`) showing weekly readings, baseline ±3σ green band, DCS alarm line, trip limit line, and current replay date marker.
  - *Outage & Loss Traceability*: Hourly PI feed rate graph (`outage()`), downtime hours, production loss tonnage, financial loss.
  - *Similar Historical Incidents Table*: Matching incidents from 380-incident database prior to `S.ms` with match score %, downtime, and loss.
- **Right Column — Structured AI Root Cause Workflow**:
  - 5-step structured insight block (Observed Signals → Correlated Telemetry → Probable Cause Hypothesis → Confidence & Evidence State → Next Evidence Needed).
  - Cause hypothesis strength progress bars (4P / 4M+1E table).
  - Recommended CAPA actions list with PIC assignment, risk description, countermeasure, and "Create Action Assignment" button.

---

### 2.3 Action Governance Board (`act` — `src/views/actions.js`)
*Accountable CAPA assignment and tracking Kanban board.*

- **KPI Cards**: Summary counts for Recommended Actions, Open / In Progress, Overdue Assignments, Awaiting Verification.
- **Filter Bar**: Filter by specific asset (`All` or asset tag), Reset Board State button.
- **Mobile Stage Tabs**: Tab selector for small screens (<768px).
- **5-Column Governance Kanban Board**:
  1. *Recommended*: System-suggested actions from RCA records or active flags.
  2. *Open*: Created assignments awaiting work start.
  3. *In Progress*: Active work assignments.
  4. *Verification*: Completed physical work awaiting baseline signal recovery verification.
  5. *Closed*: Verified closed assignments.
- **Action Cards (`.cd`)**: Display tag, title, type badge (Corrective, Preventive, Roll-out), owner PIC, due date, source, overdue badge, risk/countermeasure accordion, and role-gated action buttons (e.g. `Create Action`, `Start Work`, `Verify & Close`).

---

### 2.4 Data Foundation & Trust (`fnd` — `src/views/foundation.js`)
*Data lineage, source freshness, KPI definitions, and audit rules.*

- **Data Source Domains & Trust Status Cards**: Freshness, record volume, data quality score %, and usage for 4 primary data sources (DCS/PI, Equipment, Incident DB, Downtime/RCA).
- **Data Lineage Pipeline Diagram**: Visual workflow from Raw Telemetry → Baseline Model → Governed KPI → Anomaly Engine → Workflow Investigation.
- **Governed Asset Key Map**: Cross-system mapping table linking Equipment Tag, PI Sensor Tag, Instrument Tag, MTO No., AR No., and Plant Code.
- **Standardized KPI Dictionary**: Governed formulas, owners, primary sources, and refresh frequencies.
- **Data Quality Rules & Resolution Panel**: Interactive data reconciliation checks with resolution toggle buttons (`Undo`, `Golden record`).

---

### 2.5 Business Impact & Scenario (`imp` — `src/views/impact.js`)
*Financial valuation and plant estate ROI simulation.*

- **Measured Replay Table**: Realized lead time, downtime, and financial loss savings across the 5 RCA replay cases.
- **Whole-Plant Estate Scenario Simulator**: Interactive range sliders for:
  - *Capture Rate*: Share of addressable failures caught early (`S.I.cap` %).
  - *Loss Avoidance*: Share of loss avoided (`S.I.red` %).
  - *Validation Time Saved*: Hours saved per incident (`S.I.hrs` h).
- **Loss by Failure Mechanism Chart**: Financial breakdown by failure mode (vibration, leakage, fouling, wear, etc.).

---

### 2.6 Authentication / Login View (`src/components/login.js`)
- Renders when unauthenticated. Displays login form, role selection shortcuts (`ops`, `maint`, `hse`, `exec`, `admin`), and error feedback.

---

## 3. UI Helper Components

- **`modal.js`**: `cap(message, duration)` displays floating toast notifications; `openModal(html)` opens modal dialogs.
- **`statusChip.js`**: `chip(status)` returns HTML status badges (`NORMAL`, `WARNING`, `ALERT`, `TRIPPED`, `RECOVERING`).
- **`timeline.js`**: Timeline visual bar generators.
- **`decisionLoop.js`**: Decision loop funnel stage visualizers.
