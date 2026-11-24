from datetime import datetime, timezone
import os
from typing import Literal

import httpx
from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Response,
)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

import models
from auth import router as auth_router
from database import Base, engine, get_db
from playground import router as playground_router


# --------------------------------------------------
# APPLICATION SETUP
# --------------------------------------------------

app = FastAPI(
    title="CodeBuddy AI API",
    description="Backend API for the CodeBuddy AI learning platform",
    version="1.0.0",
)

# Create database tables automatically.
Base.metadata.create_all(bind=engine)
app.include_router(auth_router)
app.include_router(playground_router)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
extra_origin = os.getenv("FRONTEND_ORIGIN")
if extra_origin:
    allowed_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


# --------------------------------------------------
# REQUEST AND RESPONSE MODELS
# --------------------------------------------------

class NoteRequest(BaseModel):
    title: str = Field(
        default="Untitled note",
        max_length=200,
    )
    content: str = Field(
        default="",
        max_length=50_000,
    )
    language: str = Field(
        default="General",
        max_length=50,
    )


class NoteUpdate(BaseModel):
    title: str = Field(max_length=200)
    content: str = Field(max_length=50_000)
    language: str = Field(max_length=50)


class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    language: str

    model_config = {"from_attributes": True}


# --------------------------------------------------
# HOME AND HEALTH CHECK
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to CodeBuddy AI API!",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CodeBuddy AI API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# --------------------------------------------------
# LESSONS API
# --------------------------------------------------

@app.get("/api/lessons")
def get_lessons():
    return {
        "lessons": [
            {
                "id": 1,
                "title": "Meet Python",
                "topic": "Introduction",
                "duration": "5 min",
                "xp": 10,
            },
            {
                "id": 2,
                "title": "Variables & Data",
                "topic": "Fundamentals",
                "duration": "8 min",
                "xp": 15,
            },
            {
                "id": 3,
                "title": "Print Your Ideas",
                "topic": "Output",
                "duration": "6 min",
                "xp": 10,
            },
            {
                "id": 4,
                "title": "Make Decisions",
                "topic": "Conditions",
                "duration": "10 min",
                "xp": 20,
            },
            {
                "id": 5,
                "title": "Loop the Loop",
                "topic": "Loops",
                "duration": "12 min",
                "xp": 20,
            },
            {
                "id": 6,
                "title": "Functions: Superpowers",
                "topic": "Functions",
                "duration": "12 min",
                "xp": 25,
            },
        ]
    }


# --------------------------------------------------
# NOTES API — READ ALL NOTES
# --------------------------------------------------

@app.get("/api/notes", response_model=list[NoteResponse])
def list_notes(db: Session = Depends(get_db)):
    notes = (
        db.query(models.Note)
        .order_by(models.Note.updated_at.desc())
        .all()
    )

    return notes


# --------------------------------------------------
# NOTES API — CREATE NOTE
# --------------------------------------------------

@app.post(
    "/api/notes",
    response_model=NoteResponse,
    status_code=201,
)
def create_note(
    note: NoteRequest,
    db: Session = Depends(get_db),
):
    new_note = models.Note(
        title=note.title,
        content=note.content,
        language=note.language,
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


# --------------------------------------------------
# NOTES API — UPDATE NOTE
# --------------------------------------------------

@app.put(
    "/api/notes/{note_id}",
    response_model=NoteResponse,
)
def update_note(
    note_id: int,
    note: NoteUpdate,
    db: Session = Depends(get_db),
):
    existing_note = db.get(models.Note, note_id)

    if existing_note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    existing_note.title = note.title
    existing_note.content = note.content
    existing_note.language = note.language

    db.commit()
    db.refresh(existing_note)

    return existing_note


# --------------------------------------------------
# NOTES API — DELETE NOTE
# --------------------------------------------------

@app.delete(
    "/api/notes/{note_id}",
    status_code=204,
)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
):
    existing_note = db.get(models.Note, note_id)

    if existing_note is None:
        raise HTTPException(
            status_code=404,
            detail="Note not found",
        )

    db.delete(existing_note)
    db.commit()

    return Response(status_code=204)


# --------------------------------------------------
# NOTES API — PREVIEW ONLY
# --------------------------------------------------

@app.post("/api/notes/preview")
def preview_note(note: NoteRequest):
    """
    Validate note data and return a preview.
    This endpoint does not save anything to the database.
    """
    return {
        "message": "Note received successfully",
        "title": note.title,
        "language": note.language,
        "content_length": len(note.content),
    }
# ==============================
# PANDA AI TUTOR
# ==============================

OLLAMA_URL = "http://127.0.0.1:11434"
OLLAMA_MODEL = "qwen2.5:3b"


class TutorRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    language: Literal["Python", "JavaScript", "C++", "Java", "C#"] | None = None


class TutorResponse(BaseModel):
    reply: str


@app.post("/api/tutor", response_model=TutorResponse)
async def ask_panda(request: TutorRequest):
    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    prompt = f"""
You are Panda, the friendly AI coding tutor in CodeBuddy AI.

Teach beginner programmers using simple English.

Rules:
- Explain concepts step by step.
- Use funny, relatable examples.
- Explain code line by line when requested.
- Provide correct code examples.
- Help students understand rather than memorize.
- Be patient, friendly, and encouraging.

Preferred language: {request.language or "Use the language requested by the student."}
Use the preferred language in examples unless the student asks for another.

Student's question:
{user_message}
"""

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "stream": False
                }
            )

        response.raise_for_status()

        data = response.json()
        reply = data.get("message", {}).get("content", "").strip()

        if not reply:
            raise HTTPException(
                status_code=502,
                detail="Panda returned an empty response."
            )

        return {"reply": reply}

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Panda took too long to respond. Please try again."
        )

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama returned HTTP {exc.response.status_code}."
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Ollama. Make sure Ollama is running."
        )
