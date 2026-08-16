# 🏛️ Veritas — Truth and Clarity for Civic Life

![Next.js](https://img.shields.io/badge/Next.js_14-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini_2.0-8E75B2?logo=googlegemini&logoColor=white)
![Solana](https://img.shields.io/badge/Solana-14F195?logo=solana&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black)

**An AI-powered civic clarity engine for the City of Kingston** — it answers municipal questions with cited sources, detects issues from photos, speaks answers aloud in multiple languages, and cryptographically logs every interaction to the Solana blockchain so citizens can *verify the government never altered a response.*

🏆 **Built at QHacks 2026** · 🔗 [Devpost](https://devpost.com/software/veritas-gbqc0h) · 🎥 [Demo Video](https://youtu.be/sJOm-jkIVQA?si=msw0Yb2wF1ZL6zJ1)

---

## 💡 The Problem

Municipal 311 systems in mid-size cities field **50,000+ calls a year** with 8–15 minute wait times, city hall closes at 5pm, and language and accessibility barriers lock many residents out entirely. Worst of all, there's no way to *prove* a government answer is accurate or unchanged. Veritas tackles all of this in one accessible, transparent web app.

---

## ✨ What It Does

| Capability | How it works |
|---|---|
| 🔎 **RAG-Powered Q&A** | Retrieval-augmented answers over Kingston's bylaws & service docs, with **mandatory citations** so every claim is traceable |
| 📸 **Vision Issue Detection** | Snap a photo of a pothole, graffiti, or broken streetlight — Gemini Vision identifies and categorizes the issue |
| 🗺️ **Issue Reporting** | File reports with photos + map pins; community **voting, following, and trending** surface what matters |
| 🧠 **AI-Assisted Triage** | Automatic severity scoring and department routing for every report |
| 🔊 **Multilingual Voice** | ElevenLabs text-to-speech reads answers aloud in **English & French** (extensible i18n) |
| 💬 **Conversational Agent** | A chat widget with **Gemini function-calling** files reports through natural conversation |
| 🔗 **Blockchain Trust Layer** | Tamper-evident **hash-chain audit log** anchored to **Solana devnet** — publicly verifiable and immutable |
| ♿ **Accessibility First** | Large-text mode, high contrast, dark mode, and TTS, targeting WCAG 2.1 AA |

---

## 🧠 How It Works

```
                    ┌──────────────────────────────────────────────┐
  Question ───────▶ │  RAG: embeddings → retrieve docs → Gemini 2.0 │ ──▶ Answer + citations
                    └──────────────────────────────────────────────┘
                                        │
  Photo ─────▶ Gemini Vision ─▶ Issue type + severity ─▶ Triage ─▶ Report
                                        │
  Every interaction ─▶ Hash chain (SHA-256 linked log) ─▶ Solana anchor ─▶ Public verification
```

- **Retrieval-Augmented Generation** — documents are embedded with `gemini-embedding-001`, retrieved by similarity, and answered by `gemini-2.0-flash` under a strict "cite your sources" prompt ([`src/lib/rag.ts`](src/lib/rag.ts), [`src/lib/embeddings.ts`](src/lib/embeddings.ts)).
- **Vision + Triage** — uploaded photos are classified by Gemini Vision and scored for severity/department ([`src/lib/vision.ts`](src/lib/vision.ts), [`src/lib/triage.ts`](src/lib/triage.ts)).
- **Trust layer** — each response is hashed into an append-only chain and optionally anchored on-chain, so any tampering breaks the chain ([`src/lib/audit.ts`](src/lib/audit.ts), [`src/lib/solana.ts`](src/lib/solana.ts)). The `/trust` page visualizes the hash chain and links to the Solana explorer.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router) · React 18 · TypeScript
- **AI:** Google Gemini 2.0 Flash (RAG generation, Vision, function-calling) + Gemini embeddings
- **Voice:** ElevenLabs multilingual TTS
- **Data:** SQLite (better-sqlite3) + Drizzle ORM
- **Maps:** Leaflet + OpenStreetMap (react-leaflet)
- **Blockchain:** Solana devnet (`@solana/web3.js`)
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives), glassmorphism design

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then set GEMINI_API_KEY=your_key_here

# 3. Seed the knowledge base + demo reports
npm run seed          # runs seed:docs and seed:reports

# 4. Run it
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Optional: Solana blockchain anchoring
```bash
# create a devnet wallet + fund it from https://faucet.solana.com/
# then add to .env:
SOLANA_PRIVATE_KEY=your_base58_private_key
SOLANA_ENABLED=true
```

---

## 🔌 API Surface

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/ask` | RAG Q&A with citations |
| `POST` | `/api/scan` | Vision-based issue detection |
| `POST` | `/api/chat` | Conversational agent (function-calling) |
| `POST` | `/api/triage` | AI severity + department routing |
| `POST` | `/api/tts` | ElevenLabs text-to-speech |
| `POST` | `/api/translate` | English ↔ French translation |
| `GET/POST` | `/api/reports` | List / create civic reports |
| `POST` | `/api/reports/[id]/vote` · `/subscribe` | Vote on / follow a report |
| `GET` | `/api/reports/trending` | Trending issues |
| `POST` | `/api/anchor` · `GET /api/anchor/[hash]` | Anchor / verify a hash on Solana |
| `GET` | `/api/audit/verify` · `/stats` | Verify hash chain integrity / trust metrics |

---

## 🗂️ Project Structure

```
veritas/
├── src/
│   ├── app/              # Next.js App Router pages (ask, scan, report, dashboard, trust) + API routes
│   ├── components/       # React UI (ChatWidget, MapPicker, HashChainVisualization, TrustMetrics, …)
│   ├── lib/              # Core logic: rag, gemini, vision, triage, audit, solana, elevenlabs, embeddings
│   └── data/documents/   # Kingston bylaws & service docs (RAG knowledge base)
├── drizzle/              # Drizzle ORM schema
├── scripts/              # Seeding + Solana key/airdrop utilities
└── public/uploads/       # Uploaded issue photos
```

---

## 🎯 Try These

- "When is my garbage day?" — then hit the 🔊 button to hear it read aloud
- Toggle to **French** and ask again
- "What are the noise bylaw hours?" · "How do I get a parking permit?"
- Upload a pothole photo on **/scan** and watch it get classified and triaged
- Visit **/trust** to see the hash chain and open the live Solana explorer link

---

## 🏅 Why It Stands Out

Veritas combines four hard problems — **retrieval-grounded AI, computer vision, real-time multilingual voice, and verifiable on-chain transparency** — into a single, accessible product that a real municipality could deploy to cut 311 call volume and rebuild public trust. It was built end-to-end (frontend, API, AI pipelines, database, and blockchain integration) at a hackathon.

---

## 📄 License

MIT

---

## 👤 Author

**Armaan Singla** — Computer Engineering @ Queen's University
[GitHub](https://github.com/armaansingla14)
