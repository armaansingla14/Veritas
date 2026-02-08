# Veritas Demo Walkthrough

## Pre-Demo Checklist
- [ ] Dev server running (`npm run dev`)
- [ ] Database seeded (`npm run seed`)
- [ ] Browser at localhost:3000
- [ ] Audio enabled for TTS demo
- [ ] Pothole image ready for scan demo

---

## Demo Flow (2-3 minutes)

### 1. Homepage (10 seconds)
**Show:**
- Glass morphism design
- "Civic Clarity Engine for Kingston" tagline
- Trust badge in top right (shows "Blockchain Verified" with count)

**Say:** "This is Veritas - a modern civic platform designed for Kingston."

---

### 2. Ask Page - RAG Q&A with TTS (30 seconds)
**Navigate:** Click "Ask a Question" or go to `/ask`

**Action:**
1. Type: "What are the noise bylaw hours in Kingston?"
2. Wait for AI response with citations
3. Click the **speaker icon** to play TTS audio

**Show:**
- Answer appears with `[Source 1]` citations
- ElevenLabs TTS reads the answer aloud

**Say:** "Users can ask any municipal question. Gemini searches our knowledge base and provides cited answers. With ElevenLabs, visually impaired users can listen to responses."

---

### 3. Scan Page - Vision AI (30 seconds)
**Navigate:** Go to `/scan`

**Action:**
1. Click upload or drag a pothole photo
2. Watch AI analyze the image

**Show:**
- AI detects: "Pothole" with high confidence
- Severity assessment: "Medium" or "High"
- Suggested department: "Roads & Infrastructure"
- One-click "File Report" button

**Say:** "Citizens can snap a photo of any civic issue. Gemini Vision identifies the problem, assesses severity, and routes it to the right department."

---

### 4. Report Page - Issue Submission (20 seconds)
**Navigate:** Go to `/report`

**Action:**
1. Select "Pothole" category
2. Add brief description
3. (Optional) Add location
4. Submit

**Show:**
- 3-step wizard flow
- On success: **Blockchain verification badge**
- Audit hash displayed
- "View on Solana" link

**Say:** "Every report is cryptographically logged. Citizens can verify their submission was recorded and never altered."

---

### 5. Trust Dashboard - Blockchain Proof (20 seconds)
**Navigate:** Go to `/trust`

**Action:**
1. Show the metrics cards (total entries, anchored %, chain validity)
2. Click a Solana explorer link

**Show:**
- Hash chain visualization (linked entries)
- Purple "Solana Anchored" badges
- Live transaction on Solana devnet

**Say:** "Our trust dashboard shows the complete audit chain. Each hash links to the previous, creating tamper-evident records. Click any transaction to see it on Solana's public blockchain."

---

### 6. Dashboard - Interactive Map (15 seconds)
**Navigate:** Go to `/dashboard`

**Show:**
- Map of Kingston with issue markers
- Color-coded by status (pending, in-progress, resolved)
- Filter buttons by category

**Say:** "Citizens can track all reported issues on an interactive map. Full transparency on what's happening in their community."

---

### 7. ChatWidget - Conversational AI (15 seconds)
**Action:**
1. Click the chat bubble (bottom right)
2. Type: "I want to report a broken streetlight on Division Street"
3. Watch AI file a report conversationally
4. Click TTS button on the response

**Show:**
- Function calling creates report mid-conversation
- Report ID displayed
- TTS works in chat too

**Say:** "The chatbot uses Gemini function calling. Users can file reports conversationally - the AI handles categorization and submission automatically."

---

## Wrap-Up (10 seconds)
**Show:** Return to homepage, point to Trust badge

**Say:** "Every interaction logged. Every response verifiable. Every citizen empowered. That's Veritas."

---

## Backup Demo Points

### If TTS fails:
- "ElevenLabs provides natural voice synthesis. The full implementation is live - let me show you the code..."

### If Solana link 404s:
- "We're on devnet with limited history. In production, all transactions persist permanently."

### If AI is slow:
- "Gemini is processing... In production, we'd add response caching for common queries."

---

## Technical Highlights to Mention

1. **Gemini Integration:**
   - RAG with embedding-based retrieval (text-embedding-004)
   - Gemini 2.0 Flash for generation
   - Vision API for image analysis
   - Function calling for chat actions

2. **Solana Integration:**
   - SHA-256 hash chain linking all entries
   - Memo program for on-chain anchoring
   - Devnet deployment with real transactions
   - Explorer links for public verification

3. **ElevenLabs Integration:**
   - Multilingual voice model
   - Streaming audio for fast playback
   - Works on Q&A page and ChatWidget

4. **Accessibility:**
   - WCAG 2.1 AA compliant
   - Dark mode + high contrast
   - Text size toggle
   - Multilingual (EN/FR)
   - Full keyboard navigation
