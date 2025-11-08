"""
Metrics API endpoints.
Provides dashboard overview metrics with period-over-period comparisons.
"""
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import datetime, timedelta

from app.api.deps import get_db
from app.models import User, Twin, Session as SessionModel, Document
from app.schemas import MetricsResponse

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get metrics overview for the dashboard.
    
    Returns total active users, conversations, documents drafted, twin installations
    with percentage changes vs previous period.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    period_days = (end - start).days
    
    # Previous period for comparison
    prev_start = start - timedelta(days=period_days)
    prev_end = start
    
    # Current period metrics
    total_active_users = db.query(func.count(distinct(SessionModel.user_id))).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).scalar() or 0
    
    # All sessions are conversations now
    total_conversations = db.query(func.count(SessionModel.id)).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).scalar() or 0
    
    documents_drafted = db.query(func.count(Document.id)).filter(
        Document.created_at >= start,
        Document.created_at <= end
    ).scalar() or 0
    
    twin_installations = db.query(func.count(Twin.id)).filter(
        Twin.created_at <= end
    ).scalar() or 0
    
    # Previous period metrics
    prev_active_users = db.query(func.count(distinct(SessionModel.user_id))).filter(
        SessionModel.started_at >= prev_start,
        SessionModel.started_at < prev_end
    ).scalar() or 0
    
    # All sessions are conversations
    prev_conversations = db.query(func.count(SessionModel.id)).filter(
        SessionModel.started_at >= prev_start,
        SessionModel.started_at < prev_end
    ).scalar() or 0
    
    prev_documents = db.query(func.count(Document.id)).filter(
        Document.created_at >= prev_start,
        Document.created_at < prev_end
    ).scalar() or 0
    
    prev_installations = db.query(func.count(Twin.id)).filter(
        Twin.created_at <= prev_end
    ).scalar() or 0
    
    # Calculate percentage changes
    def calc_change(current: int, previous: int) -> float:
        """Calculate percentage change between two values."""
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round(((current - previous) / previous) * 100, 1)
    
    return {
        "totalActiveUsers": total_active_users,
        "activeUsersChange": calc_change(total_active_users, prev_active_users),
        "totalConversations": total_conversations,
        "conversationsChange": calc_change(total_conversations, prev_conversations),
        "documentsDrafted": documents_drafted,
        "documentsChange": calc_change(documents_drafted, prev_documents),
        "twinInstallations": twin_installations,
        "installationsChange": calc_change(twin_installations, prev_installations),
    }
