# CLAUDE.md — NPC ITSOM Dashboard: React Implementation

## Project Overview

You are building a production-grade React dashboard portal for the National Planning Council (NPC) of Qatar's IT Service & Operations Management. This replaces an existing HTML prototype with a scalable React application backed by an administrative data management layer.

The project is operated by Malomatia, Qatar's government-owned national IT services company.

### What Already Exists

- **HTML Prototype**: `reference/NPC_Dashboard_FA_Icons.html` (6,802 lines) — a complete single-file SPA with 17 dashboard pages, full CSS theme system, navigation, and static data. This is your pixel-perfect visual reference. Every color, spacing, radius, font, and layout must match.
- **Executive Command Center**: `reference/ExecutiveCommandCenter.jsx` — a React component concept for the new executive landing page that replaces the prototype's icon grid. This is the "So What" view for IT leadership.

### What You Are Building

**Phase 1 (current scope):** A React + TypeScript SPA with:
1. An executive command center landing page (new — replaces icon grid)
2. All 17 operational dashboard pages (converted from prototype HTML)
3. A shared component library extracted from common UI patterns
4. A DataProvider abstraction that reads from local JSON files now and swaps to APIs later
5. An admin portal for uploading/managing data files
6. A lightweight Node.js backend for file upload, validation, and serving data

**The cardinal rule:** Every component consumes a standard JSON contract via `useDataSource()`. Components never know whether data came from a file upload or a live API. This is how Phase 1 scales to Phase 2 (API integration) without rewriting UI code.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | React 18+ with TypeScript | Strict mode enabled |
| Build | Vite | Fast HMR, ESM-native |
| Routing | React Router v6 | Lazy-loaded pages |
| State | Zustand (UI state) + TanStack React Query (data state) | React Query handles caching, refetching, staleness |
| Charts | Recharts | For bar, line, area charts |
| Custom Viz | Raw SVG components | For gauges, donuts, heatmaps (match prototype exactly) |
| Styling | CSS Custom Properties + CSS Modules | Prototype's :root variables carry over directly |
| Icons | Font Awesome 6 Free | Exact match to prototype |
| Backend | Node.js + Express | File upload, data serving, admin API |
| Database | SQLite (via better-sqlite3) | Metadata, upload history, user sessions |
| File Parsing | PapaParse (CSV), SheetJS/xlsx (Excel), native JSON | Admin upload processing |
| Auth | Express sessions (Phase 1) | Simple admin login |

---

## Project Structure

