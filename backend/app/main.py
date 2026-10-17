"""AlgoScope Backend Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AlgoScope API",
    description="Backend API and DSA Execution Engine for AlgoScope",
    version="0.1.0",
)

# Configure CORS for local development with Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Health check endpoint to verify backend operational status."""
    return {"status": "ok", "app": "AlgoScope API"}
