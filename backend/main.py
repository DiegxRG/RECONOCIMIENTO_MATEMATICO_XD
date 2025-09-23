from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.database import init_db
from .routes import models, training, detection
import uvicorn

app = FastAPI(title="Sign Recognition API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()

app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(training.router, prefix="/api/training", tags=["training"])
app.include_router(detection.router, prefix="/api/detection", tags=["detection"])

@app.get("/")
async def root():
    return {"message": "Sign Recognition API is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
