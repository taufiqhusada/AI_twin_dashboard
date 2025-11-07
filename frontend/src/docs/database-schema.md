# AI Twin Analytics - Database Schema Documentation

## Overview

This document outlines the complete SQL database schema for the AI Twin Analytics Dashboard. The schema is designed to support user tracking, activity logging, engagement metrics, and comprehensive analytics.

## Database: `ai_twin_analytics`

---

## Tables

### 1. `users`
Stores information about users who own AI Twins.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    INDEX idx_users_email (email),
    INDEX idx_users_company (company),
    INDEX idx_users_last_active (last_active_at)
);
```

**Sample Data:**
```sql
INSERT INTO users (email, full_name, company, department) VALUES
('sarah.chen@company.com', 'Sarah Chen', 'Acme Corp', 'Engineering'),
('mike.johnson@company.com', 'Mike Johnson', 'Acme Corp', 'Product'),
('alex.rodriguez@company.com', 'Alex Rodriguez', 'Acme Corp', 'Marketing');
```

---

### 2. `twins`
Represents AI Twin instances owned by users.

```sql
CREATE TABLE twins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_trained_at TIMESTAMP WITH TIME ZONE,
    document_count INTEGER DEFAULT 0,
    email_count INTEGER DEFAULT 0,
    
    INDEX idx_twins_user_id (user_id),
    INDEX idx_twins_is_shared (is_shared)
);
```

**Sample Data:**
```sql
INSERT INTO twins (user_id, name, is_shared, document_count, email_count) 
SELECT id, full_name || '''s Twin', true, 150, 1200 FROM users LIMIT 3;
```

---

### 3. `twin_installations`
Tracks where AI Twins are installed (e.g., Slack workspaces).

```sql
CREATE TABLE twin_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'slack', 'teams', 'web'
    workspace_id VARCHAR(255),
    workspace_name VARCHAR(255),
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uninstalled_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    
    INDEX idx_twin_installations_twin_id (twin_id),
    INDEX idx_twin_installations_platform (platform),
    INDEX idx_twin_installations_workspace_id (workspace_id),
    UNIQUE (twin_id, platform, workspace_id)
);
```

**Sample Data:**
```sql
INSERT INTO twin_installations (twin_id, platform, workspace_id, workspace_name)
SELECT id, 'slack', 'T0123456789', 'Acme Corp Workspace' FROM twins;
```

---

### 4. `sessions`
Tracks user sessions for engagement metrics.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    twin_id UUID REFERENCES twins(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL, -- 'slack', 'web', 'mobile'
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    interaction_count INTEGER DEFAULT 0,
    ip_address INET,
    user_agent TEXT,
    
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_twin_id (twin_id),
    INDEX idx_sessions_started_at (started_at),
    INDEX idx_sessions_platform (platform)
);
```

**Sample Data:**
```sql
INSERT INTO sessions (user_id, twin_id, platform, device_type, started_at, ended_at, duration_seconds, interaction_count)
SELECT 
    u.id, 
    t.id, 
    'slack', 
    'desktop',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes',
    600,
    8
FROM users u
JOIN twins t ON t.user_id = u.id
LIMIT 5;
```

---

### 5. `activities`
Master table for all user activities with AI Twins.

```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'conversation', 'query', 'document', 'shared'
    action_description TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    platform VARCHAR(50) NOT NULL,
    device_type VARCHAR(50),
    metadata JSONB, -- Flexible storage for activity-specific data
    
    INDEX idx_activities_user_id (user_id),
    INDEX idx_activities_twin_id (twin_id),
    INDEX idx_activities_session_id (session_id),
    INDEX idx_activities_type (activity_type),
    INDEX idx_activities_started_at (started_at),
    INDEX idx_activities_platform (platform)
);
```

**Sample Data:**
```sql
INSERT INTO activities (user_id, twin_id, session_id, activity_type, action_description, started_at, ended_at, duration_seconds, platform, device_type)
SELECT 
    u.id,
    t.id,
    s.id,
    'conversation',
    'Started conversation about Q4 planning strategy',
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP - INTERVAL '55 minutes',
    300,
    'slack',
    'desktop'
FROM users u
JOIN twins t ON t.user_id = u.id
JOIN sessions s ON s.user_id = u.id
LIMIT 10;
```

---

### 6. `conversations`
Detailed conversation data linked to activities.

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID UNIQUE NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    title VARCHAR(500),
    topic VARCHAR(255),
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_conversations_activity_id (activity_id),
    INDEX idx_conversations_topic (topic)
);
```

**Sample Data:**
```sql
INSERT INTO conversations (activity_id, title, topic, message_count)
SELECT 
    id,
    'Discussion about ' || action_description,
    'Project Planning',
    FLOOR(RANDOM() * 10 + 3)::INTEGER
FROM activities 
WHERE activity_type = 'conversation'
LIMIT 20;
```

---

### 7. `messages`
Individual messages within conversations.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'user' or 'twin'
    content TEXT NOT NULL,
    token_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_edited BOOLEAN DEFAULT false,
    metadata JSONB, -- For storing additional context, sentiment, etc.
    
    INDEX idx_messages_conversation_id (conversation_id),
    INDEX idx_messages_sender_type (sender_type),
    INDEX idx_messages_created_at (created_at)
);
```

**Sample Data:**
```sql
INSERT INTO messages (conversation_id, sender_type, content, token_count)
SELECT 
    c.id,
    CASE WHEN gs % 2 = 0 THEN 'user' ELSE 'twin' END,
    CASE 
        WHEN gs % 2 = 0 THEN 'Can you help me with the project planning?'
        ELSE 'I found several relevant emails and documents. Here are the key details...'
    END,
    FLOOR(RANDOM() * 100 + 20)::INTEGER
FROM conversations c
CROSS JOIN generate_series(1, 5) gs;
```

---

### 8. `documents`
Documents drafted by the AI Twin.

```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID UNIQUE NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    document_type VARCHAR(100), -- 'email', 'report', 'proposal', 'summary'
    content TEXT NOT NULL,
    word_count INTEGER,
    character_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_exported BOOLEAN DEFAULT false,
    exported_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    
    INDEX idx_documents_activity_id (activity_id),
    INDEX idx_documents_user_id (user_id),
    INDEX idx_documents_type (document_type),
    INDEX idx_documents_created_at (created_at)
);
```

**Sample Data:**
```sql
INSERT INTO documents (activity_id, user_id, title, document_type, content, word_count)
SELECT 
    a.id,
    a.user_id,
    'Project Proposal - ' || TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'),
    'proposal',
    'Executive Summary\n\nThis proposal outlines the key objectives and milestones...',
    250
FROM activities a
WHERE a.activity_type = 'document'
LIMIT 15;
```

---

### 9. `queries`
Information retrieval queries made to the AI Twin.

```sql
CREATE TABLE queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID UNIQUE NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    query_type VARCHAR(50), -- 'email_search', 'document_search', 'general'
    results_count INTEGER DEFAULT 0,
    retrieved_info TEXT,
    sources JSONB, -- Array of source documents/emails
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_queries_activity_id (activity_id),
    INDEX idx_queries_user_id (user_id),
    INDEX idx_queries_type (query_type),
    INDEX idx_queries_created_at (created_at)
);
```

**Sample Data:**
```sql
INSERT INTO queries (activity_id, user_id, query_text, query_type, results_count, sources)
SELECT 
    a.id,
    a.user_id,
    'Find email history about client meeting',
    'email_search',
    5,
    '["Email from john.doe@company.com on Oct 15, 2025", "Team meeting notes from Oct 10, 2025"]'::JSONB
FROM activities a
WHERE a.activity_type = 'query'
LIMIT 15;
```

---

### 10. `shared_twin_interactions`
Tracks when users interact with someone else's Twin.

```sql
CREATE TABLE shared_twin_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID UNIQUE NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    accessing_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    twin_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
    interaction_purpose VARCHAR(255),
    interaction_summary TEXT,
    was_helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_shared_interactions_activity_id (activity_id),
    INDEX idx_shared_interactions_accessing_user (accessing_user_id),
    INDEX idx_shared_interactions_owner (twin_owner_id),
    INDEX idx_shared_interactions_twin (twin_id),
    INDEX idx_shared_interactions_created_at (created_at)
);
```

**Sample Data:**
```sql
INSERT INTO shared_twin_interactions (activity_id, accessing_user_id, twin_owner_id, twin_id, interaction_purpose, interaction_summary)
SELECT 
    a.id,
    a.user_id,
    t.user_id,
    a.twin_id,
    'Check team schedule',
    'Asked about team schedule and received relevant information'
FROM activities a
JOIN twins t ON t.id = a.twin_id
WHERE a.activity_type = 'shared' AND a.user_id != t.user_id
LIMIT 10;
```

---

### 11. `daily_metrics`
Pre-aggregated daily metrics for dashboard performance.

```sql
CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    total_active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    total_documents_drafted INTEGER DEFAULT 0,
    total_queries INTEGER DEFAULT 0,
    total_shared_interactions INTEGER DEFAULT 0,
    avg_session_duration_seconds INTEGER DEFAULT 0,
    total_twin_installations INTEGER DEFAULT 0,
    platform_breakdown JSONB, -- {"slack": 1000, "web": 500}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (metric_date),
    INDEX idx_daily_metrics_date (metric_date)
);
```

**Sample Data:**
```sql
INSERT INTO daily_metrics (metric_date, total_active_users, total_sessions, total_conversations, total_messages, total_documents_drafted)
SELECT 
    CURRENT_DATE - (n || ' days')::INTERVAL,
    FLOOR(RANDOM() * 500 + 1800)::INTEGER,
    FLOOR(RANDOM() * 200 + 600)::INTEGER,
    FLOOR(RANDOM() * 150 + 500)::INTEGER,
    FLOOR(RANDOM() * 800 + 2000)::INTEGER,
    FLOOR(RANDOM() * 50 + 100)::INTEGER
FROM generate_series(0, 90) n;
```

---

### 12. `user_retention`
Tracks user retention cohorts.

```sql
CREATE TABLE user_retention (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cohort_date DATE NOT NULL, -- Date when user first became active
    day_1_active BOOLEAN DEFAULT false,
    day_7_active BOOLEAN DEFAULT false,
    day_30_active BOOLEAN DEFAULT false,
    total_sessions INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (user_id, cohort_date),
    INDEX idx_retention_user_id (user_id),
    INDEX idx_retention_cohort_date (cohort_date)
);
```

---

### 13. `feature_usage`
Tracks usage of different Twin features.

```sql
CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL, -- 'question_asked', 'info_retrieved', 'document_drafted', 'shared_interaction'
    usage_date DATE NOT NULL,
    usage_count INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (user_id, feature_name, usage_date),
    INDEX idx_feature_usage_user_id (user_id),
    INDEX idx_feature_usage_feature (feature_name),
    INDEX idx_feature_usage_date (usage_date)
);
```

---

## Relationships Diagram

```
users (1) ----< (N) twins
users (1) ----< (N) sessions
users (1) ----< (N) activities

twins (1) ----< (N) twin_installations
twins (1) ----< (N) activities

sessions (1) ----< (N) activities

activities (1) ---- (1) conversations
activities (1) ---- (1) documents
activities (1) ---- (1) queries
activities (1) ---- (1) shared_twin_interactions

conversations (1) ----< (N) messages
```

---

## Key Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_activities_user_date ON activities(user_id, started_at DESC);
CREATE INDEX idx_activities_type_date ON activities(activity_type, started_at DESC);
CREATE INDEX idx_sessions_user_date ON sessions(user_id, started_at DESC);
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at ASC);

-- Full-text search indexes
CREATE INDEX idx_documents_content_fts ON documents USING GIN(to_tsvector('english', content));
CREATE INDEX idx_queries_text_fts ON queries USING GIN(to_tsvector('english', query_text));
```

---

## Common Queries

### 1. Get Active Users for a Date Range
```sql
SELECT 
    COUNT(DISTINCT user_id) as active_users
FROM sessions
WHERE started_at >= '2025-10-07' 
  AND started_at < '2025-11-07';
```

### 2. Get All Activities for Activities Page
```sql
SELECT 
    a.id,
    a.activity_type,
    u.email as user_email,
    a.action_description,
    a.started_at,
    a.duration_seconds,
    a.platform,
    a.device_type,
    CASE 
        WHEN a.activity_type = 'conversation' THEN c.message_count
        ELSE NULL
    END as message_count
FROM activities a
JOIN users u ON u.id = a.user_id
LEFT JOIN conversations c ON c.activity_id = a.id
ORDER BY a.started_at DESC
LIMIT 100;
```

### 3. Get Conversation Details with Messages
```sql
SELECT 
    c.id,
    c.title,
    c.topic,
    c.message_count,
    json_agg(
        json_build_object(
            'sender', m.sender_type,
            'content', m.content,
            'timestamp', m.created_at
        ) ORDER BY m.created_at ASC
    ) as messages
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.id = '...'
GROUP BY c.id;
```

### 4. Get Daily Metrics for Charts
```sql
SELECT 
    metric_date,
    total_active_users,
    total_conversations,
    total_messages,
    total_documents_drafted
FROM daily_metrics
WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY metric_date ASC;
```

### 5. Calculate Feature Usage Distribution
```sql
SELECT 
    feature_name,
    SUM(usage_count) as total_usage
FROM feature_usage
WHERE usage_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY feature_name
ORDER BY total_usage DESC;
```

### 6. Calculate User Retention Rates
```sql
SELECT 
    ROUND(AVG(CASE WHEN day_1_active THEN 100.0 ELSE 0 END), 2) as day_1_retention,
    ROUND(AVG(CASE WHEN day_7_active THEN 100.0 ELSE 0 END), 2) as day_7_retention,
    ROUND(AVG(CASE WHEN day_30_active THEN 100.0 ELSE 0 END), 2) as day_30_retention
FROM user_retention
WHERE cohort_date >= CURRENT_DATE - INTERVAL '90 days';
```

---

## Database Triggers

### Update user's last_active_at on new session
```sql
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_active_at = NEW.started_at
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_last_active
AFTER INSERT ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_user_last_active();
```

### Update conversation message count
```sql
CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET message_count = message_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_count
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_message_count();
```

### Calculate session duration on end
```sql
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_duration
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION calculate_session_duration();
```

---

## Performance Considerations

1. **Partitioning**: Consider partitioning large tables like `activities`, `messages`, and `sessions` by date for better query performance.

2. **Archiving**: Implement archiving strategy for old data (> 1 year) to maintain performance.

3. **Materialized Views**: Create materialized views for complex aggregations:
```sql
CREATE MATERIALIZED VIEW mv_monthly_user_stats AS
SELECT 
    user_id,
    DATE_TRUNC('month', started_at) as month,
    COUNT(DISTINCT session_id) as session_count,
    COUNT(*) as activity_count,
    AVG(duration_seconds) as avg_duration
FROM activities
GROUP BY user_id, DATE_TRUNC('month', started_at);

CREATE INDEX idx_mv_monthly_user_stats ON mv_monthly_user_stats(user_id, month);
```

4. **Connection Pooling**: Use PgBouncer or similar for connection pooling in production.

5. **Regular Vacuuming**: Schedule regular VACUUM ANALYZE operations to maintain index efficiency.

---

## Data Retention Policy

- **Raw activity data**: Retain for 2 years, then archive
- **Aggregated metrics**: Retain indefinitely
- **Messages**: Retain for 1 year, then summarize
- **Session logs**: Retain for 90 days, then delete
- **Deleted users**: Soft delete with 30-day grace period before hard delete

---

## Security & Privacy

1. **Encryption**: Encrypt sensitive columns (content, query_text) at rest
2. **Access Control**: Implement row-level security (RLS) for multi-tenant scenarios
3. **Audit Logging**: Create audit trail for data access and modifications
4. **PII Handling**: Hash or tokenize personally identifiable information
5. **GDPR Compliance**: Implement data export and deletion capabilities

---

## Backup Strategy

- **Full backup**: Daily at 2 AM UTC
- **Incremental backup**: Every 6 hours
- **Point-in-time recovery**: Enabled with 30-day retention
- **Backup testing**: Monthly restoration drills
- **Geographic redundancy**: Replicate to secondary region

---

## Migration Scripts

### Initial Setup
```sql
-- Run migrations in order:
-- 1. Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Create tables (in dependency order)
-- 3. Create indexes
-- 4. Create triggers
-- 5. Seed initial data
```

---

## API Integration Points

The frontend should call API endpoints that query this database:

- `GET /api/metrics?start_date=&end_date=` → Query daily_metrics
- `GET /api/activities?page=&limit=&type=&user=` → Query activities with filters
- `GET /api/activities/:id` → Get single activity with related data
- `GET /api/charts/activity` → Aggregate activities by date
- `GET /api/retention` → Calculate retention from user_retention table
- `GET /api/features/usage` → Aggregate feature_usage data

---

This schema provides a solid foundation for the AI Twin Analytics Dashboard with room for growth and optimization.
