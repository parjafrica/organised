from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_proposals_status():
    return {"message": "Proposals API routes are working!"}
