from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from database.database import engine, Base
from routers import meetings
from seed import seed_db

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed on startup if database is empty
    seed_db(force=False)
    yield

app = FastAPI(title="SyncMeet API", version="1.0.0", lifespan=lifespan)

# CORS middleware for frontend communication
origins = [
    "http://localhost:3000",
    # Add production frontend URL here when deploying
]

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
