# Architecture & Frontend/Backend Separation

This project is organized into a decoupled architecture separating the **Frontend (Client)** and **Backend (Server)** while sharing standardized TypeScript domain types.

---

## Directory Structure

```
├── src/
│   ├── client/                  # 🖥️ FRONTEND (React 19, Tailwind CSS, Vite)
│   │   ├── main.tsx             # Frontend DOM mounting entry point
│   │   ├── App.tsx              # Main UI routing and shell layout
│   │   ├── index.css            # Tailwind styling entry
│   │   ├── components/          # Reusable UI widgets, modals, drawers & cards
│   │   ├── pages/               # Page views (Shop, ProductDetail, Checkout, Admin, etc.)
│   │   ├── services/            # API client layer (with dynamic API_BASE resolution)
│   │   ├── store/               # Client-side state management (Zustand)
│   │   ├── data/                # Static catalogs, currencies, brand mappings
│   │   ├── i18n/                # Localization & language contexts
│   │   └── utils/               # Formatting, image proxying & sanitization helpers
│   │
│   ├── server/                  # ⚙️ BACKEND (Express, Node.js, REST API)
│   │   ├── app.ts               # Express application config, CORS, middlewares, routes
│   │   ├── standalone.ts        # Standalone HTTP server entry (for pure API deployment)
│   │   ├── routes/              # Modular REST endpoint routers
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── wishlist.routes.ts
│   │   │   ├── order.routes.ts
│   │   │   ├── admin.routes.ts
│   │   │   └── misc.routes.ts
│   │   ├── middleware/          # JWT auth, RBAC permissions, rate limiting
│   │   ├── services/            # Business logic (catalog, payments, auth, etc.)
│   │   ├── db/                  # Data store, seed catalog (5,600+ products)
│   │   └── scripts/             # Database migration and admin seeding scripts
│   │
│   └── types/                   # 🔄 SHARED (Domain Models & Types)
│       └── index.ts             # Type contracts (User, Product, Category, Order, etc.)
│
├── server.ts                    # 🚀 Unified dev/production server for AI Studio (Express + Vite)
├── vite.config.ts               # Vite configuration with aliases & standalone proxy
├── package.json                 # Unified & decoupled npm scripts
└── .env.example                 # Environment variable specifications
```

---

## Running the Applications

### 1. Full-Stack Unified Mode (Standard AI Studio Dev & Deploy)
Runs the unified Express + Vite application on port 3000:
```bash
npm run dev        # Starts full-stack on http://localhost:3000
npm run build      # Builds frontend (Vite) and backend (esbuild) into dist/
npm start          # Starts production full-stack server
```

### 2. Frontend Only (Standalone Client)
Run only the React/Vite frontend:
```bash
npm run dev:client # Starts Vite dev server (proxies /api to backend)
npm run build:client # Builds static SPA to dist/
npm run preview    # Previews production static build
```
To point the frontend to a remote or separate backend server, configure:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 3. Backend Only (Standalone REST API)
Run only the Express REST API server without Vite or static UI:
```bash
npm run dev:server    # Starts standalone backend API (default port 5000)
npm run build:server  # Compiles standalone backend to dist/api-server.cjs
npm run start:server  # Runs compiled production standalone API server
```

---

## API Communication & Decoupling Guarantees

1. **No Direct Module Cross-Imports**:
   - The frontend (`src/client`) **never** imports backend server modules or database files.
   - The backend (`src/server`) **never** imports client React modules.
   - Both layers only share type contracts from `src/types/index.ts`.

2. **Dynamic API Configuration**:
   - `src/client/services/api.ts` uses `getApiBaseUrl()`, which automatically respects `VITE_API_BASE_URL` when deployed separately, or defaults to `/api` when hosted unified or proxied.

3. **CORS & Standalone Ready**:
   - `src/server/app.ts` includes flexible CORS support accepting requests from frontend origins (e.g., `http://localhost:5173`, custom production domains, or `CORS_ORIGIN` env variable).
