"""
Charts API endpoints.
Provides time-series data for various dashboard charts.
All data is calculated on-demand from sessions.
"""
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import datetime, timedelta
from typing import List

from app.api.deps import get_db
from app.models import Session as SessionModel, Message, Conversation
from app.schemas import (
    ActivityChartPoint,
    ConversationChartPoint,
    EngagementChartPoint,
    FeatureUsageItem,
)

router = APIRouter()


@router.get("/activity", response_model=List[ActivityChartPoint])
def get_activity_chart(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get daily active users for charting.
    
    Returns array of {date, activeUsers} for each day in the range.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    result = []
    current = start
    
    while current <= end:
        day_start = datetime.combine(current, datetime.min.time())
        day_end = datetime.combine(current, datetime.max.time())
        
        # Count distinct users with sessions on this day
        active_users = db.query(func.count(distinct(SessionModel.user_id))).filter(
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        result.append({
            "date": f"{current.month}/{current.day}",
            "activeUsers": active_users
        })
        current += timedelta(days=1)
    
    return result


@router.get("/conversation", response_model=List[ConversationChartPoint])
def get_conversation_chart(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get daily conversation and message counts for charting.
    
    Returns array of {date, conversations, messages} for each day in the range.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    result = []
    current = start
    
    while current <= end:
        day_start = datetime.combine(current, datetime.min.time())
        day_end = datetime.combine(current, datetime.max.time())
        
        # Count conversation sessions
        conversations = db.query(func.count(SessionModel.id)).filter(
            SessionModel.activity_type == 'conversation',
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        # Count messages (join through conversations and sessions)
        messages = db.query(func.count(Message.id)).join(
            Conversation, Message.conversation_id == Conversation.id
        ).join(
            SessionModel, Conversation.session_id == SessionModel.id
        ).filter(
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        result.append({
            "date": f"{current.month}/{current.day}",
            "conversations": conversations,
            "messages": messages
        })
        current += timedelta(days=1)
    
    return result


@router.get("/engagement", response_model=List[EngagementChartPoint])
def get_engagement_chart(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get daily feature engagement for charting.
    
    Returns array of {date, questionAsked, infoRetrieved, documentsDrafted, sharedInteractions}
    for each day in the range.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    result = []
    current = start
    
    while current <= end:
        day_start = datetime.combine(current, datetime.min.time())
        day_end = datetime.combine(current, datetime.max.time())
        
        # Count each activity type for this day
        def count_activity_type(activity_type: str) -> int:
            return db.query(func.count(SessionModel.id)).filter(
                SessionModel.activity_type == activity_type,
                SessionModel.started_at >= day_start,
                SessionModel.started_at <= day_end
            ).scalar() or 0
        
        # Count shared twin sessions
        shared_interactions = db.query(func.count(SessionModel.id)).filter(
            SessionModel.is_shared_twin == True,
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        data = {
            "date": f"{current.month}/{current.day}",
            "questionAsked": count_activity_type('conversation'),
            "infoRetrieved": count_activity_type('query'),
            "documentsDrafted": count_activity_type('document'),
            "sharedInteractions": shared_interactions,
        }
        result.append(data)
        current += timedelta(days=1)
    
    return result


@router.get("/features/usage", response_model=List[FeatureUsageItem])
def get_feature_distribution(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get feature usage distribution (for pie chart).
    
    Returns aggregated session counts by activity type across the date range.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    # Count each activity type in the date range
    activity_counts = db.query(
        SessionModel.activity_type,
        func.count(SessionModel.id).label('count')
    ).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).group_by(SessionModel.activity_type).all()
    
    # Map activity types to user-friendly names
    feature_labels = {
        'conversation': 'Questions Asked',
        'query': 'Information Retrieved',
        'document': 'Documents Drafted',
    }
    
    result = []
    for activity_type, count in activity_counts:
        result.append({
            "name": feature_labels.get(activity_type, activity_type.replace('_', ' ').title()),
            "value": count
        })
    
    # Add shared twin count separately
    shared_count = db.query(func.count(SessionModel.id)).filter(
        SessionModel.is_shared_twin == True,
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).scalar() or 0
    
    if shared_count > 0:
        result.append({
            "name": "Shared Twin Usage",
            "value": shared_count
        })
    
    return result
