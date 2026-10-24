"""AlgoScope Backend Application Entry Point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.assessments import router as assessments_router
from app.api.progress import router as progress_router
from app.api.topics import router as topics_router
from app.core.database import Base, SessionLocal, engine
from app.db.seed_topics import seed_topics


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan context manager for startup and shutdown tasks."""
    target_engine = getattr(app.state, "engine", engine)
    session_factory = getattr(app.state, "session_factory", SessionLocal)

    # Ensure database schema is initialized
    Base.metadata.create_all(bind=target_engine)
    # Seed default topics idempotently
    with session_factory() as db:
        seed_topics(db)
    yield


app = FastAPI(
    title="AlgoScope API",
    description="Backend API and DSA Execution Engine for AlgoScope",
    version="0.1.0",
    lifespan=lifespan,
)

# Configure CORS for local development with Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics_router)
app.include_router(assessments_router)
app.include_router(progress_router)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Health check endpoint to verify backend operational status."""
    return {"status": "ok", "app": "AlgoScope API"}
