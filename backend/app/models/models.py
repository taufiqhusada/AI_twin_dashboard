"""
Database models for the AI Twin Analytics Dashboard.
Ultra-clean, realistic schema.

Schema:
- Users own Twins
- Sessions are activities (conversations, queries, documents)
- is_shared_twin flag indicates if using someone else's twin
- Detail tables (Conversation, Document, Query) link to sessions
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import uuid


def generate_uuid():
    """Generate UUID as string for SQLite compatibility"""
    return str(uuid.uuid4())


class User(Base):
    """User accounts"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    company = Column(String(255))
    department = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, index=True)  # Track user's last login

    # Relationships
    twins = relationship("Twin", back_populates="owner", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")


class Twin(Base):
    """AI Twin instances owned by users"""
    __tablename__ = "twins"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_shared = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="twins")
    sessions = relationship("Session", back_populates="twin", cascade="all, delete-orphan")


class Session(Base):
    """
    A session represents a Slack conversation thread with a Twin.
    Each session has a topic and multiple messages.
    During the conversation, documents and queries can be created.
    is_shared_twin=True means user is using someone else's twin.
    """
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("twins.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, default='slack')  # Always 'slack'
    title = Column(String(500))
    topic = Column(String(255))  # Conversation topic
    is_shared_twin = Column(Boolean, default=False, index=True)  # True if using someone else's twin
    started_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="sessions")
    twin = relationship("Twin", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="session", cascade="all, delete-orphan")
    queries = relationship("Query", back_populates="session", cascade="all, delete-orphan")


class Message(Base):
    """Messages within a session"""
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_type = Column(String(20), nullable=False)  # 'user' or 'twin'
    content = Column(Text, nullable=False)
    message_type = Column(String(20), default='general', index=True)  # 'document', 'query', 'general'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="messages")


class Document(Base):
    """Documents drafted by the AI Twin during a conversation"""
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    message_id = Column(String, ForeignKey("messages.id", ondelete="SET NULL"), nullable=True, index=True)  # Message that triggered document creation
    document_type = Column(String(100))  # 'email', 'report', 'proposal', 'summary'
    title = Column(String(500))
    content = Column(Text, nullable=False)
    word_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="documents")
    message = relationship("Message", foreign_keys=[message_id])


class Query(Base):
    """Information retrieval queries during a conversation"""
    __tablename__ = "queries"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    message_id = Column(String, ForeignKey("messages.id", ondelete="SET NULL"), nullable=True, index=True)  # Message that triggered query
    query_text = Column(Text, nullable=False)
    query_type = Column(String(50))  # 'email_search', 'document_search', 'general'
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    session = relationship("Session", back_populates="queries")
    message = relationship("Message", foreign_keys=[message_id])


# Export all models
__all__ = [
    'User',
    'Twin',
    'Session',
    'Message',
    'Document',
    'Query',
]
