"""
API dependencies and common utilities.
"""
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db

# Re-export for convenience
__all__ = ["get_db"]
