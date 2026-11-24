import os
from typing import Annotated, Literal

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import require_auth_header, session_account
from models import Account

router = APIRouter(prefix="/api/playground", tags=["playground"])

RUNTIMES = {
    "cpp": ("c++", "main.cpp"),
    "java": ("java", "Main.java"),
    "csharp": ("csharp.net", "Program.cs"),
}


class RunRequest(BaseModel):
    language: Literal["cpp", "java", "csharp"]
    code: str = Field(min_length=1, max_length=25_000)
    stdin: str = Field(default="", max_length=10_000)


class RunStage(BaseModel):
    stdout: str = ""
    stderr: str = ""
    code: int | None = None
    signal: str | None = None
    message: str | None = None


class RunResult(BaseModel):
    compile: RunStage | None = None
    run: RunStage | None = None


@router.post("/run", response_model=RunResult, dependencies=[Depends(require_auth_header)])
async def run_program(data: RunRequest, account: Annotated[Account | None, Depends(session_account)]):
    if account is None:
        raise HTTPException(401, "Sign in to run this program.")

    endpoint = os.getenv("PISTON_API_URL", "").strip().rstrip("/")
    if not endpoint:
        raise HTTPException(503, "The compiled-language runner is not connected. Download your code to run it locally.")

    language, filename = RUNTIMES[data.language]
    token = os.getenv("PISTON_API_TOKEN")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{endpoint}/execute",
                headers=headers,
                json={
                    "language": language,
                    "version": "*",
                    "files": [{"name": filename, "content": data.code}],
                    "stdin": data.stdin,
                    "compile_timeout": 10_000,
                    "run_timeout": 3_000,
                },
            )
        if response.status_code == 400:
            raise HTTPException(503, "This language runtime is unavailable on the configured runner.")
        response.raise_for_status()
        result = RunResult.model_validate(response.json())
        if result.compile is None and result.run is None:
            raise ValueError("Missing execution stages")
        return result
    except httpx.TimeoutException as error:
        raise HTTPException(504, "The runner timed out. Try a smaller program.") from error
    except (httpx.HTTPError, ValueError) as error:
        raise HTTPException(502, "Could not reach the compiled-language runner.") from error
