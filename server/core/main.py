"""
Granada OS FastAPI Backend
Main API server for funding opportunities platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from ..donors import routes as opportunities_routes
from .api.bots import routes as bots_routes
from ..proposals import routes as proposals_routes
from .api.documents import routes as documents_routes
from .api.admin import routes as admin_routes
from .api.agent import routes as agent_routes

app = FastAPI(
    title="Granada OS API",
    description="Funding opportunities platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Granada OS FastAPI Backend", "status": "running"}

app.include_router(opportunities_routes.router, prefix="/api")
app.include_router(bots_routes.router, prefix="/api")
app.include_router(proposals_routes.router, prefix="/api")
app.include_router(documents_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(agent_routes.router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
