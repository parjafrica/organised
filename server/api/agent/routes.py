from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_agent_status():
    return {"message": "Agent API routes are working!"}