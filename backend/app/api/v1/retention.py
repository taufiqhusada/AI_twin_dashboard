"""
Retention API endpoints.
Provides user retention metrics and analytics.
All calculated on-demand from session data.
"""
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import datetime, timedelta

from app.api.deps import get_db
from app.models import Session as SessionModel, User
from app.schemas import RetentionResponse

router = APIRouter()


@router.get("/retention", response_model=RetentionResponse)
def get_retention_metrics(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get user retention metrics calculated from actual user behavior.
    
    Returns day 1, 7, 30 retention rates, avg session duration,
    sessions per user, and power users percentage.
    
    Note: Since we removed ended_at, average session duration is now N/A.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    # Get all users who were active in the period
    active_user_ids = db.query(distinct(SessionModel.user_id)).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).all()
    active_user_ids = [uid[0] for uid in active_user_ids]
    
    if not active_user_ids:
        return {
            "day1": 0,
            "day7": 0,
            "day30": 0,
            "avgSessionDuration": "0m 0s",
            "sessionsPerUser": "0.0",
            "powerUsersPercent": 0
        }
    
    # Calculate retention based on first session date
    retention_counts = {"day1": 0, "day7": 0, "day30": 0}
    total_users = len(active_user_ids)
    
    for user_id in active_user_ids:
        # Get user's first session
        first_session = db.query(SessionModel).filter(
            SessionModel.user_id == user_id
        ).order_by(SessionModel.started_at).first()
        
        if not first_session:
            continue
            
        cohort_date = first_session.started_at.date()
        
        # Check if user was active on day 1, 7, 30
        for days, key in [(1, "day1"), (7, "day7"), (30, "day30")]:
            check_date = cohort_date + timedelta(days=days)
            if check_date > datetime.now().date():
                continue
                
            day_start = datetime.combine(check_date, datetime.min.time())
            day_end = datetime.combine(check_date, datetime.max.time())
            
            was_active = db.query(SessionModel).filter(
                SessionModel.user_id == user_id,
                SessionModel.started_at >= day_start,
                SessionModel.started_at <= day_end
            ).first() is not None
            
            if was_active:
                retention_counts[key] += 1
    
    # Average session duration is now N/A since we don't track ended_at
    avg_duration = 0
    minutes = 0
    seconds = 0
    
    # Calculate sessions per user
    total_sessions = db.query(func.count(SessionModel.id)).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).scalar() or 0
    
    sessions_per_user = round(total_sessions / total_users, 1) if total_users > 0 else 0.0
    
    # Calculate power users (10+ sessions)
    power_users = db.query(SessionModel.user_id).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).group_by(SessionModel.user_id).having(
        func.count(SessionModel.id) >= 10
    ).count()
    
    power_users_percent = int((power_users / total_users) * 100) if total_users > 0 else 0
    
    return {
        "day1": int((retention_counts["day1"] / total_users) * 100) if total_users > 0 else 0,
        "day7": int((retention_counts["day7"] / total_users) * 100) if total_users > 0 else 0,
        "day30": int((retention_counts["day30"] / total_users) * 100) if total_users > 0 else 0,
        "avgSessionDuration": f"{minutes}m {seconds}s",
        "sessionsPerUser": str(sessions_per_user),
        "powerUsersPercent": power_users_percent
    }
