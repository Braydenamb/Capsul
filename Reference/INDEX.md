# Capsul / OpsLens — AI Agent Reference Index

Welcome to the AI Agent Reference documentation for **Capsul** (also known as **OpsLens**), an Intelligent Manufacturing Command Center and decision-support workspace built for **CALIBER 2026, Case 2 — Intelligence Manufacturing**.

This folder (`/home/miq/Documents/Caliber 2026/Website/Reference`) provides a complete, structured technical reference of the application architecture, data models, analytical heuristics, user interfaces, authentication system, and full source code to assist AI coding agents in understanding, modifying, and maintaining the application.

---

## Reference Document Map

| Document | Description | Key Topics Covered |
| :--- | :--- | :--- |
| [ARCHITECTURE_AND_STATE.md](./ARCHITECTURE_AND_STATE.md) | Technical architecture & state flow | Single Page Application (SPA) architecture, reactive state management (`state.js`), URL hash routing, global event delegation, authentication & RBAC (`auth.js`, `authConfig.js`). |
| [ANALYTICS_AND_DATA_MODEL.md](./ANALYTICS_AND_DATA_MODEL.md) | Mathematical heuristics & domain logic | 3σ signal baseline deviation, multi-signal flagging rules, priority index 0–100 heuristic scoring, energy forecasting models, RCA lifecycle states, dataset schemas (`raw.js`, `rcaConfig.js`, `incidents.js`), and data quality rules. |
| [VIEWS_AND_UI_COMPONENTS.md](./VIEWS_AND_UI_COMPONENTS.md) | User interface & component library | Breakdown of all 5 views (Command, Investigate, Actions, Foundation, Impact) + Login view, and UI components (`header`, `timeline`, `decisionLoop`, `statusChip`, `modal`). |
| [FULL_CODEBASE_REFERENCE.md](./FULL_CODEBASE_REFERENCE.md) | Complete consolidated codebase | Single-file listing of every JavaScript, CSS, and HTML source file in the repository for fast context loading. |

---

## Application Overview

- **Product Name**: CAPSUL (OpsLens)
- **Tagline**: Intelligent Manufacturing Workspace & Decision-Support System
- **Core Workflow**: DETECT → UNDERSTAND → INVESTIGATE → ACT → TRACK → VERIFY
- **Tech Stack**:
  - **Framework**: Modern Vanilla JavaScript (ES Modules, zero heavy UI framework runtime overhead)
  - **Styling**: Custom CSS with design tokens, CSS variables, dark/light theme support, responsive CSS Grid/Flexbox layouts
  - **Bundler / Dev Server**: Vite (`vite.config.js`)
  - **Deployment / Engine**: Single-Page Web Application running in modern browsers

---

## Project Directory Structure

```
/home/miq/Documents/Caliber 2026/Website/opslens/
├── index.html                  # HTML entry point with app container
├── package.json                # Project dependencies and npm scripts
├── src/
│   ├── main.js                 # Application bootstrap, routing, global event handlers
│   ├── auth/
│   │   ├── auth.js             # Authentication state, session storage, permissions
│   │   └── authConfig.js       # Demo accounts, roles, RBAC matrix, allowed lenses/views
│   ├── core/
│   │   ├── analytics.js        # Baseline calc, 3σ deviation, Priority Index, RCA lifecycle
│   │   ├── formatting.js       # Formatting utils (currency, numbers, dates, time clamps)
│   │   ├── incidents.js        # Incident DB queries, similarity search, grouping
│   │   └── state.js            # Global reactive state object & Lens definitions
│   ├── data/
│   │   ├── raw.js              # Raw telemetry dataset (5 critical assets, PI hourly data)
│   │   └── rcaConfig.js        # RCA 4P/4M+1E tables, causes, signals, countermeasures
│   ├── components/
│   │   ├── header.js           # Navigation bar, user menu, historical replay popover
│   │   ├── login.js            # Authentication modal / login view
│   │   ├── modal.js            # Toast notifications and modal dialogs
│   │   ├── statusChip.js       # Asset status chip badge generators
│   │   ├── decisionLoop.js     # Decision funnel & RCA visual bars
│   │   └── timeline.js         # Event timeline ribbon component
│   ├── views/
│   │   ├── command.js          # Manufacturing Command Center view (cmd)
│   │   ├── investigate.js      # Single-Asset Root Cause & Telemetry view (inv)
│   │   ├── actions.js          # Action Governance & Kanban board view (act)
│   │   ├── foundation.js       # Data Foundation & Trust view (fnd)
│   │   └── impact.js           # Business Impact & Scenario analysis view (imp)
│   └── styles/
│       └── main.css            # Global CSS variables, typography, layouts, themes
└── Reference/                  # AI Agent Markdown Documentation (This Directory)
```
