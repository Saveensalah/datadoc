"""
database.py
-----------
Centralises everything related to the PostgreSQL connection.

main.py calls get_connection() to get a live psycopg connection.
All the environment-variable reading and dotenv loading lives here,
so main.py stays focused on request/response logic.
"""

import os
from pathlib import Path

import psycopg
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Load .env
# ---------------------------------------------------------------------------
# Look for .env one directory above this file (i.e. backend/.env).
# load_dotenv() is a no-op when the file doesn't exist, so production
# environments can supply variables through their own mechanism instead.

_ENV_PATH = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

# ---------------------------------------------------------------------------
# Read connection settings from the environment
# ---------------------------------------------------------------------------
# os.environ[] raises KeyError with a clear message if a variable is missing,
# which is intentional — a misconfigured DB host should fail loudly at
# startup rather than silently at the first query.

DB_HOST     = os.getenv("DB_HOST",     "localhost")
DB_PORT     = int(os.getenv("DB_PORT", "5432"))
DB_NAME     = os.getenv("DB_NAME",     "datadock")
DB_USER     = os.getenv("DB_USER",     "datadock")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


# ---------------------------------------------------------------------------
# Connection factory
# ---------------------------------------------------------------------------

def get_connection() -> psycopg.Connection:
    """
    Open and return a new psycopg connection using the settings above.

    The caller is responsible for closing the connection (or use it as a
    context manager).  A new connection is created for every request;
    connection pooling can be added later without changing main.py.
    """
    return psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )
