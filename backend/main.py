from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI

app = FastAPI()

from app.api.endpoints import ai

app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