```
npc-itsom-dashboard/
├── CLAUDE.md                          # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
├── reference/                         # DO NOT MODIFY — reference materials
│   ├── NPC_Dashboard_FA_Icons.html    # Visual reference prototype
│   └── ExecutiveCommandCenter.jsx     # Executive landing page concept
│
├── src/
│   ├── main.tsx                       # App entry point
│   ├── App.tsx                        # Router + layout selection
│   ├── theme/
│   │   ├── variables.css              # All CSS custom properties from prototype :root
│   │   ├── global.css                 # Reset, scrollbar, base typography
│   │   └── theme.ts                   # Theme tokens exported as TS constants
│   │
│   ├── components/                    # Shared component library
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Landing vs Inner layout switcher
│   │   │   ├── Sidebar.tsx            # Fixed sidebar with nav sections
│   │   │   ├── Topbar.tsx             # Sticky topbar with back button, title, chips
│   │   │   ├── LandingGrid.tsx        # Card grid (kept as fallback, but replaced by CommandCenter)
│   │   │   └── PageContainer.tsx      # Wraps each dashboard page
│   │   ├── data-display/
│   │   │   ├── KPICard.tsx            # Numeric KPI with label, value, trend, color variant
│   │   │   ├── ChartCard.tsx          # Container with title + pluggable chart content
│   │   │   ├── DataTable.tsx          # Sortable table with badge/progress/colored cells
│   │   │   ├── Badge.tsx              # Status badges (b-red, b-orange, b-green, etc.)
│   │   │   ├── ProgressBar.tsx        # Labeled progress bars with value display
│   │   │   └── SectionLabel.tsx       # Gold-bordered section labels
│   │   ├── charts/
│   │   │   ├── GaugeChart.tsx         # Semi-circular SVG gauge (observability)
│   │   │   ├── DonutChart.tsx         # SVG donut with legend
│   │   │   ├── HeatmapTable.tsx       # Time-series severity grid (6-level color scale)
│   │   │   ├── SLAProgressBar.tsx     # Priority-labeled SLA bar with met/breached counts
│   │   │   ├── BarChart.tsx           # Recharts wrapper with NPC theme
│   │   │   └── LineChart.tsx          # Recharts wrapper with NPC theme
│   │   └── ui/
│   │       ├── FilterBar.tsx          # Date range + source chip + clear filters
│   │       ├── LiveDot.tsx            # Pulsing green live indicator
│   │       ├── DateChip.tsx           # Styled date/context pills
│   │       └── BackButton.tsx         # Pill-shaped back-to-home button
│   │
│   ├── pages/
│   │   ├── CommandCenter.tsx          # NEW: Executive landing page
│   │   ├── itsm/
│   │   │   ├── IncidentPage.tsx       # page-incident
│   │   │   ├── ServiceRequestPage.tsx # page-sr
│   │   │   ├── SLAPage.tsx            # page-sla
│   │   │   ├── ProblemPage.tsx        # page-problem
│   │   │   ├── ChangePage.tsx         # page-change
│   │   │   └── RiskPage.tsx           # page-risk
│   │   ├── itam/
│   │   │   ├── M365Page.tsx           # page-m365
│   │   │   ├── EntraPage.tsx          # page-entra (with 5 sub-tabs)
│   │   │   ├── AssetPage.tsx          # page-asset
│   │   │   ├── LifecyclePage.tsx      # page-lifecycle
│   │   │   └── ServiceScopePage.tsx   # page-servicescope
│   │   ├── itom/
│   │   │   ├── ObservabilityPage.tsx  # page-observability
│   │   │   ├── BizAppsPage.tsx        # page-bizapps
│   │   │   └── TechAppsPage.tsx       # page-techapps
│   │   └── optimization/
│   │       ├── FinOpsPage.tsx         # page-finops
│   │       ├── FinOpsMaturityPage.tsx # page-finops-maturity
│   │       └── CCOEPage.tsx           # page-ado
│   │
│   ├── data/
│   │   ├── provider.ts               # DataProvider factory — returns FileAdapter or APIAdapter
│   │   ├── adapters/
│   │   │   ├── file-adapter.ts        # Reads from /api/data/:sourceId/:datasetKey
│   │   │   └── api-adapter.ts         # Placeholder for Phase 2 — same interface
│   │   ├── hooks/
│   │   │   └── useDataSource.ts       # Main hook: useDataSource(sourceId, datasetKey, options)
│   │   ├── contracts/                 # TypeScript interfaces for each data domain
│   │   │   ├── incidents.ts
│   │   │   ├── service-requests.ts
│   │   │   ├── sla.ts
│   │   │   ├── problems.ts
│   │   │   ├── changes.ts
│   │   │   ├── risk.ts
│   │   │   ├── observability.ts
│   │   │   ├── applications.ts
│   │   │   ├── m365.ts
│   │   │   ├── entra.ts
│   │   │   ├── assets.ts
│   │   │   ├── finops.ts
│   │   │   └── command-center.ts      # Aggregated executive summary contract
│   │   └── seed/                      # Seed JSON files matching prototype data
│   │       ├── incidents.json
│   │       ├── service-requests.json
│   │       ├── sla.json
│   │       ├── observability.json
│   │       ├── ... (one per dashboard)
│   │       └── command-center.json
│   │
│   ├── admin/                         # Admin portal (separate route: /admin)
│   │   ├── AdminLayout.tsx
│   │   ├── UploadPage.tsx             # Drag-drop file upload per data source
│   │   ├── DataPreview.tsx            # Table preview of parsed data before publishing
│   │   ├── SourceConfig.tsx           # Per-source config (mode: file/api, schema, refresh)
│   │   ├── UploadHistory.tsx          # Audit trail
│   │   └── DataHealth.tsx             # Freshness indicators per dashboard
│   │
│   └── utils/
│       ├── format.ts                  # Number formatting, date formatting
│       ├── colors.ts                  # Status color helpers (statusColor, statusBg, etc.)
│       └── schema-validator.ts        # File upload schema validation
│
├── server/                            # Express backend
│   ├── index.ts                       # Server entry point
│   ├── routes/
│   │   ├── data.ts                    # GET /api/data/:sourceId/:datasetKey
│   │   ├── upload.ts                  # POST /api/admin/upload
│   │   ├── sources.ts                 # GET/PUT /api/admin/sources (config)
│   │   └── auth.ts                    # POST /api/admin/login, session management
│   ├── services/
│   │   ├── file-store.ts              # Read/write JSON data files
│   │   ├── parser.ts                  # CSV/XLSX/JSON parsing + validation
│   │   └── schema-registry.ts         # Expected schemas per data source
│   └── db/
│       ├── init.ts                    # SQLite setup (upload_history, sources, users)
│       └── migrations/
│
├── data/                              # Runtime data store (gitignored in production)
│   ├── uploads/                       # Raw uploaded files
│   └── processed/                     # Normalized JSON ready for serving
│
└── public/
    └── favicon.svg
```

