from fastapi import FastAPI

app = FastAPI(title="Personalization Engine", version="0.1.0")

class PersonalizationEngine:
    def __init__(self):
        pass

@app.get("/")
async def root():
    return {"message": "Personalization Engine operational"}
