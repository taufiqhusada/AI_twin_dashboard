"""
Activities API endpoints.
Provides activity tracking, listing, filtering, and detailed views.
"""
from fastapi import APIRouter, Depends, Query as QueryParam, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List

from app.api.deps import get_db
from app.models import User, Session as SessionModel, Twin
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
    """Get all sessions (activities) with filtering and pagination"""
    query = db.query(SessionModel).join(User, SessionModel.user_id == User.id)
    
    if type and type != 'all':
        query = query.filter(SessionModel.activity_type == type)
    
    if user:
        query = query.filter(User.email.like(f"%{user}%"))
    
    query = query.order_by(SessionModel.started_at.desc())
    offset = (page - 1) * limit
    sessions = query.offset(offset).limit(limit).all()
    
    result = []
    for session in sessions:
        time_diff = datetime.utcnow() - session.started_at
        time_ago = format_time_ago(time_diff)
        
        # Since we don't have ended_at anymore, duration is N/A
        duration = "N/A"
        
        message_count = None
        if session.activity_type == 'conversation' and session.conversation:
            message_count = len(session.conversation.messages)
        
        result.append({
            "id": session.id,
            "type": session.activity_type,
            "user": session.user.email,
            "action": session.title or f"{session.activity_type.replace('_', ' ').title()}",
            "time": time_ago,
            "duration": duration,
            "messageCount": message_count,
            "platform": "slack",  # Always slack now
            "device": "Desktop"
        })
    
    return result


@router.get("/activities/{activity_id}", response_model=ActivityDetail)
def get_activity_detail(activity_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific session/activity"""
    session = db.query(SessionModel).filter(SessionModel.id == activity_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    time_diff = datetime.utcnow() - session.started_at
    time_ago = format_time_ago(time_diff)
    duration = "N/A"  # No ended_at field anymore
    
    response = {
        "id": session.id,
        "type": session.activity_type,
        "user": session.user.email,
        "action": session.title or f"{session.activity_type.replace('_', ' ').title()}",
        "time": time_ago,
        "duration": duration,
        "platform": "slack",
        "device": "Desktop"
    }
    
    if session.activity_type == 'conversation' and session.conversation:
        messages = []
        for msg in session.conversation.messages:
            messages.append({
                "sender": msg.sender_type,
                "content": msg.content,
                "timestamp": msg.created_at.strftime("%I:%M %p")
            })
        response["messageCount"] = len(messages)
        response["messages"] = messages
    
    elif session.activity_type == 'document' and session.document:
        response["documentTitle"] = session.title or "Untitled Document"
        response["documentPreview"] = session.document.content[:500] + "..." if len(session.document.content) > 500 else session.document.content
        response["documentType"] = session.document.document_type
    
    elif session.activity_type == 'query' and session.query:
        response["query"] = session.query.query_text
        response["retrievedInfo"] = f"Found {session.query.results_count} results"
        response["sources"] = []
    
    # If it's a shared twin session, add owner info
    if session.is_shared_twin:
        twin = db.query(Twin).filter(Twin.id == session.twin_id).first()
        if twin:
            twin_owner = db.query(User).filter(User.id == twin.user_id).first()
            response["twinOwner"] = twin_owner.email if twin_owner else "Unknown"
            response["interactionSummary"] = f"Used {twin_owner.email if twin_owner else 'someone'}'s Twin"
    
    return response