---

## CSS Theme System

The prototype defines ~80 CSS custom properties in `:root`. Extract ALL of them into `src/theme/variables.css`. These are the source of truth for every visual decision. Key groups:

```css
/* Carry these over EXACTLY from the prototype :root */

/* 1. Brand Colors */
--brand-primary: #051b44;        /* Deep navy */
--brand-accent: #8b1837;         /* Crimson red */
--brand-gold: #a29576;           /* Warm gold */
--brand-gold-light: #b8a98a;
--brand-bg-deep: #030F1F;

/* 2. Background Colors — all surfaces */
--bg-main: #030F1F;
--bg-sidebar: rgba(3, 9, 20, 0.98);
--bg-topbar: rgba(3, 9, 20, 0.97);
--bg-card: linear-gradient(165deg, rgba(0,103,193,0.10) 0%, rgba(0,103,193,0.02) 50%, rgba(0,103,193,0.18) 100%);
--bg-card-hover: linear-gradient(164.95deg, rgba(0,103,193,0.10) 0%, rgba(0,103,193,0.78) 100%);
--bg-card-selected: linear-gradient(165deg, rgba(0,103,193,0.15) 0%, rgba(5,27,68,0.85) 50%, rgba(0,103,193,0.22) 100%);

/* 3. Status Colors */
--color-red: #FF5A65;
--color-orange: #c97b30;
--color-green: #14CA74;
--color-green-teal: #1a9e8a;
--color-blue: #4a80d0;

/* 6. Typography */
--font-brand: 'Cairo', 'Inter', sans-serif;
--font-display: 'Rajdhani', sans-serif;
--fs-kpi: 50px;

/* 8. Border Radius */
--radius-2xl: 32px;   /* Main cards — very round */

/* SEE PROTOTYPE :root (lines 35–228) FOR COMPLETE LIST */
```

**Do not invent new colors or change existing values.** The NPC approved this palette. Use it exactly.

---

## The DataProvider Pattern — Critical Architecture

This is the most important abstraction in the system.

### Interface

```typescript
// src/data/hooks/useDataSource.ts

interface DataSourceOptions {
  refreshInterval?: number;    // ms — auto-refetch interval
  enabled?: boolean;           // conditional fetching
  transform?: (raw: any) => any; // optional client-side transform
}

interface DataSourceResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  lastRefresh: Date | null;
  source: 'file' | 'api' | 'stream';  // tells UI where data came from
  staleMinutes: number;                // minutes since last refresh
}

function useDataSource<T>(
  sourceId: string,      // e.g., 'itsm', 'azure-monitor', 'entra'
  datasetKey: string,    // e.g., 'incidents', 'alarms', 'users'
  options?: DataSourceOptions
): DataSourceResult<T>
```

