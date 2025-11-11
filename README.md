# 🎯 AI Twin Analytics Dashboard

A full-stack analytics dashboard for tracking AI Twin usage, engagement metrics, and user activities through Slack conversations.

## Project Structure

```
twin1/
├── backend/                    # FastAPI backend (Python)
│   ├── app/
│   │   ├── core/              # Config & database
│   │   │   ├── config.py      # Environment & settings
│   │   │   └── database.py    # SQLAlchemy session management
│   │   ├── models/            # SQLAlchemy ORM models
│   │   │   └── models.py      # User, Twin, Session, Message, Document, Query
│   │   ├── api/v1/            # API endpoints (versioned)
│   │   │   ├── metrics.py     # Dashboard metrics
│   │   │   ├── charts.py      # Chart data (activity, conversation, engagement)
│   │   │   ├── retention.py   # User retention metrics
│   │   │   └── activities.py  # Activity listing & details
│   │   ├── schemas/           # Pydantic response models
│   │   │   └── responses.py   # All API response schemas
│   │   └── utils/             # Helper functions
│   │       └── helpers.py     # Time formatting utilities
│   ├── scripts/               # Utility scripts
│   │   └── generate_data.py   # Sample data generator
│   ├── pyproject.toml         # Dependencies (uv)
│   ├── start.sh               # Quick start script
│   └── README.md              # Backend documentation
│
└── frontend/                   # React + TypeScript (Vite)
    ├── src/
    │   ├── components/        # Reusable UI components
    │   │   ├── MetricsOverview.tsx
    │   │   ├── ActivityCharts.tsx
    │   │   ├── FeatureUsage.tsx
    │   │   ├── OrganizationLeaderboard.tsx
    │   │   ├── RecentActivity.tsx
    │   │   ├── Navbar.tsx
    │   │   └── ui/            # shadcn/ui components
    │   ├── pages/             # Page components
    │   │   ├── Activities.tsx
    │   │   └── ActivityDetailPage.tsx
    │   ├── utils/             # API client
    │   │   └── api.ts         # Axios client with typed endpoints
    │   └── App.tsx            # Main application & routing
    ├── package.json           # Dependencies (npm)
    ├── vite.config.ts         # Vite configuration
    └── README.md              # Frontend documentation
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (backend)
- **uv** package manager (backend)
- **Node.js 18+** (frontend)
- **npm** (frontend)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies with uv:
```bash
uv sync
```

3. Generate sample data (creates SQLite database with 60 days of data):
```bash
uv run python scripts/generate_data.py
```

4. Start the FastAPI server:
```bash
./start.sh
# Or manually:
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`  
API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 🏗️ Architecture

### Backend (Python/FastAPI)

**Conversation-Centric Data Model:**
- 🎯 **Sessions**: Slack conversation threads with AI Twins
- 💬 **Messages**: User and AI Twin messages within sessions
- 📄 **Documents**: Metadatas related to documents generated during conversations (linked to messages)
- 🔍 **Queries**: Metadatas related to information retrieved during conversations (linked to messages)
- 👥 **Users & Twins**: User accounts and their AI Twin instances

**API Architecture:**
- ✅ **Core Layer**: Configuration (`config.py`) and database management (`database.py`)
- ✅ **Models Layer**: SQLAlchemy ORM models - 6 main tables (User, Twin, Session, Message, Document, Query)
- ✅ **API Layer**: RESTful endpoints with versioning (`/api/` prefix for v1)
- ✅ **Schemas Layer**: Pydantic models for request/response validation
- ✅ **Utils Layer**: Helper functions for time formatting and data processing


### Frontend (React/TypeScript)

**Component-Based Architecture:**
- ✅ **Pages**: Dashboard (main), Activities (list view), Activity Detail (drill-down)
- ✅ **Components**: 
  - MetricsOverview: 4 key metrics with change indicators
  - ActivityCharts: Daily active users & conversation trends
  - FeatureUsage: Feature engagement over time
  - OrganizationLeaderboard: Top companies by activity
  - RecentActivity: Latest 8 activities
- ✅ **UI Library**: shadcn/ui components built on Radix UI
- ✅ **Charts**: Recharts for all data visualizations

**Key Frontend Features:**
- Real-time metrics with period-over-period comparison
- Synchronized chart zooming across all views (Brushing and Linking)
- Date range filtering with picker component
- Activity filtering by type, user, and date
- Paginated activity list with detailed drill-down
- Responsive design 

## 📊 Features

### Dashboard View
- **Metrics Overview**: 4-card layout showing:
  - Active users (with % change vs previous period)
  - Total conversations (with % change)
  - Documents drafted (with % change)
  - Twin installations (with % change)
- **Organization Leaderboard**: Top 5 companies by activity
- **Activity Charts**: 
  - Daily active users with rolling average
  - Conversation and message trends over time
- **Feature Usage**: Daily breakdown of:
  - Questions asked (conversation starts)
  - Information retrieved (queries executed)
  - Documents drafted
- **Recent Activities**: Last 8 activities with quick view

### Activities Page
- **Comprehensive Activity List**: Paginated view with filtering
- **Filters**:
  - Type: All, Conversation, Document, Query, Shared Twin
  - User: Search by email
  - Date range: Custom start and end dates
- **Activity Cards**: Show:
  - User name and email
  - Activity type and action description
  - Time ago and platform
  - Message count, document count, query count
  - Shared twin indicator with owner info
- **Pagination**: Full pagination controls with page counts

### Activity Detail View
- **Full Conversation History**:
  - All messages between user and AI Twin
  - Timestamp for each message
  - Sender type (user/twin)
- **Action Indicators**:
  - Document creation events with title, type, word count
  - Query execution events with query text and results count
- **Session Metadata**:
  - Platform (Slack), device type
  - Shared twin usage indicator
  - Summary counts (documents, queries, messages)

### Data Model & Behavior
**Session-Centric Design:**
1. **Sessions** = Slack conversation threads with AI Twins
2. **Messages** = Individual exchanges within a session (user/twin) (one session can have multiple messages)
3. **Documents & Queries** = Created during sessions, linked to triggering messages
4. **Shared Twins** = Users can interact with other users' AI Twins (tracked via `is_shared_twin` flag)

**Activity Types:**
- **Conversation**: Every session is a conversation (base type)
- **Document**: Sessions where documents were created
- **Query**: Sessions where information retrieval occurred
- **Shared Twin**: Sessions where user accessed someone else's Twin

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0+
- **Validation**: Pydantic 2.4+
- **Database**: SQLite (dev) → PostgreSQL (prod ready)
- **Package Manager**: uv (Python)
- **Python**: 3.11+
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript
- **Build Tool**: Vite 6.3
- **HTTP Client**: Axios 1.13
- **Charts**: Recharts 2.15
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📈 API Endpoints

### Health & Info
- `GET /` - Health check
- `GET /health` - Detailed health check

### Metrics (`/api/`)
- `GET /metrics?start_date=&end_date=` - Dashboard overview with period-over-period changes

### Charts (`/api/charts/`)
- `GET /activity?start_date=&end_date=` - Daily active users with average
- `GET /conversation?start_date=&end_date=` - Conversation and message trends
- `GET /engagement?start_date=&end_date=` - Feature engagement (questions, queries, documents)
- `GET /features/usage?start_date=&end_date=` - Feature distribution for pie chart
- `GET /hourly-activity?start_date=&end_date=` - Average activity by hour of day
- `GET /organizations/leaderboard?start_date=&end_date=&limit=` - Top organizations by activity

### Retention (`/api/`)
- `GET /retention?start_date=&end_date=` - Day 1/7/30 retention, sessions per user, power users %

### Activities (`/api/activities`)
- `GET /` - List activities with filters
  - Query params: `page`, `limit`, `type`, `user`, `start_date`, `end_date`
  - Returns: `{items, total, page, limit, total_pages, has_next, has_prev}`
- `GET /{activity_id}` - Get detailed activity with full conversation history

**Interactive API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`


## 📚 Documentation

- [Backend README](./backend/README.md) - Detailed backend architecture and development guide
- [Frontend README](./frontend/README.md) - Frontend development guide (if exists)
- [Database Schema](./frontend/src/docs/database-schema.md) - Complete database schema documentation

