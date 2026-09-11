"""PostgreSQL connections and per-session role provisioning."""

import os
from datetime import datetime, timezone

import psycopg
from dotenv import load_dotenv
from psycopg import sql

from app.sessions import Session, _session_password

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "datadock")
DB_USER = os.getenv("DB_USER", "datadock")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")


def get_admin_connection() -> psycopg.Connection:
    """Connect with the server role used only to provision session roles."""
    return psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
    )


def ensure_session_table() -> None:
    with get_admin_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS public.datadock_sessions (
                    session_id TEXT PRIMARY KEY,
                    role_name NAME NOT NULL UNIQUE,
                    schema_name NAME NOT NULL UNIQUE,
                    expires_at TIMESTAMPTZ NOT NULL
                )
                """
            )
            cur.execute(
                "REVOKE ALL ON TABLE public.datadock_sessions FROM PUBLIC"
            )
            conn.commit()


def provision_session(session: Session) -> None:
    """Create or repair the restricted role and schema for a session."""
    with get_admin_connection() as conn:
        with conn.cursor() as cur:
            expires_at = session.expires_at
            if expires_at is None:
                raise RuntimeError("Session expiration is required.")
            cur.execute(
                "SELECT pg_advisory_xact_lock(hashtextextended(%s, 0))",
                (session.session_id,),
            )
            cur.execute(
                "SELECT 1 FROM pg_roles WHERE rolname = %s",
                (session.role_name,),
            )
            if cur.fetchone() is None:
                cur.execute(
                    sql.SQL("CREATE ROLE {} LOGIN PASSWORD {}").format(
                        sql.Identifier(session.role_name),
                        sql.Literal(session.role_password),
                    )
                )

            cur.execute(
                sql.SQL(
                    "ALTER ROLE {} LOGIN PASSWORD {} NOSUPERUSER NOCREATEDB "
                    "NOCREATEROLE NOINHERIT"
                ).format(
                    sql.Identifier(session.role_name),
                    sql.Literal(session.role_password),
                )
            )
            cur.execute(
                sql.SQL("CREATE SCHEMA IF NOT EXISTS {} AUTHORIZATION {}").format(
                    sql.Identifier(session.schema_name),
                    sql.Identifier(session.role_name),
                )
            )
            cur.execute(
                sql.SQL("REVOKE ALL ON SCHEMA {} FROM PUBLIC").format(
                    sql.Identifier(session.schema_name)
                )
            )
            cur.execute(
                sql.SQL("GRANT USAGE, CREATE ON SCHEMA {} TO {}").format(
                    sql.Identifier(session.schema_name),
                    sql.Identifier(session.role_name),
                )
            )
            cur.execute(
                sql.SQL("REVOKE CREATE ON DATABASE {} FROM PUBLIC").format(
                    sql.Identifier(DB_NAME)
                )
            )
            cur.execute(
                sql.SQL("GRANT CONNECT ON DATABASE {} TO {}").format(
                    sql.Identifier(DB_NAME),
                    sql.Identifier(session.role_name),
                )
            )
            cur.execute(
                """
                INSERT INTO public.datadock_sessions
                    (session_id, role_name, schema_name, expires_at)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (session_id) DO NOTHING
                """,
                (
                    session.session_id,
                    session.role_name,
                    session.schema_name,
                    expires_at,
                ),
            )
            cur.execute(
                sql.SQL("REVOKE ALL ON SCHEMA public FROM PUBLIC")
            )
            conn.commit()


def get_session_connection(session: Session) -> psycopg.Connection:
    """Connect as the restricted role that owns only this session's schema."""
    conn = psycopg.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=session.role_name,
        password=session.role_password,
    )
    with conn.cursor() as cur:
        cur.execute(
            sql.SQL("SET search_path TO {}, pg_catalog").format(
                sql.Identifier(session.schema_name)
            )
        )
    return conn


def find_session(session_id: str) -> Session | None:
    with get_admin_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT role_name, schema_name, expires_at
                FROM public.datadock_sessions
                WHERE session_id = %s
                """,
                (session_id,),
            )
            row = cur.fetchone()
            if row is None:
                return None
            role_name, schema_name, expires_at = row
            session = Session(
                session_id=session_id,
                role_name=role_name,
                schema_name=schema_name,
                role_password=_session_password(session_id),
                expires_at=expires_at,
            )
            return session


def cleanup_expired_sessions(now: datetime | None = None) -> int:
    now = now or datetime.now(timezone.utc)
    removed = 0
    with get_admin_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT session_id, role_name, schema_name
                FROM public.datadock_sessions
                WHERE expires_at <= %s
                FOR UPDATE SKIP LOCKED
                """,
                (now,),
            )
            expired = cur.fetchall()
            for session_id, role_name, schema_name in expired:
                cur.execute(
                    sql.SQL("DROP SCHEMA IF EXISTS {} CASCADE").format(
                        sql.Identifier(schema_name)
                    )
                )
                cur.execute(
                    sql.SQL("DROP ROLE IF EXISTS {}").format(
                        sql.Identifier(role_name)
                    )
                )
                cur.execute(
                    "DELETE FROM public.datadock_sessions WHERE session_id = %s",
                    (session_id,),
                )
                removed += 1
            conn.commit()
    return removed
