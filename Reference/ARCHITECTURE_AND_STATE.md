# Architecture & State Management Reference

This document details the software architecture, reactive state management, URL hash routing system, event delegation patterns, and role-based access control (RBAC) security model in **Capsul (OpsLens)**.

---

## 1. Single Page Application (SPA) Architecture

Capsul is built as a pure Vanilla JavaScript ES Module Single Page Application. It uses no heavy framework dependencies (e.g. React/Vue/Angular), resulting in instant load times, minimal bundle size, and total control over DOM rendering.

### Rendering Cycle

```mermaid
flowchart TD
    A[User Action / Hash Change / Timeline Drag] --> B[State Update in S]
    B --> C[syncRoute]
    C --> D[calc Analytics]
    D --> E[initHeader & head Update Header]
    E --> F[VIEW[S.tab] Render View Function]
    F --> G[DOM Container #app.innerHTML Updated]
```

1. **State Mutation**: User interactions modify properties on the global `state` object exported from `src/core/state.js`.
2. **Re-calculation**: `calc()` re-evaluates active equipment telemetry, 3σ deviations, heuristic priority scores, and energy forecasts for date `S.ms`.
3. **Header Sync**: `initHeader()` & `head()` update tab navigation active indicators and replay clock display.
4. **View Compilation**: `VIEW[S.tab]()` returns an HTML string corresponding to the active view (`cmd`, `inv`, `act`, `fnd`, `imp`).
5. **DOM Injection**: `#app.innerHTML` is replaced with the compiled HTML string.

---

## 2. Global State Schema (`src/core/state.js`)

The global application state is exported as `state` (and aliased as `S`).

```js
export const state = {
  tab: 'cmd',                 // Active view key: 'cmd' | 'inv' | 'act' | 'fnd' | 'imp'
  ms: D0('2026-02-25'),       // Current replay date in Unix timestamp milliseconds
  lens: 'Operations',         // Active user lens profile ('Operations', 'Maintenance', 'Energy', 'HSE', 'Management')
  sel: 'KO-3201',             // Selected asset tag for Investigate view ('KO-3201', 'PU-2101B', 'HE-3301', 'PM-4405B', 'BL-5702')
  ev: null,                   // Highlighted evidence signal array or null
  evI: null,                  // Index of highlighted evidence signal
  W: { cr: 20, ag: 30, tt: 30, cs: 20 }, // User-customizable Priority Index heuristic weights
  wOpen: false,               // Weight editor accordion open state
  f: {},                      // Active breakdown filters { discipline, plant, etc. }
  mode: 'all',                // Display mode filter
  created: {},                // Created user CAPA actions { 'TAG|index': { ms, due } }
  ack: {},                    // Acknowledged alert timestamps { 'TAG': ms }
  fb: {},                     // User feedback on hypotheses { 'TAG': 'y' | 'n' }
  mv: {},                     // Action board column movements { 'TAG|index': columnIndex }
  dis: {},                    // Dismissed recommendations { 'TAG|index': 1 }
  res: {},                    // Data quality resolution selections { checkId: selectedValue }
  inc: null,                  // Selected incident ID for detailed breakdown modal
  af: 'All',                  // Action view asset filter tag ('All' or equipment tag)
  I: { cap: 40, red: 60, hrs: 6 }, // Business impact scenario slider parameters
  demo: null,                 // Guided demo timeout handle list
  play: null,                 // Historical replay interval timer handle
  drag: false                 // Timeline slider drag state
};
```

---

## 3. Router & Hash Synchronization (`src/main.js`)

Routing is hash-based (`#cmd`, `#inv`, `#act`, `#fnd`, `#imp`).

### Key Navigation Functions

- **`getTabFromHash()`**: Reads `window.location.hash`, validates against allowed tabs, and returns valid tab key or `null`.
- **`syncRoute()`**: Enforces role permissions via `canAccessView(tab)`. If the hash is unpermitted or invalid, it redirects to the user's default view.
- **`go(tabKey, scroll = true)`**: Updates `S.tab`, updates `window.location.hash`, invokes `render()`, and scrolls to top.
- **`window.onhashchange` / `window.onpopstate`**: Enables native browser Back/Forward button support.

---

## 4. Authentication & Role-Based Access Control (RBAC)

Authentication is managed via `src/auth/auth.js` and configured in `src/auth/authConfig.js`.

### User Profiles

| Username | Password | Role | Default View | Allowed Views | Allowed Lenses | Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ops` | `ops` | Operations Lead | `cmd` | `cmd`, `inv`, `act`, `fnd` | Operations, Maintenance | `ack`, `createAction` |
| `maint` | `maint` | Reliability Engineer | `cmd` | `cmd`, `inv`, `act`, `fnd` | Maintenance, Operations, HSE | `ack`, `createAction`, `verifyAction` |
| `hse` | `hse` | HSE Coordinator | `cmd` | `cmd`, `inv`, `act`, `fnd` | HSE, Operations | `ack`, `createAction` |
| `exec` | `exec` | Executive / VP | `cmd` | `cmd`, `inv`, `act`, `fnd`, `imp` | All 5 Lenses | `ack`, `createAction`, `verifyAction` |
| `admin` | `admin` | System Admin | `cmd` | `cmd`, `inv`, `act`, `fnd`, `imp` | All 5 Lenses | `*` (All) |

### Session Persistence
Session is stored in `sessionStorage` under `capsul_auth_session`.

---

## 5. Event Delegation Architecture

Instead of binding individual event listeners to hundreds of dynamic DOM nodes, `src/main.js` uses **document-level event delegation**:

- **Clicks**: Matches `t.closest('[data-tab], [data-open], [data-filt], [data-mk], [data-mv], [data-ack], ...')` and dispatches state updates.
- **Inputs**: Listens for `input` on `#day` (timeline slider), `[data-w]` (score weights), and `[data-im]` (impact sliders).
- **Keyboard**: Enables accessibility keyboard execution (`Enter` on `role="button"` or `tabindex="0"`).
- **Pointer Events**: Handles drag interaction for historical timeline scrubbing.
