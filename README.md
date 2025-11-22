# 🚀 GigTasker UI

> The "2025 Standard" Angular 21 (Zoneless) frontend for the GigTasker microservice platform.

This application is the "face" of the GigTasker ecosystem. It's a modern, high-performance, single-page application (SPA) built with a fully zoneless architecture. It handles user registration, login, task creation, bidding, and dashboard management by communicating with the secure `gigtasker-api-gateway`.

---

## ✨ Features

* **⚡ Modern Angular Architecture:**
    * **100% Zoneless:** Built from the ground up to be free of `Zone.js` for maximum performance.
    * **Signal-based State:** Uses Angular Signals (including `signal`, `computed`, and `toSignal`) for all state management.
    * **Built-in Control Flow:** Uses the new `@if`, `@for`, and `@switch` template syntax.
    * **Standalone Components:** No `NgModules`. Every component is standalone and manages its own dependencies.

* **🛡️ Secure & Reactive UI:**
    * **OIDC Authentication:** Integrates with Keycloak for a robust, token-based login and registration flow (`angular-oauth2-oidc`).
    * **Functional Route Guards:** Uses modern, functional guards (`CanActivateFn`) to protect the dashboard.
    * **HTTP Interceptor:** Automatically attaches bearer tokens to all outgoing API requests.

* **🎨 "Catchy" Material Design:**
    * **Animated Splash Screen:** A "fake" 1-second loader with pure CSS animations (`animate.enter`/`animate.leave`) for a professional-feeling startup.
    * **Material 3 Theming:** Uses the latest Angular Material components.
    * **Reactive Forms:**
        * `MatStepper` for a "catchy" multi-step "Create Task" form.
        * `MatDialog` for "Place Bid" and "View Bids" popups.
        * `MatSnackBar` for "toast" notifications (e.g., "Task Posted!").
    * **Dynamic Dashboard:**
        * `MatTabs` for lazy-loading "All Gigs," "My Gigs," and "My Bids."
        * `MatTable` for displaying lists of data.
        * `MatChip` (with `[ngClass]`) for "catchy" status indicators (e.g., `ACCEPTED`, `REJECTED`).

---

## 🛠️ Tech Stack

* **Framework:** Angular 21+
* **Language:** TypeScript
* **Styling:** SCSS (Sassy CSS)
* **UI Kit:** Angular Material 19+
* **Authentication:** `angular-oauth2-oidc` (for Keycloak)

---

## 🚀 Getting Started

### 1. Prerequisites

This is **only a frontend**. It is useless unless the **GigTasker Backend Platform** is fully running. Before you run `ng serve`, you MUST have:

1.  **All 7 Backend Services Running:**
    * `docker-compose up -d` (for Postgres, RabbitMQ, Keycloak)
    * `config-server` (running on `localhost:8888`)
    * `service-registry` (running on `localhost:8761`)
    * `api-gateway` (running on `localhost:9090`)
    * `user-service`
    * `task-service`
    * `bid-service`
    * `notification-service`

2.  **Keycloak Configured:**
    * Your Keycloak server must be running on `http://localhost:8180`.
    * You must have a realm named `gigtasker`.
    * That realm must have a client with the ID `gigtasker-angular`.
    * That client must have "User registration" **ON** (in Realm Settings).
    * That client must have `http://localhost:4200` set as a **Valid redirect URI** and a **Web origin**.

### 2. Installation & Running

```bash
# 1. Clone this repository
git clone [https://github.com/your-name/gigtasker-ui.git](https://github.com/your-name/gigtasker-ui.git)
cd gigtasker-ui

# 2. Install all node_modules
npm install

# 3. Run the development server
ng serve
