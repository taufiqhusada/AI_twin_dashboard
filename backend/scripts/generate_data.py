"""
Sample data generation for the AI Twin Analytics Dashboard.
Creates realistic data that matches the frontend expectations.
"""
from faker import Faker
from datetime import datetime, timedelta, date
import random
import json
from app.core.database import SessionLocal, engine, Base
from app.models import (
    User, Twin, TwinInstallation, Session, Activity,
    Conversation, Message, Document, Query, SharedTwinInteraction,
    DailyMetric, UserRetention, FeatureUsage
)

fake = Faker()


def generate_sample_data():
    """Generate realistic sample data for the dashboard"""
    print("🚀 Starting data generation...")
    
    # Create database tables
    print("📊 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).count() > 0:
            print("⚠️  Data already exists. Skipping generation.")
            return
        
        print("👥 Creating users...")
        users = create_users(db)
        
        print("🤖 Creating twins...")
        twins = create_twins(db, users)
        
        print("📱 Creating twin installations...")
        create_twin_installations(db, twins)
        
        print("📅 Creating sessions and activities (last 90 days)...")
        activities_data = create_sessions_and_activities(db, users, twins)
        
        print("💬 Creating conversations and messages...")
        create_conversations(db, activities_data['conversation'])
        
        print("📄 Creating documents...")
        create_documents(db, activities_data['document'])
        
        print("🔍 Creating queries...")
        create_queries(db, activities_data['query'])
        
        print("🤝 Creating shared twin interactions...")
        create_shared_interactions(db, activities_data['shared'])
        
        print("📊 Calculating daily metrics...")
        calculate_daily_metrics(db)
        
        print("🎯 Calculating user retention...")
        calculate_user_retention(db, users)
        
        print("✨ Calculating feature usage...")
        calculate_feature_usage(db)
        
        print("\n✅ Sample data generation complete!")
        print(f"   - {len(users)} users")
        print(f"   - {len(twins)} twins")
        print(f"   - {db.query(Session).count()} sessions")
        print(f"   - {db.query(Activity).count()} activities")
        print(f"   - {db.query(Message).count()} messages")
        print(f"   - {db.query(Document).count()} documents")
        
    except Exception as e:
        print(f"❌ Error generating data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_users(db):
    """Create 12 users"""
    users = []
    companies = ['Acme Corp', 'Tech Innovations', 'Global Solutions']
    departments = ['Engineering', 'Product', 'Marketing', 'Sales', 'Operations']
    
    for i in range(12):
        user = User(
            email=f"{fake.first_name().lower()}.{fake.last_name().lower()}@company.com",
            full_name=fake.name(),
            company=random.choice(companies),
            department=random.choice(departments),
            created_at=fake.date_time_between(start_date='-180d', end_date='-90d'),
            is_active=True
        )
        users.append(user)
        db.add(user)
    
    db.commit()
    # Refresh to get IDs
    for user in users:
        db.refresh(user)
    
    return users


def create_twins(db, users):
    """Create 1-2 twins for first 8 users"""
    twins = []
    twin_names = [
        "AI Assistant", "Work Twin", "Personal AI", "Smart Helper",
        "Data Twin", "Info Bot", "Doc Generator", "Team Assistant",
        "Research Helper", "Meeting Twin", "Email Twin", "Knowledge Bot"
    ]
    
    for i, user in enumerate(users[:8]):
        num_twins = 1 if i % 2 == 0 else 2
        for j in range(num_twins):
            twin = Twin(
                user_id=user.id,
                name=f"{user.full_name}'s {twin_names[len(twins)]}",
                description=f"AI Twin for {user.full_name}",
                is_shared=random.choice([True, True, False]),  # 67% shared
                created_at=fake.date_time_between(start_date='-150d', end_date='-60d'),
                document_count=random.randint(50, 300),
                email_count=random.randint(500, 2000)
            )
            twins.append(twin)
            db.add(twin)
    
    db.commit()
    for twin in twins:
        db.refresh(twin)
    
    return twins


def create_twin_installations(db, twins):
    """Create twin installations"""
    platforms = ['slack', 'web', 'teams']
    
    for twin in twins:
        platform = random.choice(platforms)
        installation = TwinInstallation(
            twin_id=twin.id,
            platform=platform,
            workspace_id=f"W{random.randint(100000000, 999999999)}",
            workspace_name=f"{twin.owner.company} Workspace",
            installed_at=twin.created_at,
            is_active=True
        )
        db.add(installation)
    
    db.commit()


def create_sessions_and_activities(db, users, twins):
    """Create sessions and activities for the last 90 days"""
    start_date = datetime.now() - timedelta(days=90)
    platforms = ['slack', 'web', 'mobile']
    devices = ['desktop', 'mobile', 'tablet']
    
    activities_data = {
        'conversation': [],
        'document': [],
        'query': [],
        'shared': []
    }
    
    for day_offset in range(90):
        current_date = start_date + timedelta(days=day_offset)
        
        # Higher activity on weekdays
        is_weekday = current_date.weekday() < 5
        num_active_users = random.randint(8, 11) if is_weekday else random.randint(4, 7)
        
        # Select random active users
        active_users = random.sample(users, num_active_users)
        
        for user in active_users:
            # 1-3 sessions per active user per day
            num_sessions = random.randint(1, 3)
            
            for _ in range(num_sessions):
                # Create session
                session_start = current_date.replace(
                    hour=random.randint(8, 18),
                    minute=random.randint(0, 59)
                )
                session_duration = random.randint(120, 1800)  # 2-30 minutes
                session_end = session_start + timedelta(seconds=session_duration)
                
                # Pick a random twin (prefer user's own, but sometimes use shared)
                user_twins = [t for t in twins if t.user_id == user.id]
                if user_twins and random.random() < 0.8:  # 80% own twin
                    twin = random.choice(user_twins)
                else:  # 20% shared twin
                    shared_twins = [t for t in twins if t.is_shared and t.user_id != user.id]
                    twin = random.choice(shared_twins) if shared_twins else random.choice(twins)
                
                session = Session(
                    user_id=user.id,
                    twin_id=twin.id,
                    platform=random.choice(platforms),
                    device_type=random.choice(devices),
                    started_at=session_start,
                    ended_at=session_end,
                    duration_seconds=session_duration
                )
                db.add(session)
                db.flush()
                
                # Create 2-6 activities per session
                num_activities = random.randint(2, 6)
                activity_types = ['conversation', 'query', 'document', 'shared']
                weights = [0.4, 0.3, 0.15, 0.15]  # 40% conversations, 30% queries, 15% documents, 15% shared
                
                for i in range(num_activities):
                    activity_time = session_start + timedelta(
                        seconds=random.randint(0, session_duration)
                    )
                    activity_duration = random.randint(30, 300)
                    activity_type = random.choices(activity_types, weights=weights)[0]
                    
                    # Generate appropriate action description
                    action_desc = generate_action_description(activity_type, twin)
                    
                    activity = Activity(
                        user_id=user.id,
                        twin_id=twin.id,
                        session_id=session.id,
                        activity_type=activity_type,
                        action_description=action_desc,
                        started_at=activity_time,
                        ended_at=activity_time + timedelta(seconds=activity_duration),
                        duration_seconds=activity_duration,
                        platform=session.platform,
                        device_type=session.device_type
                    )
                    db.add(activity)
                    db.flush()
                    
                    # Track for detail creation
                    activities_data[activity_type].append({
                        'activity': activity,
                        'user': user,
                        'twin': twin,
                        'action_desc': action_desc
                    })
                
                session.interaction_count = num_activities
                
                # Update user's last active
                if not user.last_active_at or user.last_active_at < session_end:
                    user.last_active_at = session_end
    
    db.commit()
    return activities_data


def generate_action_description(activity_type, twin):
    """Generate realistic action descriptions"""
    if activity_type == 'conversation':
        topics = [
            'Q4 planning strategy', 'project status update', 'client meeting preparation',
            'team schedule coordination', 'budget allocation', 'product roadmap discussion',
            'performance review data', 'marketing campaign ideas'
        ]
        return f"Started conversation about {random.choice(topics)}"
    
    elif activity_type == 'document':
        doc_types = [
            'project proposal', 'meeting summary', 'status report', 'email draft',
            'presentation outline', 'technical specification', 'budget report', 'team update'
        ]
        return f"Drafted {random.choice(doc_types)} document"
    
    elif activity_type == 'query':
        queries = [
            'email history about client meeting', 'previous project documentation',
            'budget information from past emails', 'meeting notes from last month',
            'team availability data', 'expense reports', 'contract details', 'performance metrics'
        ]
        return f"Retrieved information from {random.choice(queries)}"
    
    else:  # shared
        actions = [
            "team schedule", "availability", "project updates", "meeting notes",
            "action items", "document review", "feedback", "status check"
        ]
        owner_name = twin.owner.full_name.split()[0]
        return f"Interacted with {owner_name}'s Twin about {random.choice(actions)}"


def create_conversations(db, conversation_activities):
    """Create conversation details"""
    for data in conversation_activities:
        activity = data['activity']
        
        message_count = random.randint(3, 12)
        
        conversation = Conversation(
            activity_id=activity.id,
            title=activity.action_description,
            topic=activity.action_description.split('about ')[-1] if 'about' in activity.action_description else "General",
            message_count=message_count,
            total_tokens=message_count * random.randint(50, 150),
            created_at=activity.started_at
        )
        db.add(conversation)
        db.flush()
        
        # Create messages
        for i in range(message_count):
            is_user = i % 2 == 0
            message = Message(
                conversation_id=conversation.id,
                sender_type='user' if is_user else 'twin',
                content=generate_message_content(is_user, i, conversation.topic),
                token_count=random.randint(20, 150),
                created_at=activity.started_at + timedelta(seconds=i * 30)
            )
            db.add(message)
    
    db.commit()


def generate_message_content(is_user, index, topic):
    """Generate realistic message content"""
    if is_user:
        if index == 0:
            return f"Can you help me with {topic}?"
        elif index < 4:
            return random.choice([
                "What information do we have on this?",
                "Can you summarize the key points?",
                "What are the next steps?",
                "Can you provide more details?"
            ])
        else:
            return random.choice(["Thanks, that's helpful!", "Perfect, thank you!"])
    else:
        if index == 1:
            return f"I found several relevant emails and documents about {topic}. Here's what I found..."
        else:
            return random.choice([
                "Based on your previous communications, here are the key details...",
                "I've analyzed your recent activity and can provide the following insights...",
                "The next steps would be to follow up with the team and schedule a meeting.",
                "You're welcome! Let me know if you need anything else."
            ])


def create_documents(db, document_activities):
    """Create document details"""
    doc_types = ['email', 'report', 'proposal', 'summary', 'presentation', 'specification']
    
    for data in document_activities:
        activity = data['activity']
        user = data['user']
        action = data['action_desc']
        
        # Extract document type from action
        doc_type = 'report'
        for dt in doc_types:
            if dt in action.lower():
                doc_type = dt
                break
        
        word_count = random.randint(100, 1000)
        
        document = Document(
            activity_id=activity.id,
            user_id=user.id,
            title=f"{action.split('Drafted ')[-1].title()} - {activity.started_at.strftime('%Y-%m-%d')}",
            document_type=doc_type,
            content=generate_document_content(doc_type),
            word_count=word_count,
            character_count=word_count * 6,
            created_at=activity.started_at,
            is_exported=random.choice([True, False])
        )
        db.add(document)
    
    db.commit()


def generate_document_content(doc_type):
    """Generate realistic document content"""
    templates = {
        'proposal': "Executive Summary\n\nThis proposal outlines the key objectives and milestones for the upcoming project...",
        'report': "Status Report\n\nCurrent Progress: On Track\n\nCompleted This Week:\n- Key milestone achieved\n- Team coordination improved",
        'email': "Hi team,\n\nI wanted to follow up on our recent discussion about the project timeline...",
        'summary': "Meeting Summary\n\nKey Discussion Points:\n1. Project updates\n2. Resource allocation\n3. Next steps"
    }
    return templates.get(doc_type, f"This is a {doc_type} document generated by the AI Twin.")


def create_queries(db, query_activities):
    """Create query details"""
    query_types = ['email_search', 'document_search', 'general']
    
    for data in query_activities:
        activity = data['activity']
        user = data['user']
        action = data['action_desc']
        
        query_text = action.split('Retrieved information from ')[-1]
        
        sources = [
            f"Email from {fake.name().lower().replace(' ', '.')}@company.com on {fake.date_this_month()}",
            f"Document: '{fake.catch_phrase()}.docx' modified {fake.date_this_month()}",
            f"Meeting notes from {fake.date_this_month()}"
        ]
        
        query = Query(
            activity_id=activity.id,
            user_id=user.id,
            query_text=f"Find {query_text}",
            query_type=random.choice(query_types),
            results_count=random.randint(3, 8),
            retrieved_info=f"I found {random.randint(3, 8)} relevant items related to '{query_text}'.",
            sources_json=json.dumps(random.sample(sources, min(3, len(sources)))),
            created_at=activity.started_at
        )
        db.add(query)
    
    db.commit()


def create_shared_interactions(db, shared_activities):
    """Create shared twin interaction details"""
    for data in shared_activities:
        activity = data['activity']
        user = data['user']
        twin = data['twin']
        
        interaction = SharedTwinInteraction(
            activity_id=activity.id,
            accessing_user_id=user.id,
            twin_owner_id=twin.user_id,
            twin_id=twin.id,
            interaction_purpose=activity.action_description.split('about ')[-1],
            interaction_summary=f"Asked about {activity.action_description.split('about ')[-1]} and received relevant information.",
            was_helpful=random.choice([True, True, True, False]),  # 75% helpful
            created_at=activity.started_at
        )
        db.add(interaction)
    
    db.commit()


def calculate_daily_metrics(db):
    """Calculate and store daily aggregated metrics"""
    start_date = datetime.now() - timedelta(days=90)
    
    for day_offset in range(91):  # Include today
        metric_date = (start_date + timedelta(days=day_offset)).date()
        day_start = datetime.combine(metric_date, datetime.min.time())
        day_end = datetime.combine(metric_date, datetime.max.time())
        
        # Count metrics for this day
        active_users = db.query(Session.user_id).filter(
            Session.started_at >= day_start,
            Session.started_at <= day_end
        ).distinct().count()
        
        new_users = db.query(User).filter(
            User.created_at >= day_start,
            User.created_at <= day_end
        ).count()
        
        sessions = db.query(Session).filter(
            Session.started_at >= day_start,
            Session.started_at <= day_end
        ).count()
        
        conversations = db.query(Activity).filter(
            Activity.activity_type == 'conversation',
            Activity.started_at >= day_start,
            Activity.started_at <= day_end
        ).count()
        
        messages = db.query(Message).join(Conversation).join(Activity).filter(
            Activity.started_at >= day_start,
            Activity.started_at <= day_end
        ).count()
        
        documents = db.query(Document).filter(
            Document.created_at >= day_start,
            Document.created_at <= day_end
        ).count()
        
        queries = db.query(Query).filter(
            Query.created_at >= day_start,
            Query.created_at <= day_end
        ).count()
        
        shared = db.query(SharedTwinInteraction).filter(
            SharedTwinInteraction.created_at >= day_start,
            SharedTwinInteraction.created_at <= day_end
        ).count()
        
        # Calculate average session duration
        avg_duration = db.query(Session.duration_seconds).filter(
            Session.started_at >= day_start,
            Session.started_at <= day_end,
            Session.duration_seconds.isnot(None)
        ).all()
        avg_session_duration = int(sum(d[0] for d in avg_duration) / len(avg_duration)) if avg_duration else 0
        
        metric = DailyMetric(
            metric_date=metric_date,
            total_active_users=active_users,
            new_users=new_users,
            total_sessions=sessions,
            total_conversations=conversations,
            total_messages=messages,
            total_documents_drafted=documents,
            total_queries=queries,
            total_shared_interactions=shared,
            avg_session_duration_seconds=avg_session_duration
        )
        db.add(metric)
    
    db.commit()


def calculate_user_retention(db, users):
    """Calculate user retention metrics"""
    for user in users:
        # Get user's first activity date
        first_activity = db.query(Activity).filter(
            Activity.user_id == user.id
        ).order_by(Activity.started_at).first()
        
        if not first_activity:
            continue
        
        cohort_date = first_activity.started_at.date()
        
        # Check if active on day 1, 7, 30
        day_1 = cohort_date + timedelta(days=1)
        day_7 = cohort_date + timedelta(days=7)
        day_30 = cohort_date + timedelta(days=30)
        
        def was_active_on_date(check_date):
            day_start = datetime.combine(check_date, datetime.min.time())
            day_end = datetime.combine(check_date, datetime.max.time())
            return db.query(Activity).filter(
                Activity.user_id == user.id,
                Activity.started_at >= day_start,
                Activity.started_at <= day_end
            ).count() > 0
        
        total_sessions = db.query(Session).filter(
            Session.user_id == user.id
        ).count()
        
        retention = UserRetention(
            user_id=user.id,
            cohort_date=cohort_date,
            day_1_active=was_active_on_date(day_1),
            day_7_active=was_active_on_date(day_7) if day_7 <= date.today() else False,
            day_30_active=was_active_on_date(day_30) if day_30 <= date.today() else False,
            total_sessions=total_sessions
        )
        db.add(retention)
    
    db.commit()


def calculate_feature_usage(db):
    """Calculate feature usage statistics"""
    start_date = datetime.now() - timedelta(days=90)
    
    for day_offset in range(91):
        usage_date = (start_date + timedelta(days=day_offset)).date()
        day_start = datetime.combine(usage_date, datetime.min.time())
        day_end = datetime.combine(usage_date, datetime.max.time())
        
        # Get all users active on this day
        active_users = db.query(Activity.user_id).filter(
            Activity.started_at >= day_start,
            Activity.started_at <= day_end
        ).distinct().all()
        
        for user_id_tuple in active_users:
            user_id = user_id_tuple[0]
            
            # Count each feature type
            features = {
                'question_asked': 'conversation',
                'info_retrieved': 'query',
                'document_drafted': 'document',
                'shared_interaction': 'shared'
            }
            
            for feature_name, activity_type in features.items():
                count = db.query(Activity).filter(
                    Activity.user_id == user_id,
                    Activity.activity_type == activity_type,
                    Activity.started_at >= day_start,
                    Activity.started_at <= day_end
                ).count()
                
                if count > 0:
                    feature_usage = FeatureUsage(
                        user_id=user_id,
                        feature_name=feature_name,
                        usage_date=usage_date,
                        usage_count=count,
                        last_used_at=day_end
                    )
                    db.add(feature_usage)
    
    db.commit()


if __name__ == "__main__":
    generate_sample_data()
