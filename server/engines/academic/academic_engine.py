from fastapi import FastAPI

app = FastAPI(title="Academic Engine", version="0.1.0")

class AcademicEngine:
    def __init__(self):
        pass

@app.get("/")
async def root():
    return {"message": "Academic Engine operational"}
