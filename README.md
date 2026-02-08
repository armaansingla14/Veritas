# Veritas - Truth and Clarity for Civic Life

A civic clarity engine and issue reporting tool for the City of Kingston.

## Features

- **RAG-Powered Q&A**: Ask questions about city services with mandatory citations
- **Issue Reporting**: Report potholes, noise complaints, and other civic issues with photos and map locations
- **AI-Assisted Triage**: Automatic severity assessment and department routing
- **Dashboard**: Map and list views of all reported issues
- **Multilingual Support**: Available in English and French, with extensible i18n architecture
- **Accessibility**: Large text mode, high contrast, and dark mode
- **Trust Layer**: Tamper-evident audit logging with optional Solana blockchain anchoring

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: SQLite + Drizzle ORM
- **AI**: Google Gemini 1.5 Flash
- **Maps**: Leaflet + OpenStreetMap
- **Blockchain**: Solana devnet (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Seed the document database (for Q&A):
   ```bash
   npm run seed:docs
   ```

4. Seed demo reports (optional):
   ```bash
   npm run seed:reports
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
veritas/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── ask/               # Q&A interface
│   │   ├── report/            # Report submission
│   │   ├── dashboard/         # Reports dashboard
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Core libraries
│   │   ├── db.ts             # Database connection
│   │   ├── rag.ts            # RAG pipeline
│   │   ├── gemini.ts         # Gemini client
│   │   ├── triage.ts         # AI triage
│   │   ├── audit.ts          # Hash chain logging
│   │   └── solana.ts         # Blockchain anchoring
│   └── data/                  # Content and seed data
├── drizzle/                   # Database schema
├── scripts/                   # Seeding scripts
└── public/uploads/            # Uploaded photos
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ask` | RAG Q&A |
| POST | `/api/reports` | Create report |
| GET | `/api/reports` | List reports |
| GET | `/api/reports/[id]` | Get single report |
| POST | `/api/triage` | AI triage |
| POST | `/api/upload` | Upload photo |
| POST | `/api/translate` | Translate text |
| POST | `/api/anchor` | Anchor hash to Solana |

## Solana Integration (Optional)

To enable blockchain anchoring:

1. Create a Solana devnet wallet
2. Get devnet SOL from the [faucet](https://faucet.solana.com/)
3. Add to `.env`:
   ```
   SOLANA_PRIVATE_KEY=your_base58_private_key
   SOLANA_ENABLED=true
   ```

## Demo Script

1. **Home page**: Modern branding with two CTAs
2. **Q&A**: Ask "When is my garbage day?" - see citations
3. **Multilingual**: Toggle to French, ask same question
4. **Report**: Submit a pothole with photo and map pin
5. **Triage**: See AI-suggested severity and department
6. **Dashboard**: View reports on map, use filters
7. **Accessibility**: Toggle large text and high contrast

## Sample Q&A Queries

- "When is my garbage day?"
- "How do I report a pothole?"
- "What are the noise bylaw hours?"
- "How do I get a parking permit?"

## License

MIT
