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
from app.models import Session as SessionModel, Message, Document, Query as QueryModel
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
        
        # Count sessions (all sessions are conversations)
        conversations = db.query(func.count(SessionModel.id)).filter(
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        # Count messages in those sessions
        messages = db.query(func.count(Message.id)).join(
            SessionModel, Message.session_id == SessionModel.id
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
    
    Returns array of {date, questionAsked, infoRetrieved, documentsDrafted}
    for each day in the range.
    
    Note: These metrics represent actual actions taken, not session types.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    result = []
    current = start
    
    while current <= end:
        day_start = datetime.combine(current, datetime.min.time())
        day_end = datetime.combine(current, datetime.max.time())
        
        # Count sessions (conversations/questions)
        questions_asked = db.query(func.count(SessionModel.id)).filter(
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        # Count queries (info retrieval)
        info_retrieved = db.query(func.count(QueryModel.id)).join(
            SessionModel, QueryModel.session_id == SessionModel.id
        ).filter(
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        # Count documents drafted
        documents_drafted = db.query(func.count(Document.id)).join(
            SessionModel, Document.session_id == SessionModel.id
        ).filter(
            SessionModel.started_at >= day_start,
            SessionModel.started_at <= day_end
        ).scalar() or 0
        
        data = {
            "date": f"{current.month}/{current.day}",
            "questionAsked": questions_asked,
            "infoRetrieved": info_retrieved,
            "documentsDrafted": documents_drafted,
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
    
    Returns count of different action types users performed:
    - Questions/Conversations: Total sessions (each session is a conversation)
    - Documents Drafted: Total documents created
    - Information Retrieved: Total queries/searches performed
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    result = []
    
    # Count total sessions/conversations (questions asked)
    sessions_count = db.query(func.count(SessionModel.id)).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end
    ).scalar() or 0
    
    if sessions_count > 0:
        result.append({
            "name": "Questions Asked",
            "value": sessions_count
        })
    
    # Count documents drafted
    documents_count = db.query(func.count(Document.id)).filter(
        Document.created_at >= start,
        Document.created_at <= end
    ).scalar() or 0
    
    if documents_count > 0:
        result.append({
            "name": "Documents Drafted",
            "value": documents_count
        })
    
    # Count information retrieval queries
    queries_count = db.query(func.count(QueryModel.id)).filter(
        QueryModel.created_at >= start,
        QueryModel.created_at <= end
    ).scalar() or 0
    
    if queries_count > 0:
        result.append({
            "name": "Information Retrieved",
            "value": queries_count
        })
    
    return result
