# AI Twin Analytics Dashboard - Backend

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization, CORS, health checks
│   │
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py          # Settings (environment variables, CORS, DB URL)
│   │   └── database.py        # SQLAlchemy engine, session management
│   │
│   ├── models/                 # Database models (SQLAlchemy ORM)
│   │   ├── __init__.py
│   │   └── models.py          # 6 models: User, Twin, Session, Message, Document, Query
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependencies (get_db session)
│   │   └── v1/                # API v1 endpoints
│   │       ├── __init__.py    # Router aggregation
│   │       ├── metrics.py     # Dashboard metrics (active users, conversations, etc.)
│   │       ├── charts.py      # Chart data (activity, conversation, engagement, hourly, orgs)
│   │       ├── retention.py   # User retention (day 1/7/30, power users)
│   │       └── activities.py  # Activity list and detail views
│   │
│   ├── schemas/                # Pydantic models for request/response
│   │   ├── __init__.py
│   │   └── responses.py       # All response schemas (metrics, charts, activities)
│   │
│   ├── services/               # Business logic layer (future expansion)
│   │   └── __init__.py
│   │
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       └── helpers.py         # Time formatting (time_ago, duration)
│
├── scripts/                    # Utility scripts
│   ├── __init__.py
│   ├── generate_data.py       # Generate 60 days of realistic sample data
│   └── add_message_type.py    # Migration script (adds message_type field)
│
├── .env                        # Environment variables (gitignored)
├── pyproject.toml             # Project dependencies (uv format)
├── start.sh                   # Quick start script
├── ai_twin_analytics.db       # SQLite database (generated)
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- uv package manager ([install here](https://github.com/astral-sh/uv))

### Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies with uv:
```bash
uv sync
```

3. Generate sample data (creates database with 60 days of realistic data):
```bash
uv run python scripts/generate_data.py
```
This creates:
- 12 users across 4 companies
- 8-10 twins (some shared, some private (?))
- Sessions (Slack conversations) for last 60 days
- Messages within each session (multi-turn conversations)
- Documents and queries created during conversations

4. Start the development server:
```bash
./start.sh
# Or manually:
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000`
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🏗️ Data Model

### Session-Centric Architecture

The backend uses a **conversation-centric** approach where everything revolves around Slack sessions:

```
User ──makes──> Twin
 │              │
 └─creates─> Session (Slack conversation thread)
              │
              ├──has many──> Message (user/twin exchanges)
              │               │
              ├──creates──────┴──> Document (during conversation)
              │
              └──executes────────> Query (during conversation)
```

### Database Models (6 tables)

1. **User**: User accounts
   - `id`, `email`, `full_name`, `company`, `department`
   - `created_at`, `last_login_at`

2. **Twin**: AI Twin instances owned by users
   - `id`, `user_id`, `name`, `description`
   - `is_shared` (allows other users to access)
   - `created_at`

3. **Session**: Slack conversation threads
   - `id`, `user_id`, `twin_id`
   - `title`, `topic`, `platform` (always 'slack')
   - `is_shared_twin` (using someone else's twin)
   - `started_at`

4. **Message**: Individual messages in a session
   - `id`, `session_id`
   - `sender_type` ('user' or 'twin')
   - `content`, `message_type` ('general', 'document', 'query')
   - `created_at`

5. **Document**: Metadatas on documents drafted during conversations
   - `id`, `session_id`, `message_id` (triggering message)
   - `document_type`, `title`,`word_count`
   - `created_at`

6. **Query**: Metadatas on information retrieval queries
   - `id`, `session_id`, `message_id` (triggering message)
   - `query_text`, `query_type`, `results_count`
   - `created_at`

## 📚 API Documentation

### Automatic Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs` - Interactive API testing
- **ReDoc**: `http://localhost:8000/redoc` - Clean, readable documentation

### API Endpoints

All endpoints are under `/api/` prefix for v1.

#### Health Checks
- `GET /` - Basic health check
  ```json
  {"status": "healthy", "message": "AI Twin Analytics API", "version": "1.0.0"}
  ```

- `GET /health` - Detailed health check
  ```json
  {"status": "healthy", "app": "AI Twin Analytics API", "version": "1.0.0", "database": "connected"}
  ```

#### Metrics
- `GET /api/metrics?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - Returns dashboard overview metrics with period-over-period comparisons
  - Includes: active users, conversations, documents, installations
  - Each metric includes % change vs previous period

#### Charts
- `GET /api/charts/activity?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - Daily active users with rolling average
  
- `GET /api/charts/conversation?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - Daily conversations and messages with averages
  
- `GET /api/charts/engagement?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - Daily feature usage: questions, queries, documents
  
- `GET /api/charts/features/usage?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - Feature distribution for pie chart
  
- `GET /api/charts/hourly-activity?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - Average activity by hour (0-23)
  
- `GET /api/charts/organizations/leaderboard?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=5`
  - Top organizations by activity

#### Retention
- `GET /api/retention?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
  - Day 1/7/30 retention rates
  - Sessions per user
  - Power users percentage (10+ sessions)

#### Activities
- `GET /api/activities?page=1&limit=20&type=all&user=email&start_date=&end_date=`
  - Paginated activity list with filters
  - Types: `all`, `conversation`, `document`, `query`, `shared_twin`
  - Returns: `{items, total, page, limit, total_pages, has_next, has_prev}`
  
- `GET /api/activities/{activity_id}`
  - Detailed activity view with full conversation history
  - Includes all messages, documents, and queries
