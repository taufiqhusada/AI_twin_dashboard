"""
Sample data generation for the AI Twin Analytics Dashboard.
Realistic conversation-based schema.

Schema:
- Users own Twins
- Sessions are Slack conversation threads with a topic
- Each session has MANY messages
- Documents and queries are created DURING sessions (linked to specific messages)
- is_shared_twin flag indicates if using someone else's twin
"""
from faker import Faker
from datetime import datetime, timedelta
import random
from app.core.database import SessionLocal, engine, Base
from app.models import (
    User, Twin, Session,
    Message, Document, Query
)

fake = Faker()


def generate_sample_data():
    """Generate realistic sample data"""
    print("🚀 Starting data generation (v4 - conversation-based schema)...")
    
    # Create database tables
    print("📊 Creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        print("👥 Creating users...")
        users = create_users(db, count=12)
        
        print("🤖 Creating twins...")
        twins = create_twins(db, users)
        
        print("📅 Creating sessions with conversations (last 60 days)...")
        create_sessions(db, users, twins, days=60)
        
        # Print summary
        print("\n✅ Sample data generation complete!")
        print(f"   - {len(users)} users")
        print(f"   - {db.query(Twin).count()} twins")
        print(f"   - {db.query(Session).count()} sessions")
        print(f"   - {db.query(Message).count()} messages")
        print(f"   - {db.query(Document).count()} documents (created during conversations)")
        print(f"   - {db.query(Query).count()} queries (made during conversations)")
        
    except Exception as e:
        print(f"❌ Error generating data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()


def create_users(db, count=12):
    """Create users"""
    users = []
    companies = ['Acme Corp', 'Tech Innovations', 'Global Solutions', 'Digital Dynamics']
    departments = ['Engineering', 'Product', 'Marketing', 'Sales', 'Operations']
    
    for i in range(count):
        user = User(
            email=f"{fake.first_name().lower()}.{fake.last_name().lower()}@company.com",
            full_name=fake.name(),
            company=random.choice(companies),
            department=random.choice(departments),
            created_at=fake.date_time_between(start_date='-180d', end_date='-90d'),
            last_login_at=None  # Will be set when sessions are created
        )
        users.append(user)
        db.add(user)
    
    db.commit()
    for user in users:
        db.refresh(user)
    
    return users


def create_twins(db, users):
    """Create 1-2 twins for most users"""
    twins = []
    twin_names = [
        "AI Assistant", "Work Twin", "Personal AI", "Smart Helper",
        "Knowledge Bot", "Research Helper", "Meeting Twin", "Email Twin"
    ]
    
    # First 8 users get twins
    for i, user in enumerate(users[:8]):
        num_twins = 1 if i % 2 == 0 else 2
        for j in range(num_twins):
            if len(twins) < len(twin_names):
                twin = Twin(
                    user_id=user.id,
                    name=f"{user.full_name.split()[0]}'s {twin_names[len(twins)]}",
                    description=f"AI Twin for {user.full_name}",
                    is_shared=random.choice([True, True, False]),  # 67% shared
                    created_at=fake.date_time_between(start_date=user.created_at, end_date='-60d')
                )
                twins.append(twin)
                db.add(twin)
    
    db.commit()
    for twin in twins:
        db.refresh(twin)
    
    return twins


def create_sessions(db, users, twins, days=60):
    """Create sessions (Slack conversation threads) for the last N days"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    for day_offset in range(days):
        current_date = start_date + timedelta(days=day_offset)
        
        # Higher activity on weekdays
        is_weekday = current_date.weekday() < 5
        num_active_users = random.randint(7, 10) if is_weekday else random.randint(3, 6)
        
        # Select random active users
        active_users = random.sample(users, min(num_active_users, len(users)))
        
        for user in active_users:
            # 2-5 conversation threads per active user per day
            num_sessions = random.randint(2, 5) if is_weekday else random.randint(1, 3)
            
            for _ in range(num_sessions):
                # Pick a twin (prefer user's own, sometimes shared)
                user_twins = [t for t in twins if t.user_id == user.id]
                if user_twins and random.random() < 0.8:  # 80% own twin
                    twin = random.choice(user_twins)
                    is_shared = False
                else:  # 20% shared twin
                    shared_twins = [t for t in twins if t.is_shared and t.user_id != user.id]
                    twin = random.choice(shared_twins) if shared_twins else random.choice(twins)
                    is_shared = (twin.user_id != user.id)
                
                # Create session
                session_start = current_date.replace(
                    hour=random.randint(8, 18),
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59)
                )
                
                topics = [
                    'Q4 planning strategy', 'project status update', 'client meeting prep',
                    'team schedule', 'budget discussion', 'product roadmap',
                    'performance review', 'marketing campaign', 'quarterly goals'
                ]
                topic = random.choice(topics)
                
                session = Session(
                    user_id=user.id,
                    twin_id=twin.id,
                    title=f"Discussion about {topic}",
                    topic=topic,
                    is_shared_twin=is_shared,
                    started_at=session_start
                )
                db.add(session)
                db.flush()
                
                # Create messages for the session
                create_messages_for_session(db, session, topic)
    
    db.commit()
    
    # Update users' last_login_at to their most recent session
    print("📊 Updating user login timestamps...")
    for user in users:
        latest_session = db.query(Session).filter(
            Session.user_id == user.id
        ).order_by(Session.started_at.desc()).first()
        
        if latest_session:
            user.last_login_at = latest_session.started_at
    
    db.commit()


def create_messages_for_session(db, session, topic):
    """Create messages for a session, and randomly create documents/queries during it"""
    # Create 4-12 messages in the session
    num_messages = random.randint(4, 12)
    messages = []
    
    for i in range(num_messages):
        is_user = (i % 2 == 0)
        message_time = session.started_at + timedelta(seconds=i * 30)
        
        if is_user:
            if i == 0:
                content = f"Hey, can you help me with {topic}?"
            else:
                actions = [
                    "What information do we have on this?",
                    "Can you provide more details?",
                    "Can you draft a document about this?",
                    "Find me relevant emails about this topic",
                    "Search for documents related to this",
                    "What are the next steps?",
                    "Can you revise that document?",
                    "Thanks, that's helpful!"
                ]
                content = random.choice(actions)
        else:
            responses = [
                f"I found information about {topic}. Here's what I found...",
                "Based on your previous communications, here are the key details...",
                "I've analyzed your recent activity and can provide these insights...",
                "I'll draft that document for you right away.",
                "I found 5 relevant emails. Let me summarize them...",
                "Here are the documents I found in your knowledge base...",
                "I've created the document. Would you like me to revise anything?",
                "You're welcome! Let me know if you need anything else."
            ]
            content = random.choice(responses)
        
        # Create message first with general type
        message = Message(
            session_id=session.id,
            sender_type='user' if is_user else 'twin',
            content=content,
            message_type='general',
            created_at=message_time
        )
        db.add(message)
        db.flush()  # Get the message ID
        messages.append(message)
        
        # Track what gets created for this message
        has_document = False
        has_query = False
        
        # Randomly create documents or queries based on message content
        if not is_user:  # Twin responses can trigger document/query creation
            if 'draft' in content.lower() or 'document' in content.lower() or 'created' in content.lower():
                if random.random() < 0.7:  # 70% chance to actually create document
                    create_document_from_message(db, session, message, topic)
                    db.flush()  # Ensure document is created
                    has_document = True
            
            if 'found' in content.lower() or 'search' in content.lower() or 'emails' in content.lower():
                if random.random() < 0.6:  # 60% chance to create query record
                    create_query_from_message(db, session, message, topic)
                    db.flush()  # Ensure query is created
                    has_query = True
        
        # Update message type based on what was actually created
        if has_document and has_query:
            message.message_type = 'document,query'
        elif has_document:
            message.message_type = 'document'
        elif has_query:
            message.message_type = 'query'
        # else stays 'general'


def create_document_from_message(db, session, message, topic):
    """Create a document that was generated during a conversation"""
    doc_types = ['email', 'report', 'proposal', 'summary', 'presentation']
    word_count = random.randint(100, 800)
    
    titles = [
        f"{topic.title()} Report",
        f"Summary: {topic}",
        f"{topic.title()} Proposal",
        f"Email Draft: {topic}",
        f"{topic.title()} Analysis"
    ]
    
    document = Document(
        session_id=session.id,
        message_id=message.id,
        document_type=random.choice(doc_types),
        title=random.choice(titles),
        word_count=word_count,
        created_at=message.created_at
    )
    db.add(document)


def create_query_from_message(db, session, message, topic):
    """Create a query that was performed during a conversation"""
    query_types = ['email_search', 'document_search', 'general']
    
    queries = [
        f"emails about {topic}",
        f"documents related to {topic}",
        f"previous discussions on {topic}",
        f"{topic} information",
        f"search {topic}"
    ]
    
    query = Query(
        session_id=session.id,
        message_id=message.id,
        query_text=random.choice(queries),
        query_type=random.choice(query_types),
        results_count=random.randint(3, 12),
        created_at=message.created_at
    )
    db.add(query)


if __name__ == "__main__":
    generate_sample_data()
