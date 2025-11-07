# 🎯 AI Twin Analytics Dashboard

A full-stack analytics dashboard for tracking AI Twin usage, engagement metrics, and user activities.

## 📁 Project Structure

```
twin1/
├── backend/                    # FastAPI backend (Python)
│   ├── app/
│   │   ├── core/              # Config & database
│   │   ├── models/            # SQLAlchemy models
│   │   ├── api/v1/            # API endpoints
│   │   ├── schemas/           # Pydantic schemas
│   │   └── utils/             # Helper functions
│   ├── scripts/               # Utility scripts
│   ├── pyproject.toml         # Dependencies (uv)
│   └── README.md              # Backend documentation
│
└── frontend/                   # React frontend (TypeScript)
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Page components
    │   ├── utils/             # API client
    │   └── App.tsx            # Main application
    ├── package.json           # Dependencies (npm)
    └── README.md              # Frontend documentation
```

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
uv sync
```

3. Generate sample data:
```bash
uv run python scripts/generate_data.py
```

4. Start the server:
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

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

Frontend will be available at `http://localhost:3000`

## 🏗️ Architecture

### Backend (Python/FastAPI)

**Scalable Modular Structure:**
- ✅ **Core Layer**: Configuration and database management
- ✅ **Models Layer**: SQLAlchemy ORM models (13 tables)
- ✅ **API Layer**: RESTful endpoints with versioning (v1)
- ✅ **Schemas Layer**: Pydantic models for validation
- ✅ **Utils Layer**: Reusable helper functions

**Key Features:**
- Modular architecture for easy scaling
- API versioning support (v1)
- Comprehensive data models
- SQLite database (easily switchable to PostgreSQL)
- CORS enabled for frontend communication

### Frontend (React/TypeScript)

**Component-Based Architecture:**
- ✅ **Pages**: Dashboard, Activities, Activity Detail
- ✅ **Components**: MetricsOverview, Charts, UserRetention
- ✅ **Utils**: API client with typed endpoints
- ✅ **UI Library**: shadcn/ui components

**Key Features:**
- Real-time metrics visualization
- Interactive charts (Recharts)
- Activity filtering and pagination
- Detailed activity views
- Responsive design

## 📊 Features

### Dashboard View
- **Metrics Overview**: Active users, conversations, documents, installations
- **Activity Charts**: Daily active users over time
- **Conversation Trends**: Messages and conversation counts
- **Feature Engagement**: Usage patterns across features
- **User Retention**: Day 1, 7, 30 retention rates
- **Recent Activities**: Latest user interactions

### Activities Page
- **Activity List**: Paginated view of all activities
- **Filters**: By type (conversation, document, query, shared)
- **Search**: Filter by user email
- **Activity Details**: Full view with messages, documents, queries

### Activity Types
1. **Conversations**: Multi-turn dialogues with AI Twin
2. **Documents**: Generated documents (drafts, reports, emails)
3. **Queries**: Information retrieval from emails/documents
4. **Shared Interactions**: Using other users' Twin instances

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite (dev), PostgreSQL (prod ready)
- **Package Manager**: uv
- **Python**: 3.11+

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 4.5
- **HTTP Client**: Axios
- **Charts**: Recharts
- **UI Components**: shadcn/ui + Tailwind CSS

## 📈 API Endpoints

### Metrics
- `GET /api/metrics` - Dashboard overview

### Charts
- `GET /api/charts/activity` - Daily active users
- `GET /api/charts/conversation` - Conversation trends
- `GET /api/charts/engagement` - Feature engagement
- `GET /api/charts/features/usage` - Feature distribution

### Retention
- `GET /api/retention` - Retention metrics

### Activities
- `GET /api/activities` - List activities (with filtering)
- `GET /api/activities/{id}` - Activity details

## 🔧 Development

### Backend Development

```bash
cd backend

# Install dependencies
uv sync

# Run development server with auto-reload
uv run uvicorn app.main:app --reload

# Generate new sample data
uv run python scripts/generate_data.py

# Access API docs
open http://localhost:8000/docs
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Environment Variables

### Backend (.env)
```env
DEBUG=false
DATABASE_URL=sqlite:///./ai_twin_analytics.db
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
HOST=0.0.0.0
PORT=8000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Backend Deployment

**Option 1: Docker**
```bash
cd backend
docker build -t twin-analytics-api .
docker run -p 8000:8000 twin-analytics-api
```

**Option 2: Traditional Hosting**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment

**Build static files:**
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel, Netlify, or any static host
```

## 📚 Documentation

- [Backend README](./backend/README.md) - Detailed backend documentation
- [Frontend README](./frontend/README.md) - Frontend development guide
- [API Documentation](http://localhost:8000/docs) - Interactive API docs (Swagger)

## 🎯 Project Highlights

### Backend Best Practices ✨
- **Modular Architecture**: Separated into core, models, API, schemas, and utils
- **API Versioning**: Ready for v2, v3 expansion
- **Type Safety**: Pydantic schemas for request/response validation
- **Scalability**: Easy to add new endpoints and models
- **Clean Code**: Single responsibility principle throughout

### Frontend Best Practices ✨
- **Component Reusability**: Modular, reusable components
- **Type Safety**: Full TypeScript implementation
- **State Management**: React hooks for local state
- **API Integration**: Centralized API client
- **Responsive Design**: Mobile-friendly UI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 👥 Authors

Your Team

---

**Built with ❤️ using FastAPI, React, and TypeScript**
