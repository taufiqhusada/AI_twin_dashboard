"""
API v1 router aggregation.
Combines all v1 endpoints under a single router.
"""
from fastapi import APIRouter
from app.api.v1 import metrics, charts, retention, activities

# Create main v1 router
router = APIRouter()

# Include all sub-routers
router.include_router(metrics.router, tags=["metrics"])
router.include_router(charts.router, prefix="/charts", tags=["charts"])
router.include_router(retention.router, tags=["retention"])
router.include_router(activities.router, tags=["activities"])
