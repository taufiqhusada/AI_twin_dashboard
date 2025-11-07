"""
Charts API endpoints.
Provides time-series data for various dashboard charts.
"""
from fastapi import APIRouter, Depends, Query as QueryParam
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from app.api.deps import get_db
from app.models import DailyMetric, FeatureUsage
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
    
    # Query daily metrics
    metrics = db.query(DailyMetric).filter(
        DailyMetric.metric_date >= start,
        DailyMetric.metric_date <= end
    ).order_by(DailyMetric.metric_date).all()
    
    result = []
    for metric in metrics:
        date_obj = metric.metric_date
        result.append({
            "date": f"{date_obj.month}/{date_obj.day}",
            "activeUsers": metric.total_active_users
        })
    
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
    
    metrics = db.query(DailyMetric).filter(
        DailyMetric.metric_date >= start,
        DailyMetric.metric_date <= end
    ).order_by(DailyMetric.metric_date).all()
    
    result = []
    for metric in metrics:
        date_obj = metric.metric_date
        result.append({
            "date": f"{date_obj.month}/{date_obj.day}",
            "conversations": metric.total_conversations,
            "messages": metric.total_messages
        })
    
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
        # Get feature usage for this date
        features = db.query(FeatureUsage).filter(
            FeatureUsage.usage_date == current
        ).all()
        
        data = {
            "date": f"{current.month}/{current.day}",
            "questionAsked": sum(f.usage_count for f in features if f.feature_name == 'question_asked'),
            "infoRetrieved": sum(f.usage_count for f in features if f.feature_name == 'info_retrieved'),
            "documentsDrafted": sum(f.usage_count for f in features if f.feature_name == 'document_drafted'),
            "sharedInteractions": sum(f.usage_count for f in features if f.feature_name == 'shared_interaction'),
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
    
    Returns aggregated feature usage counts across the date range.
    """
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    # Query and aggregate feature usage
    features = db.query(FeatureUsage).filter(
        FeatureUsage.usage_date >= start,
        FeatureUsage.usage_date <= end
    ).all()
    
    # Aggregate by feature name
    feature_map = {}
    for feature in features:
        name = feature.feature_name
        if name not in feature_map:
            feature_map[name] = 0
        feature_map[name] += feature.usage_count
    
    # Format for frontend
    feature_labels = {
        'question_asked': 'Questions Asked',
        'info_retrieved': 'Information Retrieved',
        'document_drafted': 'Documents Drafted',
        'shared_interaction': 'Shared Twin Usage',
        'email_query': 'Email Queries',
    }
    
    result = []
    for key, count in feature_map.items():
        result.append({
            "name": feature_labels.get(key, key.replace('_', ' ').title()),
            "value": count
        })
    
    return result
