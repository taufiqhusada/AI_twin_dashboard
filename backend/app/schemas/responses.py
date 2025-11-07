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


class ConversationChartPoint(BaseModel):
    """Single data point for conversation chart."""
    date: str
    conversations: int
    messages: int


class EngagementChartPoint(BaseModel):
    """Single data point for feature engagement chart."""
    date: str
    questionAsked: int
    infoRetrieved: int
    documentsDrafted: int
    sharedInteractions: int


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
    action: str
    time: str
    duration: str
    messageCount: Optional[int] = None
    platform: str
    device: str


class MessageItem(BaseModel):
    """Message in conversation."""
    sender: str
    content: str
    timestamp: str


class ActivityDetail(BaseModel):
    """Detailed activity response."""
    id: str
    type: str
    user: str
    action: str
    time: str
    duration: str
    platform: str
    device: str
    
    # Conversation-specific fields
    messageCount: Optional[int] = None
    messages: Optional[List[MessageItem]] = None
    
    # Document-specific fields
    documentTitle: Optional[str] = None
    documentPreview: Optional[str] = None
    documentType: Optional[str] = None
    
    # Query-specific fields
    query: Optional[str] = None
    retrievedInfo: Optional[str] = None
    sources: Optional[List[str]] = None
    
    # Shared Twin-specific fields
    twinOwner: Optional[str] = None
    interactionSummary: Optional[str] = None
