# AI Twin Analytics Dashboard - Backend

A scalable, modular FastAPI backend for the AI Twin Analytics Dashboard.

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py          # Settings and environment variables
│   │   └── database.py        # Database connection and session management
│   ├── models/                 # Database models (SQLAlchemy)
│   │   ├── __init__.py
│   │   └── models.py          # All database models
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependencies (e.g., get_db)
│   │   └── v1/                # API v1 endpoints
│   │       ├── __init__.py
│   │       ├── metrics.py     # Dashboard metrics
│   │       ├── charts.py      # Chart data endpoints
│   │       ├── retention.py   # User retention metrics
│   │       └── activities.py  # Activity tracking
│   ├── schemas/                # Pydantic schemas for request/response
│   │   ├── __init__.py
│   │   └── responses.py       # Response models
│   ├── services/               # Business logic layer (future)
│   │   └── __init__.py
│   └── utils/                  # Utility functions
│       ├── __init__.py
│       └── helpers.py         # Helper functions (time formatting, etc.)
├── scripts/                    # Utility scripts
│   └── generate_data.py       # Sample data generator
├── .env                        # Environment variables
├── pyproject.toml             # Project dependencies (uv)
└── ai_twin_analytics.db       # SQLite database
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- uv package manager

### Installation

1. Install dependencies:
```bash
cd backend
uv sync
```

2. Generate sample data:
```bash
uv run python scripts/generate_data.py
```

3. Start the development server:
```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Automatic Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### API Endpoints

#### Health Check
- `GET /` - Basic health check
- `GET /health` - Detailed health check

#### Metrics (v1)
- `GET /api/metrics` - Dashboard overview metrics with period-over-period comparisons

#### Charts (v1)
- `GET /api/charts/activity` - Daily active users
- `GET /api/charts/conversation` - Conversations and messages over time
- `GET /api/charts/engagement` - Feature engagement trends
- `GET /api/charts/features/usage` - Feature usage distribution

#### Retention (v1)
- `GET /api/retention` - User retention metrics (day 1/7/30)

#### Activities (v1)
- `GET /api/activities` - List all activities with filtering and pagination
- `GET /api/activities/{id}` - Get detailed activity information

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────┐
│   API Layer (v1)    │  FastAPI routers with endpoint definitions
├─────────────────────┤
│   Schemas Layer     │  Pydantic models for validation
├─────────────────────┤
│   Services Layer    │  Business logic (future expansion)
├─────────────────────┤
│   Models Layer      │  SQLAlchemy ORM models
├─────────────────────┤
│   Core Layer        │  Configuration, database session
└─────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Scalability**: Easy to add new endpoints, models, or services
3. **Maintainability**: Clear structure makes code easy to navigate
4. **Testability**: Loosely coupled components are easy to test
5. **API Versioning**: Support multiple API versions (v1, v2, etc.)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Application
DEBUG=false
APP_NAME=AI Twin Analytics API
APP_VERSION=1.0.0

# Database
DATABASE_URL=sqlite:///./ai_twin_analytics.db

# Server
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Configuration File

Settings are managed in `app/core/config.py`:

```python
from app.core.config import settings

# Access settings
print(settings.DATABASE_URL)
print(settings.API_V1_PREFIX)
```

## 📊 Database

### Models

All database models are in `app/models/models.py`:

- `User` - User accounts
- `Twin` - AI Twin instances
- `Session` - User sessions
- `Activity` - User activities
- `Conversation` - Conversation threads
- `Message` - Individual messages
- `Document` - Generated documents
- `Query` - Information queries
- `SharedTwinInteraction` - Shared twin usage
- `DailyMetric` - Daily aggregated metrics
- `UserRetention` - Retention tracking
- `FeatureUsage` - Feature usage statistics

### Migrations

For production, consider using Alembic for database migrations:

```bash
uv add alembic
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies
uv add --dev pytest pytest-asyncio httpx

# Run tests
uv run pytest
```

### Test Structure

```
tests/
├── test_api/
│   ├── test_metrics.py
│   ├── test_charts.py
│   ├── test_retention.py
│   └── test_activities.py
├── test_services/
└── test_models/
```

## 📈 Adding New Features

### 1. Add a New Endpoint

1. Create a new router file in `app/api/v1/`:

```python
# app/api/v1/new_feature.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db

router = APIRouter()

@router.get("/new-endpoint")
def get_new_data(db: Session = Depends(get_db)):
    return {"message": "New feature"}
```

2. Register it in `app/api/v1/__init__.py`:

```python
from app.api.v1 import new_feature

router.include_router(new_feature.router, tags=["new-feature"])
```

### 2. Add a New Model

1. Add the model to `app/models/models.py`:

```python
class NewModel(Base):
    __tablename__ = "new_table"
    id = Column(String, primary_key=True)
    # ...fields
```

2. Export it in `app/models/__init__.py`

3. Create the table:

```python
from app.core.database import engine, Base
from app.models import NewModel

Base.metadata.create_all(bind=engine)
```

### 3. Add a New Schema

Add Pydantic models in `app/schemas/responses.py`:

```python
class NewResponse(BaseModel):
    id: str
    name: str
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store sensitive data in environment variables
3. **CORS**: Configure allowed origins appropriately
4. **Rate Limiting**: Add rate limiting for production
5. **Input Validation**: Use Pydantic schemas for all inputs

## 🚀 Deployment

### Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Configure proper CORS origins
- [ ] Use PostgreSQL instead of SQLite
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure HTTPS
- [ ] Use environment-specific configs

### Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install uv && uv sync
COPY app app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 Code Style

- Follow PEP 8 guidelines
- Use type hints where appropriate
- Write docstrings for all functions and classes
- Keep functions small and focused
- Use meaningful variable names

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linters and tests
5. Submit a pull request

## 📄 License

MIT License

## 👥 Authors

Your Team Name

---

For more information, see the [frontend README](../frontend/README.md) or visit the [API documentation](http://localhost:8000/docs).
