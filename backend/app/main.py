import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health, sessions, problems, submissions, hints
from app.services.database import db

# Load environment variables
load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# FRONTEND_URL can be a single origin or a comma-separated list, e.g.
# "https://your-app.netlify.app,https://yourdomain.com"
_configured_origins = [o.strip() for o in FRONTEND_URL.split(",") if o.strip()]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan handler: attempt database problem seeding on startup.
    """
    db.seed_problems_in_supabase()
    yield


app = FastAPI(
    title="University Programming Skill Assessment API",
    description="Backend API for university programming tests, candidate session management, problem retrieval, and secure evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
origins = list({
    *_configured_origins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Also allow any Netlify deploy-preview/branch subdomain of your site
    # (e.g. https://deploy-preview-12--your-app.netlify.app), in addition
    # to the exact production origins listed above.
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(sessions.router)
app.include_router(problems.router)
app.include_router(submissions.router)
app.include_router(hints.router)


@app.get("/")
def read_root():
    return {
        "message": "University Programming Assessment Platform API",
        "docs": "/docs",
        "health": "/api/health",
    }