### Phase 1 Implementation

In Phase 1, `useDataSource` uses React Query to call:
```
GET /api/data/{sourceId}/{datasetKey}
```

The Express backend reads from `data/processed/{sourceId}/{datasetKey}.json` and returns it. That JSON file was placed there by the admin upload pipeline.

### Seed Data

For development and initial deployment, generate seed JSON files in `src/data/seed/` that contain the exact data visible in the HTML prototype. Every number, every table row, every chart data point. This ensures the React app looks identical to the prototype from day one.

Example seed file structure:

```json
// src/data/seed/incidents.json
{
  "metadata": {
    "source": "Ru'ya – ITSM Incident Mgmt. Module",
    "dateRange": { "from": "2026-02-01", "to": "2026-02-21" },
    "lastRefresh": "2026-02-21T14:30:00Z"
  },
  "kpis": {
    "openP1": { "value": 12, "trend": { "direction": "up", "delta": 3, "label": "vs Last Week" }},
    "openP2": { "value": 34, "trend": { "direction": "down", "delta": -5, "label": "vs Last Week" }},
    "resolvedToday": { "value": 28, "trend": { "direction": "up", "delta": 12, "label": "vs Yesterday" }},
    "totalOpen": { "value": 87, "trend": { "direction": "down", "delta": -8, "label": "vs Last Week" }},
    "csat": { "value": 4.3, "max": 5.0, "trend": { "direction": "up", "delta": 0.2, "label": "vs Last Month" }},
    "fcr": { "value": 72, "unit": "%", "trend": { "direction": "up", "delta": 5, "label": "vs Last Month" }},
    "mttr": { "value": 4.2, "unit": "hrs", "trend": { "direction": "down", "delta": -0.3, "label": "vs Last Month" }},
    "avgHandling": { "value": 38, "unit": "min", "trend": { "direction": "down", "delta": -4, "label": "vs Last Month" }}
  },
  "responseSLA": [
    { "priority": "P1", "label": "CRITICAL", "target": "15 min", "met": 47, "total": 60, "percentage": 78, "color": "red" },
    { "priority": "P2", "label": "HIGH", "target": "30 min", "met": 119, "total": 140, "percentage": 85, "color": "orange" },
    { "priority": "P3", "label": "MEDIUM", "target": "2 hrs", "met": 187, "total": 200, "percentage": 94, "color": "blue" },
    { "priority": "P4", "label": "LOW", "target": "4 hrs", "met": 140, "total": 145, "percentage": 97, "color": "green" }
  ],
  "resolutionSLA": [
    { "priority": "P1", "label": "CRITICAL", "target": "4 hrs", "met": 42, "total": 60, "percentage": 70, "color": "red" },
    { "priority": "P2", "label": "HIGH", "target": "8 hrs", "met": 112, "total": 140, "percentage": 80, "color": "orange" },
    { "priority": "P3", "label": "MEDIUM", "target": "24 hrs", "met": 180, "total": 200, "percentage": 90, "color": "blue" },
    { "priority": "P4", "label": "LOW", "target": "72 hrs", "met": 138, "total": 145, "percentage": 95, "color": "green" }
  ],
  "incidentsByCategory": [ /* donut chart data */ ],
  "agingAnalysis": [ /* table rows */ ],
  "assignmentGroupPerformance": [ /* table rows */ ],
  "weeklyTrend": [ /* line chart data points */ ],
  "heatmap": [ /* severity heatmap grid */ ]
}
```

**Create equivalent seed files for ALL 17 dashboards + the command center.** Every data point visible in the prototype must be present. Do not skip any dashboard.

---

## Page-by-Page Implementation Notes

