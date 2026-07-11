from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database.database import engine, Base
from routers import meetings
from seed import seed_db

# Create database tables (wrapped in try-except for multi-worker safety)
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed on startup if database is empty
    try:
        seed_db(force=False)
    except Exception:
        pass
    yield

app = FastAPI(title="SyncMeet API", version="1.0.0", lifespan=lifespan)

# CORS middleware for frontend communication
origins = [
    "http://localhost:3000",
]

# Add production frontend URL from environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to SyncMeet API"}
