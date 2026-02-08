# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Veritas is a civic clarity engine for the City of Kingston combining RAG-powered Q&A with AI-assisted civic issue reporting. Features tamper-evident audit logging and optional Solana blockchain anchoring.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push schema changes to SQLite
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run seed         # Seed documents + reports (requires GEMINI_API_KEY)
npm run seed:docs    # Seed RAG documents with embeddings
npm run seed:reports # Seed demo reports
```

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Database:** SQLite with Drizzle ORM (WAL mode)
- **AI:** Google Gemini 2.0 Flash (generation) + Embedding 001 (vectors)
- **UI:** Tailwind CSS, shadcn/ui (Radix primitives), Lucide icons
- **Maps:** Leaflet + React-Leaflet, OpenStreetMap/Nominatim
- **Blockchain:** Solana devnet (optional, memo program)

## Architecture

### Core Data Flow

1. **RAG Q&A** (`/api/ask`): Query → embed with Gemini → cosine similarity search on `documents` table → top 5 results → Gemini generates answer with `[Source N]` citations
2. **Issue Reporting** (`/api/reports` + `/api/triage`): Submit report → AI triage classifies severity/department → store with audit log entry
3. **Audit Chain** (`src/lib/audit.ts`): SHA-256 hash chain linking each entry to previous; optional Solana anchoring

### Key Libraries

| File | Purpose |
|------|---------|
| `src/lib/db.ts` | Lazy-init SQLite connection (proxy pattern for build-time safety) |
| `src/lib/rag.ts` | RAG pipeline orchestration |
| `src/lib/embeddings.ts` | Vector similarity search (in-memory cosine) |
| `src/lib/gemini.ts` | Gemini client with exponential backoff retry |
| `src/lib/triage.ts` | AI issue classification (severity, department routing) |
| `src/lib/audit.ts` | Tamper-evident hash chain logging |
| `src/lib/solana.ts` | Blockchain hash anchoring |
| `src/lib/geocode.ts` | Address search/geocoding via Nominatim |

### Database Schema (SQLite)

- **reports**: Civic issues with type, location, status, severity, triage info
- **documents**: RAG knowledge base with embeddings (BLOB as JSON array)
- **audit_log**: Hash chain entries with optional Solana tx signatures

### API Routes

| Endpoint | Purpose |
|----------|---------|
| `POST /api/ask` | RAG Q&A with citations |
| `GET/POST /api/reports` | List/create reports |
| `POST /api/triage` | AI classification |
| `POST /api/upload` | Photo upload to `public/uploads/` |
| `POST /api/anchor` | Anchor hash to Solana |

## Environment Variables

Required:
- `GEMINI_API_KEY` - From https://aistudio.google.com/

Optional:
- `SOLANA_PRIVATE_KEY` - Base58 encoded keypair
- `SOLANA_ENABLED=true` - Enable blockchain anchoring

## Development Notes

- Path aliases: `@/*` → `./src/*`, `@/drizzle/*` → `./drizzle/*`
- Gemini has rate limits; the client uses exponential backoff (2s base, 5 retries)
- Vector search uses in-memory cosine similarity (no external vector DB)
- Leaflet requires SSR transpilation (configured in next.config.js)
- Photos stored locally in `public/uploads/`
