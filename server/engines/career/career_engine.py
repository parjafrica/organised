from fastapi import FastAPI

app = FastAPI(title="Career Engine", version="0.1.0")

class CareerEngine:
    def __init__(self):
        pass

@app.get("/")
async def root():
    return {"message": "Career Engine operational"}
