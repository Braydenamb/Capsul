# Capsul — Intelligent Manufacturing Dashboard

Capsul is a modern, responsive, high-performance manufacturing intelligence application built with **Vite + Vanilla JavaScript using ES Modules**.

---

## 🔑 Demo Login Accounts

Capsul features persona-based authentication and role-based access control (RBAC). Use the following credentials to test different access profiles:

| Role | Username | Password | Default Lens | Accessible Views | Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Operations Lead** | `ops` | `ops` | Operations | Command, Investigate, Actions, Foundation | Acknowledge alert, Create action, Start work, Send to verification |
| **Reliability Engineer** | `maint` | `maint` | Maintenance | Command, Investigate, Actions, Foundation | Acknowledge alert, Create action, Dismiss recommendation, Start work, Send to verification, Verify & Close |
| **HSE Coordinator** | `hse` | `hse` | HSE | Command, Investigate, Actions, Foundation | Acknowledge alert, Create action |
| **Plant Manager / Exec** | `exec` | `exec` | Management | All views (Command, Investigate, Actions, Foundation, Impact) | Acknowledge alert, Create action, Dismiss recommendation, Defer due date, Verify & Close (Governance oversight) |
| **System Admin** | `admin` | `admin` | Operations | All views | Full administrative permissions (`*`) |

---

## 🔒 Security Note (Prototype Limitation)

This demo implementation handles authentication and access control on the client side using browser `sessionStorage`. Because data and logic are bundled into client-side JavaScript, this architecture is designed for demonstration of UX, authorization flow, and persona-aware design. True production security requires server-side identity verification and authorized data endpoints.

---

## 🚀 Development & Build

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```
