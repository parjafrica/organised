from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_admin_status():
    return {"message": "Admin API routes are working!"}
