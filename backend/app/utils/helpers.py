"""
Utility helper functions for the application.
"""
from datetime import timedelta
from typing import Optional


def format_time_ago(time_diff: timedelta) -> str:
    """
    Format time difference as human-readable string.
    
    Args:
        time_diff: Time difference to format
        
    Returns:
        Formatted string like "5 min ago", "2h ago", "3d ago"
    """
    seconds = time_diff.total_seconds()
    
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} min ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours}h ago"
    else:
        days = int(seconds / 86400)
        return f"{days}d ago"


def format_duration(seconds: Optional[int]) -> str:
    """
    Format duration in seconds as human-readable string.
    
    Args:
        seconds: Duration in seconds
        
    Returns:
        Formatted string like "5m 30s"
    """
    if not seconds:
        return "0m 0s"
    
    minutes = seconds // 60
    secs = seconds % 60
    return f"{minutes}m {secs}s"
