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
    HourlyActivityPoint,
    OrganizationLeaderboardItem,
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
    
    Returns array of {date, activeUsers, average} for each day in the range.
    The average is calculated across the entire date range.
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
            "date": current.strftime("%Y-%m-%d"),
            "activeUsers": active_users
        })
        current += timedelta(days=1)
    
    # Calculate average and add to all data points
    if result:
        avg_active_users = round(sum(point["activeUsers"] for point in result) / len(result))
        for point in result:
            point["average"] = avg_active_users
    
    return result


@router.get("/conversation", response_model=List[ConversationChartPoint])
def get_conversation_chart(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get daily conversation and message counts for charting.
    
    Returns array of {date, conversations, messages, avgConversations, avgMessages} 
    for each day in the range. Averages are calculated across the entire date range.
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
            "date": current.strftime("%Y-%m-%d"),
            "conversations": conversations,
            "messages": messages
        })
        current += timedelta(days=1)
    
    # Calculate averages and add to all data points
    if result:
        avg_conversations = round(sum(point["conversations"] for point in result) / len(result))
        avg_messages = round(sum(point["messages"] for point in result) / len(result))
        for point in result:
            point["avgConversations"] = avg_conversations
            point["avgMessages"] = avg_messages
    
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
            "date": current.strftime("%Y-%m-%d"),
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


@router.get("/hourly-activity", response_model=List[HourlyActivityPoint])
def get_hourly_activity(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    """
    Get average activity by hour of day based on conversations (messages).
    
    Returns array of {hour, value} for each hour (0-23) showing average conversation count.
    Averages are calculated across all days in the date range.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    # Calculate number of days in range
    days_in_range = (end.date() - start.date()).days + 1
    
    result = []
    
    for hour in range(24):
        # Count messages (conversations) that were created during this hour across all days
        total_count = 0
        current_date = start.date()
        
        while current_date <= end.date():
            day_start = datetime.combine(current_date, datetime.min.time()).replace(hour=hour)
            day_end = day_start + timedelta(hours=1)
            
            # Count messages in this hour
            count = db.query(func.count(Message.id)).filter(
                Message.created_at >= day_start,
                Message.created_at < day_end
            ).scalar() or 0
            
            total_count += count
            current_date += timedelta(days=1)
        
        # Calculate average for this hour
        avg_count = round(total_count / days_in_range) if days_in_range > 0 else 0
        
        result.append({
            "hour": hour,
            "value": avg_count
        })
    
    return result


@router.get("/organizations/leaderboard", response_model=List[OrganizationLeaderboardItem])
def get_organization_leaderboard(
    start_date: str = QueryParam(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = QueryParam(..., description="End date in YYYY-MM-DD format"),
    limit: int = QueryParam(5, description="Number of top organizations to return"),
    db: Session = Depends(get_db)
):
    """
    Get top organizations by activity.
    
    Returns top N organizations ranked by total activities, including:
    - Organization name (from user's company field)
    - Active users count
    - Total activities
    - Average activities per user
    """
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    # Import User model
    from app.models import User
    
    # Group by company and calculate stats
    org_stats = db.query(
        User.company.label('company_name'),
        func.count(distinct(SessionModel.user_id)).label('active_users'),
        func.count(SessionModel.id).label('total_activities')
    ).join(
        SessionModel, SessionModel.user_id == User.id
    ).filter(
        SessionModel.started_at >= start,
        SessionModel.started_at <= end,
        User.company.isnot(None),
        User.company != ''
    ).group_by(
        User.company
    ).order_by(
        func.count(SessionModel.id).desc()
    ).limit(limit).all()
    
    result = []
    for idx, (company_name, active_users, total_activities) in enumerate(org_stats):
        avg_per_user = round(total_activities / active_users) if active_users > 0 else 0
        result.append({
            "id": str(idx + 1),
            "name": company_name,
            "activeUsers": active_users,
            "totalActivities": total_activities,
            "avgActivitiesPerUser": avg_per_user
        })
    
    return result
