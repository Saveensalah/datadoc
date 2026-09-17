# Data Dock

A lightweight SQL playground for learning and practicing PostgreSQL directly in the browser.

**Write. Run. Learn.**

## Features

- 🐘 PostgreSQL SQL playground
- 📝 Browser-based SQL editor
- ⚡ Execute SQL queries directly from the browser
- 🗄️ Session-isolated PostgreSQL databases
- 📊 Database explorer with table and row previews
- 🔀 Resizable Editor + Database split view
- 🕒 Anonymous sessions with a 2-hour lifetime
- 📜 Query history
- 📚 Basic → Advanced SQL examples
- 🔄 Automatic database explorer refresh after SQL execution
- 🧩 Support for multi-statement SQL scripts
- 🐳 Dockerized PostgreSQL and FastAPI backend
- 🚀 Automated deployment using GitHub Actions
- ☁️ Hosted on an Azure Linux VM
- 🌐 Nginx reverse proxy
- 🔒 PostgreSQL is not publicly exposed

## How It Works

```text
                    Browser
                       │
                       ▼
              Nginx :80 / HTTPS
                 │           │
                 │           │
                 ▼           ▼
           Next.js        FastAPI
           Frontend        :8000
                              │
                              ▼
                         PostgreSQL
                           :5432
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
             Session A    Session B    Session C
               Schema       Schema       Schema
