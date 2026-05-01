from fastapi import APIRouter

from app.api.routes import activity, admin_users, auth, expenses, profile, summaries

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(expenses.router)
api_router.include_router(summaries.router)
api_router.include_router(activity.router)
api_router.include_router(admin_users.router)
api_router.include_router(profile.router)
