"""
Migration script to add message_type column to messages table.
Populates the field based on existing documents and queries tables.
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import SessionLocal, engine
from app.models import Message, Document, Query
from sqlalchemy import text

def add_message_type_column():
    """Add message_type column and populate it"""
    db = SessionLocal()
    
    try:
        print("Checking if message_type column exists...")
        
        # Try to add the column, skip if it already exists
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE messages ADD COLUMN message_type VARCHAR(20) DEFAULT 'general'"))
                conn.commit()
            print("Column added successfully!")
        except Exception as e:
            if "duplicate column" in str(e).lower():
                print("Column already exists, skipping creation...")
            else:
                raise
        
        # Now populate the message_type based on documents and queries
        print("\nPopulating message_type values...")
        
        # Get all messages with documents
        documents = db.query(Document).filter(Document.message_id.isnot(None)).all()
        document_message_ids = set(doc.message_id for doc in documents)
        
        print(f"Found {len(document_message_ids)} messages with documents")
        
        # Get all messages with queries
        queries = db.query(Query).filter(Query.message_id.isnot(None)).all()
        query_message_ids = set(q.message_id for q in queries)
        
        print(f"Found {len(query_message_ids)} messages with queries")
        
        # Update messages that have both
        both_count = 0
        for msg_id in document_message_ids.intersection(query_message_ids):
            message = db.query(Message).filter(Message.id == msg_id).first()
            if message:
                message.message_type = 'document,query'
                both_count += 1
        
        print(f"Found {both_count} messages with both documents and queries")
        
        # Update messages that have only documents
        doc_only_ids = document_message_ids - query_message_ids
        for msg_id in doc_only_ids:
            message = db.query(Message).filter(Message.id == msg_id).first()
            if message:
                message.message_type = 'document'
        
        print(f"Updated {len(doc_only_ids)} messages to type 'document'")
        
        # Update messages that have only queries
        query_only_ids = query_message_ids - document_message_ids
        for msg_id in query_only_ids:
            message = db.query(Message).filter(Message.id == msg_id).first()
            if message:
                message.message_type = 'query'
        
        print(f"Updated {len(query_only_ids)} messages to type 'query'")
        
        db.commit()
        
        # Create index
        print("\nCreating index on message_type...")
        with engine.connect() as conn:
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type)"))
            conn.commit()
        
        print("Index created successfully!")
        
        # Show statistics
        print("\n=== Final Statistics ===")
        general_count = db.query(Message).filter(Message.message_type == 'general').count()
        doc_count = db.query(Message).filter(Message.message_type == 'document').count()
        query_count = db.query(Message).filter(Message.message_type == 'query').count()
        both = db.query(Message).filter(Message.message_type == 'document,query').count()
        
        print(f"General messages: {general_count}")
        print(f"Document messages: {doc_count}")
        print(f"Query messages: {query_count}")
        print(f"Both (doc+query): {both}")
        print(f"Total messages: {general_count + doc_count + query_count + both}")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_message_type_column()
