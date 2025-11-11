
  # AI Twin Analytics Dashboard - Frontend

A modern, responsive React dashboard for visualizing AI Twin usage analytics. Built with TypeScript, Vite, and Recharts.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm (comes with Node.js)

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                      # Main app component with routing & state
│   ├── main.tsx                     # React entry point
│   ├── index.css                    # Global styles
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── Navbar.tsx              # Top navigation with mobile drawer
│   │   ├── DateRangePicker.tsx     # Date range selector
│   │   ├── MetricsOverview.tsx     # 4-card metrics display
│   │   ├── ActivityCharts.tsx      # Daily activity & conversation charts
│   │   ├── FeatureUsage.tsx        # Feature engagement over time
│   │   ├── OrganizationLeaderboard.tsx  # Top companies by activity
│   │   ├── RecentActivity.tsx      # Latest 8 activities
│   │   └── ui/                     # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── select.tsx
│   │       └── ... (30+ components)
│   │
│   ├── pages/                       # Page-level components
│   │   ├── Activities.tsx          # Activity list with filters & pagination
│   │   └── ActivityDetailPage.tsx  # Full conversation detail view
│   │
│   ├── utils/                       # Utilities
│   │   └── api.ts                  # Axios client with typed API functions
│   │
│   ├── docs/                        # Documentation
│   │   └── database-schema.md      # Database schema reference
│   │
│   └── guidelines/                  # Development guidelines
│       └── Guidelines.md            # (currently empty)
│
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── vite.config.ts                   # Vite configuration
└── README.md                        # This file
```

## 🎨 Features

### Dashboard View (`/`)
- **Metrics Cards**: Active users, conversations, documents, installations with % change
- **Organization Leaderboard**: Top 5 companies ranked by activity
- **Activity Charts**: Daily active users and conversation trends with zoom
- **Feature Usage**: Questions asked, info retrieved, documents drafted
- **Recent Activities**: Last 8 activities with quick view

### Activities Page
- **Comprehensive List**: All activities with pagination
- **Filters**: Type (conversation/document/query/shared), user email, date range
- **Activity Cards**: User, action, time, counts, shared twin indicator
- **Pagination**: Navigate through pages with counts

### Activity Detail Page
- **Full Conversation**: Complete message history (user/twin)
- **Action Indicators**: Document creations and query executions inline
- **Metadata**: Platform, device, shared twin info, summary counts

### UI/UX Features
- **Chart Brushing and Linking**: Interactive brushing and linking synced across charts (this is sort of zooming the chart by dragging over a timerange)

## 🛠️ Tech Stack


- **React 18.3**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite 6.3**: Fast build tool with HMR

### UI Components
- **shadcn/ui**: High-quality components built on Radix UI
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

### Data & Charts
- **Axios 1.13**: HTTP client for API calls
- **Recharts 2.15**: Composable charting library

## 📊 Components Overview

### Layout Components
- `Navbar`: Top navigation with dashboard/activities tabs, mobile drawer
- `DateRangePicker`: Date range selector with preset options

### Dashboard Components
- `MetricsOverview`: 4 metrics in 2x2 grid with icons and % changes
- `ActivityCharts`: Line charts for daily active users & conversations
- `FeatureUsage`: Area/line chart showing feature engagement trends
- `OrganizationLeaderboard`: Table showing top companies with stats
- `RecentActivity`: List of latest 8 activities with "View All" button

### Page Components
- `Activities`: Full activity list with filters, pagination, and activity cards
- `ActivityDetailPage`: Detailed view with conversation history and metadata
  