"""
Activities API endpoints.
Provides activity tracking, listing, filtering, and detailed views.
"""
from fastapi import APIRouter, Depends, Query as QueryParam, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.api.deps import get_db
from app.models import User, Session as SessionModel, Twin
from app.schemas import ActivityListItem, ActivityDetail
from app.utils import format_time_ago, format_duration

router = APIRouter()


@router.get("/activities")
def get_activities(
    page: int = QueryParam(1, ge=1, description="Page number"),
    limit: int = QueryParam(20, ge=1, le=100, description="Items per page"),
    type: Optional[str] = QueryParam(None, description="Filter by activity type"),
    user: Optional[str] = QueryParam(None, description="Filter by user email"),
    start_date: Optional[str] = QueryParam(None, description="Filter start date (YYYY-MM-DD)"),
    end_date: Optional[str] = QueryParam(None, description="Filter end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get all sessions (activities) with filtering and pagination"""
    query = db.query(SessionModel).join(User, SessionModel.user_id == User.id)
    
    # Type filter can be: 'conversation', 'document', 'query', 'shared_twin'
    if type and type != 'all':
        if type == 'shared_twin':
            query = query.filter(SessionModel.is_shared_twin == True)
        elif type == 'document':
            # Sessions that have documents
            query = query.filter(SessionModel.documents.any())
        elif type == 'query':
            # Sessions that have queries
            query = query.filter(SessionModel.queries.any())
        # 'conversation' shows all sessions since all sessions are conversations
    
    if user:
        query = query.filter(User.email.like(f"%{user}%"))
    
    # Date range filter
    if start_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(SessionModel.started_at >= start)
        except ValueError:
            pass  # Invalid date format, skip filter
    
    if end_date:
        try:
            from datetime import timedelta
            end = datetime.strptime(end_date, "%Y-%m-%d")
            # Include the entire end date by adding 1 day
            end = end + timedelta(days=1)
            query = query.filter(SessionModel.started_at < end)
        except ValueError:
            pass  # Invalid date format, skip filter
    
    # Get total count before pagination
    total_count = query.count()
    
    query = query.order_by(SessionModel.started_at.desc())
    offset = (page - 1) * limit
    sessions = query.offset(offset).limit(limit).all()
    
    result = []
    for session in sessions:
        time_diff = datetime.utcnow() - session.started_at
        time_ago = format_time_ago(time_diff)
        
        # All activities are conversations - type no longer differentiates
        activity_type = 'conversation'
        
        message_count = len(session.messages)
        
        # Get twin info
        twin_name = None
        twin_owner = None
        if session.twin:
            twin_name = session.twin.name
            # Get twin owner
            twin_owner_user = db.query(User).filter(User.id == session.twin.user_id).first()
            if twin_owner_user:
                twin_owner = twin_owner_user.email
        
        result.append({
            "id": session.id,
            "type": activity_type,
            "user": session.user.full_name,
            "userEmail": session.user.email,
            "action": session.title or "Conversation",
            "time": time_ago,
            "duration": "N/A",
            "messageCount": message_count if message_count > 0 else None,
            "platform": "slack",
            "device": "Desktop",
            "isShared": session.is_shared_twin,
            "twinName": twin_name,
            "twinOwner": twin_owner,
            "hasDocuments": len(session.documents) > 0,
            "hasQueries": len(session.queries) > 0,
            "documentCount": len(session.documents),
            "queryCount": len(session.queries)
        })
    
    total_pages = (total_count + limit - 1) // limit  # Ceiling division
    
    return {
        "items": result,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }


@router.get("/activities/{activity_id}", response_model=ActivityDetail)
def get_activity_detail(activity_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific session/activity"""
    session = db.query(SessionModel).filter(SessionModel.id == activity_id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    time_diff = datetime.utcnow() - session.started_at
    time_ago = format_time_ago(time_diff)
    duration = "N/A"
    
    # All activities are conversations
    activity_type = 'conversation'
    
    response = {
        "id": session.id,
        "type": activity_type,
        "user": session.user.full_name,
        "userEmail": session.user.email,
        "action": session.title or "Conversation",
        "time": time_ago,
        "timestamp": session.started_at.strftime("%B %d, %Y at %I:%M %p"),
        "duration": duration,
        "platform": "slack",
        "device": "Desktop",
        "isShared": session.is_shared_twin
    }
    
    # Add messages with action indicators
    if session.messages:
        messages = []
        for msg in session.messages:
            msg_data = {
                "sender": msg.sender_type,
                "content": msg.content,
                "timestamp": msg.created_at.strftime("%I:%M %p"),
                "messageId": msg.id
            }
            
            # Use message_type field to efficiently determine what to fetch
            if msg.message_type and 'document' in msg.message_type:
                # Only query documents table if message has document type
                doc_for_msg = next((d for d in session.documents if d.message_id == msg.id), None)
                if doc_for_msg:
                    msg_data["documentCreated"] = {
                        "title": doc_for_msg.title or "Untitled Document",
                        "type": doc_for_msg.document_type,
                        "wordCount": doc_for_msg.word_count or 0
                    }
            
            if msg.message_type and 'query' in msg.message_type:
                # Only query queries table if message has query type
                query_for_msg = next((q for q in session.queries if q.message_id == msg.id), None)
                if query_for_msg:
                    msg_data["queryExecuted"] = {
                        "query": query_for_msg.query_text,
                        "resultsCount": query_for_msg.results_count
                    }
            
            messages.append(msg_data)
        
        response["messageCount"] = len(messages)
        response["messages"] = messages
    
    # Add summary counts
    response["documentCount"] = len(session.documents)
    response["queryCount"] = len(session.queries)
    # Add summary counts
    response["documentCount"] = len(session.documents)
    response["queryCount"] = len(session.queries)
    
    # If it's a shared twin session, add owner info
    if session.is_shared_twin:
        twin = db.query(Twin).filter(Twin.id == session.twin_id).first()
        if twin:
            twin_owner = db.query(User).filter(User.id == twin.user_id).first()
            response["twinOwner"] = twin_owner.email if twin_owner else "Unknown"
            response["interactionSummary"] = f"Used {twin_owner.email if twin_owner else 'someone'}'s Twin"
    
    return response
