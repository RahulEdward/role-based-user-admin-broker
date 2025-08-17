from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine
from models import Base
from routers import auth, users, admin, broker


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Stock Market Auth API",
    description="Role-based authentication system for stock market applications",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(broker.router, prefix="/api/broker", tags=["Broker"])


@app.get("/")
async def root():
    return {"message": "Stock Market Auth API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}