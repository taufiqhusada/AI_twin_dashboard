"""
Activities API endpoints.
Provides activity tracking, listing, filtering, and detailed views.
"""
from fastapi import APIRouter, Depends, Query as QueryParam, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
import json

from app.api.deps import get_db
from app.models import User, Activity, Conversation, Document, Query, SharedTwinInteraction
from app.schemas import ActivityListItem, ActivityDetail
from app.utils import format_time_ago, format_duration

router = APIRouter()


@router.get("/activities", response_model=List[ActivityListItem])
def get_activities(
    page: int = QueryParam(1, ge=1, description="Page number"),
    limit: int = QueryParam(100, ge=1, le=1000, description="Items per page"),
    type: Optional[str] = QueryParam(None, description="Filter by activity type"),
    user: Optional[str] = QueryParam(None, description="Filter by user email"),
    db: Session = Depends(get_db)
):
    """
    Get all activities with filtering and pagination.
    
    Supports filtering by activity type and user email, with pagination.
    Returns array of activity objects with basic details.
    """
    query = db.query(Activity).join(User)
    
    # Apply filters
    if type and type != 'all':
        query = query.filter(Activity.activity_type == type)
    
    if user:
        query = query.filter(User.email.like(f"%{user}%"))
    
    # Order by most recent first
    query = query.order_by(Activity.started_at.desc())
    
    # Pagination
    offset = (page - 1) * limit
    activities = query.offset(offset).limit(limit).all()
    
    # Format response
    result = []
    for activity in activities:
        # Calculate time ago
        time_diff = datetime.utcnow() - activity.started_at
        time_ago = format_time_ago(time_diff)
        
        # Format duration
        duration = format_duration(activity.duration_seconds)
        
        # Get message count if conversation
        message_count = None
        if activity.activity_type == 'conversation' and activity.conversation:
            message_count = activity.conversation.message_count
        
        result.append({
            "id": activity.id,
            "type": activity.activity_type,
            "user": activity.user.email,
            "action": activity.action_description,
            "time": time_ago,
            "duration": duration,
            "messageCount": message_count,
            "platform": activity.platform,
            "device": activity.device_type or "Desktop"
        })
    
    return result


@router.get("/activities/{activity_id}", response_model=ActivityDetail)
def get_activity_detail(
    activity_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific activity.
    
    Returns full activity object with related data including:
    - Conversation: messages array
    - Document: title, preview, type
    - Query: query text, retrieved info, sources
    - Shared: twin owner, interaction summary
    """
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Calculate time ago and duration
    time_diff = datetime.utcnow() - activity.started_at
    time_ago = format_time_ago(time_diff)
    duration = format_duration(activity.duration_seconds)
    
    # Base response
    response = {
        "id": activity.id,
        "type": activity.activity_type,
        "user": activity.user.email,
        "action": activity.action_description,
        "time": time_ago,
        "duration": duration,
        "platform": activity.platform,
        "device": activity.device_type or "Desktop"
    }
    
    # Add type-specific details
    if activity.activity_type == 'conversation' and activity.conversation:
        messages = []
        for msg in activity.conversation.messages:
            messages.append({
                "sender": msg.sender_type,
                "content": msg.content,
                "timestamp": msg.created_at.strftime("%I:%M %p")
            })
        response["messageCount"] = activity.conversation.message_count
        response["messages"] = messages
    
    elif activity.activity_type == 'document' and activity.document:
        response["documentTitle"] = activity.document.title
        response["documentPreview"] = activity.document.content
        response["documentType"] = activity.document.document_type
    
    elif activity.activity_type == 'query' and activity.query:
        response["query"] = activity.query.query_text
        response["retrievedInfo"] = activity.query.retrieved_info
        if activity.query.sources_json:
            response["sources"] = json.loads(activity.query.sources_json)
    
    elif activity.activity_type == 'shared' and activity.shared_interaction:
        # Get twin owner details
        twin_owner = db.query(User).filter(
            User.id == activity.shared_interaction.twin_owner_id
        ).first()
        response["twinOwner"] = twin_owner.email if twin_owner else "Unknown"
        response["interactionSummary"] = activity.shared_interaction.interaction_summary
    
    return response
