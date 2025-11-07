"""
Database models for the AI Twin Analytics Dashboard.
Follows the schema defined in database-schema.md
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, Date, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import uuid


def generate_uuid():
    """Generate UUID as string for SQLite compatibility"""
    return str(uuid.uuid4())


class User(Base):
    """Stores information about users who own AI Twins"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    company = Column(String(255))
    department = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    timezone = Column(String(50), default='UTC')

    # Relationships
    twins = relationship("Twin", back_populates="owner", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")


class Twin(Base):
    """Represents AI Twin instances owned by users"""
    __tablename__ = "twins"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_shared = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_trained_at = Column(DateTime)
    document_count = Column(Integer, default=0)
    email_count = Column(Integer, default=0)

    # Relationships
    owner = relationship("User", back_populates="twins")
    installations = relationship("TwinInstallation", back_populates="twin", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="twin", cascade="all, delete-orphan")


class TwinInstallation(Base):
    """Tracks where AI Twins are installed (e.g., Slack workspaces)"""
    __tablename__ = "twin_installations"

    id = Column(String, primary_key=True, default=generate_uuid)
    twin_id = Column(String, ForeignKey("twins.id", ondelete="CASCADE"), nullable=False, index=True)
    platform = Column(String(50), nullable=False, index=True)  # 'slack', 'teams', 'web'
    workspace_id = Column(String(255), index=True)
    workspace_name = Column(String(255))
    installed_at = Column(DateTime, default=datetime.utcnow)
    uninstalled_at = Column(DateTime)
    is_active = Column(Boolean, default=True)

    # Relationships
    twin = relationship("Twin", back_populates="installations")


class Session(Base):
    """Tracks user sessions for engagement metrics"""
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("twins.id", ondelete="SET NULL"), index=True)
    platform = Column(String(50), nullable=False, index=True)  # 'slack', 'web', 'mobile'
    device_type = Column(String(50))  # 'desktop', 'mobile', 'tablet'
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    ended_at = Column(DateTime)
    duration_seconds = Column(Integer)
    interaction_count = Column(Integer, default=0)
    ip_address = Column(String(50))
    user_agent = Column(Text)

    # Relationships
    user = relationship("User", back_populates="sessions")
    activities = relationship("Activity", back_populates="session", cascade="all, delete-orphan")


class Activity(Base):
    """Master table for all user activities with AI Twins"""
    __tablename__ = "activities"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("twins.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="SET NULL"), index=True)
    activity_type = Column(String(50), nullable=False, index=True)  # 'conversation', 'query', 'document', 'shared'
    action_description = Column(Text)
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    ended_at = Column(DateTime)
    duration_seconds = Column(Integer)
    platform = Column(String(50), nullable=False, index=True)
    device_type = Column(String(50))
    metadata_json = Column(Text)  # JSON string for flexible data

    # Relationships
    user = relationship("User", back_populates="activities")
    twin = relationship("Twin", back_populates="activities")
    session = relationship("Session", back_populates="activities")
    conversation = relationship("Conversation", back_populates="activity", uselist=False, cascade="all, delete-orphan")
    document = relationship("Document", back_populates="activity", uselist=False, cascade="all, delete-orphan")
    query = relationship("Query", back_populates="activity", uselist=False, cascade="all, delete-orphan")
    shared_interaction = relationship("SharedTwinInteraction", back_populates="activity", uselist=False, cascade="all, delete-orphan")


class Conversation(Base):
    """Detailed conversation data linked to activities"""
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=generate_uuid)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    title = Column(String(500))
    topic = Column(String(255), index=True)
    message_count = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    activity = relationship("Activity", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    """Individual messages within conversations"""
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_type = Column(String(20), nullable=False, index=True)  # 'user' or 'twin'
    content = Column(Text, nullable=False)
    token_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    edited_at = Column(DateTime)
    is_edited = Column(Boolean, default=False)
    metadata_json = Column(Text)  # JSON string

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


class Document(Base):
    """Documents drafted by the AI Twin"""
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    document_type = Column(String(100), index=True)  # 'email', 'report', 'proposal', 'summary'
    content = Column(Text, nullable=False)
    word_count = Column(Integer)
    character_count = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_exported = Column(Boolean, default=False)
    exported_at = Column(DateTime)
    metadata_json = Column(Text)  # JSON string

    # Relationships
    activity = relationship("Activity", back_populates="document")


class Query(Base):
    """Information retrieval queries made to the AI Twin"""
    __tablename__ = "queries"

    id = Column(String, primary_key=True, default=generate_uuid)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query_text = Column(Text, nullable=False)
    query_type = Column(String(50), index=True)  # 'email_search', 'document_search', 'general'
    results_count = Column(Integer, default=0)
    retrieved_info = Column(Text)
    sources_json = Column(Text)  # JSON array of source documents/emails
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    activity = relationship("Activity", back_populates="query")


class SharedTwinInteraction(Base):
    """Tracks when users interact with someone else's Twin"""
    __tablename__ = "shared_twin_interactions"

    id = Column(String, primary_key=True, default=generate_uuid)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    accessing_user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    twin_owner_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    twin_id = Column(String, ForeignKey("twins.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_purpose = Column(String(255))
    interaction_summary = Column(Text)
    was_helpful = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    activity = relationship("Activity", back_populates="shared_interaction")


class DailyMetric(Base):
    """Pre-aggregated daily metrics for dashboard performance"""
    __tablename__ = "daily_metrics"

    id = Column(String, primary_key=True, default=generate_uuid)
    metric_date = Column(Date, unique=True, nullable=False, index=True)
    total_active_users = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    total_conversations = Column(Integer, default=0)
    total_messages = Column(Integer, default=0)
    total_documents_drafted = Column(Integer, default=0)
    total_queries = Column(Integer, default=0)
    total_shared_interactions = Column(Integer, default=0)
    avg_session_duration_seconds = Column(Integer, default=0)
    total_twin_installations = Column(Integer, default=0)
    platform_breakdown_json = Column(Text)  # JSON: {"slack": 1000, "web": 500}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserRetention(Base):
    """Tracks user retention cohorts"""
    __tablename__ = "user_retention"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cohort_date = Column(Date, nullable=False, index=True)  # Date when user first became active
    day_1_active = Column(Boolean, default=False)
    day_7_active = Column(Boolean, default=False)
    day_30_active = Column(Boolean, default=False)
    total_sessions = Column(Integer, default=0)
    last_calculated_at = Column(DateTime, default=datetime.utcnow)


class FeatureUsage(Base):
    """Tracks usage of different Twin features"""
    __tablename__ = "feature_usage"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    feature_name = Column(String(100), nullable=False, index=True)  # 'question_asked', 'info_retrieved', 'document_drafted', 'shared_interaction'
    usage_date = Column(Date, nullable=False, index=True)
    usage_count = Column(Integer, default=1)
    last_used_at = Column(DateTime, default=datetime.utcnow)
