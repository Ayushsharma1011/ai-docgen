import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List, Union
import io

from routers import word, pdf, pptx, excel, converter

app = FastAPI(
    title="DocGenius AI - Document Generation Service",
    description="Python microservice for generating Word, PDF, PowerPoint, and Excel files",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(word.router, prefix="/generate")
app.include_router(pdf.router, prefix="/generate")
app.include_router(pptx.router, prefix="/generate")
app.include_router(excel.router, prefix="/generate")
app.include_router(converter.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "DocGenius Document Generator"}


@app.get("/")
async def root():
    return {
        "service": "DocGenius AI Document Generation Service",
        "endpoints": [
            "POST /generate/docx",
            "POST /generate/pdf",
            "POST /generate/pptx",
            "POST /generate/xlsx",
            "POST /convert",
        ],
    }
