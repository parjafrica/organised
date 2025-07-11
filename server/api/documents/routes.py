from fastapi import APIRouter

router = APIRouter()

@router.get("/status")
async def get_documents_status():
    return {"message": "Documents API routes are working!"}
