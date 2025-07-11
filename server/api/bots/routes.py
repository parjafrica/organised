from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_bots_status():
    return {"message": "Bots API routes are working!"}