### Command Center (NEW — replaces landing grid)
- Reference: `reference/ExecutiveCommandCenter.jsx`
- This is the default route (`/`)
- Shows 4 domain health cards, action queue, trends panel
- Each action item links to the relevant dashboard page
- Domain cards are clickable and can expand to show actions
- Data contract: aggregated from all other data sources
- The old LandingGrid with icon cards should still be accessible (via a "View All Dashboards" link or similar) but is no longer the primary landing

### Navigation Flow
```
/ → CommandCenter (executive view)
  ├── "View All Dashboards" → LandingGrid (original icon grid)
  ├── Action item click → /dashboard/:pageId
  └── Domain card click → expands detail or navigates
/dashboard/:pageId → Inner layout (sidebar + topbar + page content)
  ├── sidebar nav switches between pages
  └── back button returns to /
/admin → Admin layout (separate)
  ├── /admin/upload
  ├── /admin/sources
  ├── /admin/history
  └── /admin/health
```

### ITSM Pages (6 dashboards)

**Incident Management** (`page-incident`, prototype lines 1547–1963)
- 2 rows of 4 KPI cards (Open P1, P2, Resolved Today, Total Open + CSAT, FCR, MTTR, Avg Handling)
- CSAT card has star rating visual + progress bar
- FCR, MTTR, Avg Handling each have progress bar with gradient fills
- Response SLA by Priority (4 priority bars with met/breached counts)
- Resolution SLA by Priority (4 priority bars)
- Incidents by Category (donut chart + legend)
- Weekly Incident Trend (line chart)
- Aging Analysis (stacked bar or progress bars by priority)
- Assignment Group Performance (table)
- Incident heatmap (time-series severity grid)

**Service Requests** (`page-sr`, lines 1965–2269)
- Similar pattern: KPIs, fulfillment rate bars, category breakdown, aging, backlog trend

**SLA Management** (`page-sla`, lines 2271–2475)
- Combined SLA view across incident types

**Problem Management** (`page-problem`, lines 2734–3072)
- Known errors, root cause categories, recurrence analysis

**Change Management** (`page-change`, lines 3074–3375)
- Change success rate, emergency %, CAB approval, KPI scorecard table

**Risk Dashboard** (`page-risk`, lines 6142–6517)
- Risk register table, severity matrix, mitigation tracking

### ITAM Pages (5 dashboards)

**M365 Licenses** (`page-m365`, lines 3778–3811)
- 4 KPIs (total, assigned, available, expiring)
- License Distribution by SKU (progress bars)
- Usage by Department (progress bars)

**Entra ID** (`page-entra`, lines 5629–6140)
- 5 sub-tabs: User Details, Group Details, App Registrations, Devices, Privileged Access
- Each tab has its own KPI grid and data table
- Tab switching is internal state, not routing
- Entra-specific badge styles and KPI card styles

**Asset Management** (`page-asset`, lines 3377–3776)
- Large table with service scope, managed Windows, cloud services, server fleet sections

**Asset Lifecycle** (`page-lifecycle`, lines 5180–5627)
- Warranty compliance, end-of-life tracking, replacement planning

**Service Scope** (`page-servicescope`, lines 6519–6574)
- Service catalog scope boundaries

### ITOM Pages (3 dashboards)

**Observability** (`page-observability`, lines 2477–2732)
- 5 device status cards with SVG gauges (URL, Network, Storage, Servers + Total Devices)
- Alarm Monitoring Summary (5 KPI cards: critical, major, minor, warning, total)
- Alarm detail table with severity badges, timestamps, device names
- **The gauges use raw SVG semicircles with stroke-dasharray** — recreate these as a GaugeChart component

**Business Applications** (`page-bizapps`, lines 6576–6613)
- 5 KPIs (Operational, Down, Degraded, Maintenance, Total)
- Application status table (name, category, status badge, availability %, response time)

**Technical Applications** (`page-techapps`, lines 6617–6653)
- Same pattern as BizApps but with CPU%, Memory%, Host columns

### Optimization Pages (3 dashboards)

