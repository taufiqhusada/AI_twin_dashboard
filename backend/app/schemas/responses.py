"""
Pydantic schemas for API responses.
Defines the structure of data returned by API endpoints.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# Metrics Responses
class MetricsResponse(BaseModel):
    """Response schema for dashboard metrics."""
    totalActiveUsers: int
    activeUsersChange: float
    totalConversations: int
    conversationsChange: float
    documentsDrafted: int
    documentsChange: float
    twinInstallations: int
    installationsChange: float


# Chart Data Responses
class ActivityChartPoint(BaseModel):
    """Single data point for activity chart."""
    date: str
    activeUsers: int
    average: Optional[int] = None


class ConversationChartPoint(BaseModel):
    """Single data point for conversation chart."""
    date: str
    conversations: int
    messages: int
    avgConversations: Optional[int] = None
    avgMessages: Optional[int] = None


class EngagementChartPoint(BaseModel):
    """Single data point for feature engagement chart."""
    date: str
    questionAsked: int
    infoRetrieved: int
    documentsDrafted: int


# Feature Usage Response
class FeatureUsageItem(BaseModel):
    """Feature usage distribution item."""
    name: str
    value: int


# Retention Response
class RetentionResponse(BaseModel):
    """Response schema for user retention metrics."""
    day1: int
    day7: int
    day30: int
    avgSessionDuration: str
    sessionsPerUser: str
    powerUsersPercent: int


# Activity Responses
class ActivityListItem(BaseModel):
    """Activity item in list view."""
    id: str
    type: str
    user: str
    userEmail: Optional[str] = None
    action: str
    time: str
    duration: str
    messageCount: Optional[int] = None
    platform: str
    device: str
    isShared: Optional[bool] = None
    twinName: Optional[str] = None
    twinOwner: Optional[str] = None
    hasDocuments: Optional[bool] = None
    hasQueries: Optional[bool] = None
    documentCount: Optional[int] = None
    queryCount: Optional[int] = None


class MessageItem(BaseModel):
    """Message in conversation."""
    sender: str
    content: str
    timestamp: str
    messageId: Optional[str] = None
    documentCreated: Optional[dict] = None
    queryExecuted: Optional[dict] = None


class ActivityDetail(BaseModel):
    """Detailed activity response."""
    id: str
    type: str
    user: str
    userEmail: Optional[str] = None
    action: str
    time: str
    timestamp: Optional[str] = None
    duration: str
    platform: str
    device: str
    isShared: Optional[bool] = None
    
    # Conversation-specific fields
    messageCount: Optional[int] = None
    messages: Optional[List[MessageItem]] = None
    
    # Summary counts
    documentCount: Optional[int] = None
    queryCount: Optional[int] = None
    
    # Shared Twin-specific fields
    twinOwner: Optional[str] = None
    interactionSummary: Optional[str] = None
