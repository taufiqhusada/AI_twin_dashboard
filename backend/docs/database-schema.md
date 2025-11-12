# Database Schema Reference

## Quick Overview

The AI Twin Analytics Dashboard uses 6 tables:

1. **users** - User accounts
2. **twins** - AI Twin instances
3. **sessions** - Slack conversation threads (core entity)
4. **messages** - Individual messages within sessions
5. **documents** - Metadatas on documents created during conversations
6. **queries** - Metadatas on information retrieval requests

For detailed schema, indexes, relationships, and sample queries, please refer to the backend documentation linked above.

## Database: `ai_twin_analytics.db` (SQLite)

**Current:** SQLite for development  

---

## Tables (6 Total)

### 1. `users`
User accounts who own AI Twins.

**Schema:**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,                    -- UUID as string
    email TEXT UNIQUE NOT NULL,             -- User email (indexed)
    full_name TEXT NOT NULL,                -- User's full name
    company TEXT,                           -- Company name
    department TEXT,                        -- Department name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP                 -- Last activity timestamp (indexed)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_login ON users(last_login_at);
```

**Purpose:**
- Store user account information
- Track company and department for leaderboard
- Monitor last login for engagement tracking


---

### 2. `twins`
AI Twin instances owned by users.

**Schema:**
```sql
CREATE TABLE twins (
    id TEXT PRIMARY KEY,                    -- UUID as string
    user_id TEXT NOT NULL,                  -- Foreign key to users (indexed)
    name TEXT NOT NULL,                     -- Twin name (e.g., "Sarah's AI Assistant")
    description TEXT,                       -- Optional description
    is_shared BOOLEAN DEFAULT FALSE,        -- Can others access this twin? (indexed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_twins_user_id ON twins(user_id);
CREATE INDEX idx_twins_is_shared ON twins(is_shared);
```

**Purpose:**
- Each user can own multiple Twins
- `is_shared=true` allows other users to interact with the Twin
- Track Twin creation for installation metrics



---

### 3. `sessions`
Slack conversation threads with AI Twins (the core entity).

**Schema:**
```sql
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,                    -- UUID as string
    user_id TEXT NOT NULL,                  -- User having the conversation (indexed)
    twin_id TEXT NOT NULL,                  -- Twin being used (indexed)
    platform TEXT DEFAULT 'slack',          -- Always 'slack' (extensible)
    title TEXT,                             -- Conversation title
    topic TEXT,                             -- Conversation topic
    is_shared_twin BOOLEAN DEFAULT FALSE,   -- Using someone else's twin? (indexed)
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When conversation started (indexed)
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (twin_id) REFERENCES twins(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_twin_id ON sessions(twin_id);
CREATE INDEX idx_sessions_is_shared_twin ON sessions(is_shared_twin);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
```

**Purpose:**
- Represents a Slack conversation thread
- Links user to the Twin they're interacting with
- Core entity for all activity tracking


### 4. `messages`
Individual messages within sessions (user ↔ twin exchanges).

**Schema:**
```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,                    -- UUID as string
    session_id TEXT NOT NULL,               -- Foreign key to sessions (indexed)
    sender_type TEXT NOT NULL,              -- 'user' or 'twin'
    content TEXT NOT NULL,                  -- Message content
    message_type TEXT DEFAULT 'general',    -- 'general', 'document', 'query' (indexed)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_message_type ON messages(message_type);
```

**Purpose:**
- Store all messages in a conversation (both user and AI Twin messages)
- `message_type` helps efficiently identify messages that triggered actions
  - `'document'`: Message that triggered document creation
  - `'query'`: Message that triggered information retrieval
  - `'general'`: Regular conversation message
- Each session has multiple messages (conversation history)



---

### 5. `documents`
Documents drafted by the AI Twin during conversations.

**Schema:**
```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,                    -- UUID as string
    session_id TEXT NOT NULL,               -- Foreign key to sessions (indexed)
    message_id TEXT,                        -- Message that triggered document creation (indexed)
    document_type TEXT,                     -- 'email', 'report', 'proposal', 'summary'
    title TEXT,                             -- Document title
    content TEXT NOT NULL,                  -- Document content
    word_count INTEGER,                     -- Calculated word count
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_session_id ON documents(session_id);
CREATE INDEX idx_documents_message_id ON documents(message_id);
```

**Purpose:**
- Track documents created during conversations
- Link back to the message that requested the document
- Store full document content and metadata
- Used for "Documents Drafted" metrics


---

### 6. `queries`
Information retrieval queries executed during conversations.

**Schema:**
```sql
CREATE TABLE queries (
    id TEXT PRIMARY KEY,                    -- UUID as string
    session_id TEXT NOT NULL,               -- Foreign key to sessions (indexed)
    message_id TEXT,                        -- Message that triggered query (indexed)
    query_text TEXT NOT NULL,               -- The query/question
    query_type TEXT,                        -- 'email_search', 'document_search', 'general'
    results_count INTEGER DEFAULT 0,        -- Number of results found
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
);

CREATE INDEX idx_queries_session_id ON queries(session_id);
CREATE INDEX idx_queries_message_id ON queries(message_id);
```

**Purpose:**
- Track information retrieval requests
- Link back to the message that asked the question
- Count results found (for analytics)
- Used for "Information Retrieved" metrics

---

## Relationships Diagram

```
User ──owns──> Twin (one-to-many)
 │              │
 │              │
 └────┬─────────┘
      │
      v
   Session (Slack conversation)
      │
      ├─has many─> Message (user/twin exchanges)
      │              │
      │              ├─triggers─> Document (when message_type='document')
      │              │
      │              └─triggers─> Query (when message_type='query')
      │
      ├─creates──> Document (multiple documents per session)
      │
      └─executes─> Query (multiple queries per session)
```

**Key Relationships:**
- User has many Twins (ownership)
- User creates many Sessions (conversations)
- Twin is used in many Sessions
- Session has many Messages (conversation history)
- Session can create many Documents
- Session can execute many Queries
- Message optionally triggers Document (one-to-one)
- Message optionally triggers Query (one-to-one)

---

## Key Indexes

### Performance-Critical Indexes
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_login ON users(last_login_at);

-- Session queries (most common)
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_twin_id ON sessions(twin_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);  -- For date range filtering
CREATE INDEX idx_sessions_is_shared_twin ON sessions(is_shared_twin);

-- Message lookups
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_message_type ON messages(message_type);  -- For efficient filtering

-- Document and query lookups
CREATE INDEX idx_documents_session_id ON documents(session_id);
CREATE INDEX idx_documents_message_id ON documents(message_id);
CREATE INDEX idx_queries_session_id ON queries(session_id);
CREATE INDEX idx_queries_message_id ON queries(message_id);

-- Twin lookups
CREATE INDEX idx_twins_user_id ON twins(user_id);
CREATE INDEX idx_twins_is_shared ON twins(is_shared);
```

## Data Generation

The `scripts/generate_data.py` script creates realistic sample data:

```bash
uv run python scripts/generate_data.py
```

**What it creates:**
- 12 users across 4 companies
- 8-10 twins (some shared, some private)
- 60 days of sessions (2-5 per user per day)
- 3-8 messages per session
- Documents (30% of sessions)
- Queries (50% of sessions)

**Customization:**
Edit `generate_data.py` to adjust:
- Number of users (`count=12`)
- Date range (`days=60`)
- Activity frequency (sessions per user)
- Message count per session