**FinOps** (`page-finops`, lines 4113–4755)
- Most complex page. Sections: Executive Overview, Monthly Trend, Cost by Subscription, by Resource Group, by Service, Top 10 Resources, Savings & Recommendations
- Bar charts, tables, progress bars — all with Azure cost data
- Source chip shows "Azure" with cloud icon

**FinOps Maturity** (`page-finops-maturity`, lines 4757–5178)
- Maturity scores across 6 capability domains
- Radar/spider chart concept
- Recommendations table

**CCOE** (`page-ado`, lines 3814–4111)
- Source: Azure DevOps
- Work items, backlog, sprint progress, velocity metrics

---

## Shared Component Specifications

### KPICard
```typescript
interface KPICardProps {
  label: string;
  value: string | number;
  icon?: string;              // Font Awesome class, e.g., "fa-solid fa-circle-xmark"
  trend?: {
    direction: 'up' | 'down' | 'flat';
    delta: string | number;
    label: string;            // "vs Last Week"
    isGood: boolean;          // determines green vs red coloring
  };
  colorVariant?: 'teal' | 'red' | 'orange' | 'blue' | 'gold' | 'green' | 'purple';
  progressBar?: {
    value: number;            // 0-100
    gradient: string;         // CSS gradient string
  };
  subtitle?: string;          // e.g., "Customer Satisfaction Score | Monthly"
  unit?: string;              // e.g., "%", "hrs", "min", "/5.0"
  size?: 'default' | 'compact';
}
```

### GaugeChart (Semi-circular SVG)
```typescript
interface GaugeChartProps {
  value: number;
  max: number;
  available: number;
  unavailable: number;
  label: string;              // e.g., "Network Devices"
  icon?: string;
  width?: number;             // default 90
  height?: number;            // default 55
}
```
The prototype draws these as SVG paths with `stroke-dasharray`. The arc formula:
- Background arc: full semicircle
- Value arc: `stroke-dasharray="${(value/max) * totalArcLength} ${totalArcLength}"`
- Red segment (if unavailable > 0): offset by value arc length

### HeatmapTable
```typescript
interface HeatmapData {
  date: string;
  hours: Record<string, number>;  // "00"–"23" → severity level 0-5
}
```
Uses the 6-level color scale from prototype:
- h-0: `rgba(5,27,68,0.15)` (empty)
- h-1: `rgba(20,80,180,0.35)` (low)
- h-2: `rgba(201,123,48,0.45)` (moderate)
- h-3: `rgba(201,123,48,0.75)` (elevated)
- h-4: `rgba(139,24,55,0.75)` (high)
- h-5: `rgba(184,34,63,0.95)` (critical)

### DataTable
```typescript
interface DataTableProps<T> {
  columns: {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, row: T) => ReactNode;  // custom cell renderer
    className?: string;        // e.g., 'name-col', 'meta-col', 'c-teal'
  }[];
  data: T[];
  sortable?: boolean;
}
```

---

## Admin Backend Specifications

### File Upload Flow
1. Admin selects data source from dropdown (e.g., "ITSM Incidents")
2. Drags CSV/JSON/XLSX file onto upload zone
3. Backend parses file using PapaParse or SheetJS
4. Validates against schema registered for that source
5. Shows preview table with row count, sample data, validation errors
6. Admin clicks "Publish" — file is transformed to canonical JSON and written to `data/processed/`
7. Dashboard automatically picks up new data on next React Query refetch

### Express API Routes

```
GET  /api/data/:sourceId/:datasetKey     → returns processed JSON for dashboard consumption
POST /api/admin/upload                    → multipart file upload + validation
GET  /api/admin/sources                   → list all data sources with config and health
PUT  /api/admin/sources/:sourceId         → update source config (mode, schema, refresh)
GET  /api/admin/history                   → upload audit trail
POST /api/admin/login                     → session-based auth
GET  /api/admin/health                    → data freshness per source
```

