"""
Retention API endpoints.
Provides user retention metrics and analytics.
"""
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import datetime

from app.api.deps import get_db
from app.models import UserRetention, Session as SessionModel
from app.schemas import RetentionResponse

router = APIRouter()


@router.get("/retention", response_model=RetentionResponse)
def get_retention_metrics(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get user retention metrics.
    
    Returns day 1, 7, 30 retention rates, avg session duration,
    sessions per user, and power users percentage.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    # Get ALL retention data (not filtered by cohort date, since we want overall retention metrics)
    retention_data = db.query(UserRetention).all()
    
    if not retention_data:
        return {
            "day1": 0,
            "day7": 0,
            "day30": 0,
            "avgSessionDuration": "0m 0s",
            "sessionsPerUser": "0.0",
            "powerUsersPercent": 0
        }
    
    # Calculate retention percentages across all users
    total_users = len(retention_data)
    day_1_retained = sum(1 for r in retention_data if r.day_1_active)
    day_7_retained = sum(1 for r in retention_data if r.day_7_active)
    day_30_retained = sum(1 for r in retention_data if r.day_30_active)
    
    # Calculate average session duration
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end, datetime.max.time())
    
    avg_duration = db.query(func.avg(SessionModel.duration_seconds)).filter(
        SessionModel.started_at >= start_dt,
        SessionModel.started_at <= end_dt,
        SessionModel.duration_seconds.isnot(None)
    ).scalar() or 0
    
    minutes = int(avg_duration // 60)
    seconds = int(avg_duration % 60)
    
    # Calculate sessions per user
    total_sessions = db.query(func.count(SessionModel.id)).filter(
        SessionModel.started_at >= start_dt,
        SessionModel.started_at <= end_dt
    ).scalar() or 0
    
    active_users = db.query(func.count(distinct(SessionModel.user_id))).filter(
        SessionModel.started_at >= start_dt,
        SessionModel.started_at <= end_dt
    ).scalar() or 1
    
    sessions_per_user = round(total_sessions / active_users, 1) if active_users > 0 else 0.0
    
    # Calculate power users (10+ sessions)
    power_users = db.query(SessionModel.user_id).filter(
        SessionModel.started_at >= start_dt,
        SessionModel.started_at <= end_dt
    ).group_by(SessionModel.user_id).having(
        func.count(SessionModel.id) >= 10
    ).count()
    
    power_users_percent = int((power_users / active_users) * 100) if active_users > 0 else 0
    
    return {
        "day1": int((day_1_retained / total_users) * 100) if total_users > 0 else 0,
        "day7": int((day_7_retained / total_users) * 100) if total_users > 0 else 0,
        "day30": int((day_30_retained / total_users) * 100) if total_users > 0 else 0,
        "avgSessionDuration": f"{minutes}m {seconds}s",
        "sessionsPerUser": str(sessions_per_user),
        "powerUsersPercent": power_users_percent
    }
