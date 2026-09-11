"""
main.py

FastAPI application for Data Dock.

Request flow
~~~~~~~~~~~~~

Next.js  →  POST /query  →  run_query()
                              │
                              ├─ database.get_connection()  →  psycopg  →  PostgreSQL
                              │
                              ├─ SELECT  →  return columns + rows + executionTime
                              ├─ DDL/DML →  commit()  →  return message + executionTime
                              └─ error   →  rollback() →  return error (clean message)
"""

import time
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.database import (
    cleanup_expired_sessions,
    ensure_session_table,
    find_session,
    get_session_connection,
    provision_session,
)
from app.sessions import create_new_session, get_or_create_session


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

async def _cleanup_loop() -> None:
    while True:
        await asyncio.sleep(60)
        await asyncio.to_thread(cleanup_expired_sessions)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await asyncio.to_thread(ensure_session_table)
    await asyncio.to_thread(cleanup_expired_sessions)
    task = asyncio.create_task(_cleanup_loop())
    try:
        yield
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)


app = FastAPI(title="Data Dock API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class QueryRequest(BaseModel):
    sql: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health")
def health_check():
    """Quick liveness check — useful in Swagger and for Docker health checks."""
    return {"health": "ok"}


@app.post("/session")
def new_session(response: Response):
    """Create a new isolated session and replace the session cookie."""
    session = create_new_session(response)
    provision_session(session)
    return {"status": "ok", "expiresAt": session.expires_at.isoformat()}


@app.get("/session")
def current_session(request: Request, response: Response):
    """Return the fixed expiration for the current browser session."""
    candidate = get_or_create_session(request, response)
    session = find_session(candidate.session_id)
    if session is None or session.expires_at <= datetime.now(timezone.utc):
        cleanup_expired_sessions()
        session = create_new_session(response)
        provision_session(session)
    return {"expiresAt": session.expires_at.isoformat()}


@app.post("/query")
def run_query(request: QueryRequest, http_request: Request, response: Response):
    """
    Execute a SQL statement and return the result.

    Successful SELECT response
    ---------------------------
    {
        "columns": ["id", "name", ...],
        "rows": [[1, "Alice"], ...],
        "executionTime": 4
    }

    Successful DDL / DML response
    ------------------------------
    {
        "message": "Query executed successfully",
        "executionTime": 2
    }

    Error response
    --------------
    {
        "error": "column \"nme\" does not exist"
    }
    """

    # -----------------------------------------------------------------------
    # Empty query validation
    # -----------------------------------------------------------------------

    if not request.sql.strip():
        return {
            "error": "Query cannot be empty."
        }

    # -----------------------------------------------------------------------
    # Database connection
    # -----------------------------------------------------------------------

    candidate = get_or_create_session(http_request, response)
    session = find_session(candidate.session_id)
    if session is None or session.expires_at <= datetime.now(timezone.utc):
        cleanup_expired_sessions()
        session = create_new_session(response)
        provision_session(session)
    conn = get_session_connection(session)
    cur = conn.cursor()

    try:

        # -------------------------------------------------------------------
        # Start the clock immediately before SQL execution
        # -------------------------------------------------------------------

        start_ns = time.perf_counter_ns()

        cur.execute(request.sql)

        elapsed_ms = (
            time.perf_counter_ns() - start_ns
        ) // 1_000_000

        # -------------------------------------------------------------------
        # SELECT (or any query that returns rows)
        # -------------------------------------------------------------------

        if cur.description:
            columns = [col.name for col in cur.description]
            rows = [list(row) for row in cur.fetchall()]

            return {
                "columns": columns,
                "rows": rows,
                "executionTime": elapsed_ms,
            }

        # -------------------------------------------------------------------
        # DDL / DML
        # CREATE, INSERT, UPDATE, DELETE, DROP, etc.
        # -------------------------------------------------------------------

        conn.commit()

        return {
            "message": "Query executed successfully",
            "executionTime": elapsed_ms,
        }

    # -----------------------------------------------------------------------
    # Database / SQL errors
    # -----------------------------------------------------------------------

    except Exception as exc:
        conn.rollback()

        # Extract only the first line of the PostgreSQL error.
        raw = str(exc).strip()
        clean = raw.split("\n")[0].strip()

        return {
            "error": clean or "An unexpected database error occurred."
        }

    # -----------------------------------------------------------------------
    # Always close database resources
    # -----------------------------------------------------------------------

    finally:
        cur.close()
        conn.close()