### Schema Registry
Each data source has a registered schema:
```typescript
interface SourceSchema {
  sourceId: string;
  name: string;
  description: string;
  mode: 'file' | 'api' | 'stream';
  acceptedFormats: ('csv' | 'json' | 'xlsx')[];
  requiredFields: { name: string; type: 'string' | 'number' | 'date' | 'boolean' }[];
  optionalFields: { name: string; type: string }[];
  refreshCadence: string;     // "daily", "weekly", "monthly", "realtime"
  lastRefresh?: string;       // ISO datetime
  rowCount?: number;
}
```

---

## Execution Sequence

Work in this order. Each step should be fully functional before moving to the next.

### Step 1: Project Setup + Theme + Shell
- Initialize Vite + React + TypeScript project
- Extract complete CSS theme from prototype :root into `variables.css`
- Build AppShell, Sidebar, Topbar components
- Implement React Router with lazy-loaded routes
- Result: navigable shell that matches prototype layout

### Step 2: Shared Component Library
- Build KPICard, ChartCard, DataTable, Badge, ProgressBar, SectionLabel
- Build chart components: GaugeChart, DonutChart, HeatmapTable, SLAProgressBar
- Build Recharts wrappers: BarChart, LineChart with NPC theme colors
- Build UI components: FilterBar, LiveDot, DateChip, BackButton
- Test each component in isolation with hardcoded props

### Step 3: DataProvider + Seed Data
- Implement useDataSource hook with React Query
- Build FileAdapter that fetches from `/api/data/:sourceId/:datasetKey`
- Create ALL seed JSON files (17 dashboards + command center)
- Set up Express backend with data-serving routes
- Result: `useDataSource('itsm', 'incidents')` returns seed data

### Step 4: Executive Command Center
- Implement CommandCenter page as the default route
- Wire up to `useDataSource('command-center', 'summary')`
- Domain health cards, action queue, trends panel
- Action items link to dashboard routes
- "View All Dashboards" navigates to LandingGrid

### Step 5: ITSM Dashboards (6 pages)
- Incident, SR, SLA, Problem, Change, Risk
- Each page wired to useDataSource with its seed data
- Pixel-match to prototype

### Step 6: ITAM + ITOM Dashboards (8 pages)
- M365, Entra (with 5 sub-tabs), Asset, Lifecycle, ServiceScope
- Observability, BizApps, TechApps

### Step 7: Optimization Dashboards (3 pages)
- FinOps (most complex — multiple sections), FinOps Maturity, CCOE

### Step 8: Admin Portal
- AdminLayout with sidebar nav
- Upload page with drag-drop and file parsing
- Data preview table
- Source configuration panel
- Upload history with audit trail
- Data health dashboard showing freshness per source

### Step 9: Polish + Production Readiness
- Responsive breakpoints (the prototype has a media query at ~768px)
- Error boundaries per page
- Loading states and skeleton screens
- 404 page
- Docker configuration
- Environment variable management

---

## Quality Standards

- **Visual fidelity**: The React app must be visually indistinguishable from the HTML prototype. Open both side-by-side and they should look the same.
- **Type safety**: Every data contract has a TypeScript interface. No `any` types in component props.
- **Component isolation**: Every shared component works with props alone — no direct data fetching inside components.
- **Accessibility**: Semantic HTML, ARIA labels on interactive elements, keyboard navigable sidebar.
- **Performance**: Lazy-load all page components. Only the active page's data is fetched.
- **Code organization**: One component per file. Co-located tests. No file exceeds 300 lines — split into sub-components if needed.

---

## Do Not

- Do not use Tailwind CSS — the prototype uses CSS custom properties and that system carries over.
- Do not invent new colors, gradients, or spacing values — use the prototype's `:root` variables.
- Do not use a different icon library — Font Awesome 6 Free matches the prototype.
- Do not add features not in the prototype or command center concept — scope discipline.
- Do not put data-fetching logic inside presentational components.
- Do not hardcode data values in page components — always use useDataSource.
- Do not skip any of the 17 dashboard pages — all must be implemented.
