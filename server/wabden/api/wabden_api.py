from fastapi import FastAPI

app = FastAPI(title="Wabden API", version="0.1.0")

class WabdenApi:
    def __init__(self):
        pass

@app.get("/")
async def root():
    return {"message": "Wabden API operational"}
