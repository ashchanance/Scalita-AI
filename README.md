# Scalita AI

> **AI-Powered Tape Reading for Scalpers & Day Traders**  
> Cut the Noise. Trade the Signal.

<img width="1024" height="338" alt="sacs" src="https://github.com/user-attachments/assets/0fe15c48-6d32-41dd-bf11-5960b1469927" />



---

## What is Scalita AI?

Scalita AI is a lightning-fast sentiment dashboard specifically designed for day traders and scalpers in the Indonesian stock market. Instead of manually reading long news articles before the market opens, users simply paste the news text or IPO prospectus—and within seconds, The Sentinel (an AI engine powered by Gemini 2.5 Flash) extracts direct action signals..

The output is not a narrative. The output is **ready-to-use structured data**:
- `catalyst_score` — Score 1–100, from Very Bearish to Very Bullish
- `volatility_risk` — Risk level: Low / Medium / High / Extreme
- `key_drivers` — 3 main price-driving keywords
- `action_signal` — Signal: Watch Closely / Potential Upside / Correction Risk
    
---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| AI Engine | Google Gemini 2.5 Flash via `@google/genai` |
| Deployment | Vercel |

---

## Architecture

```
scalita-ai/
├── app/
│   ├── page.tsx                # Landing Page (Client Component)
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard — 2-column terminal UI
│   └── actions/
│       └── ai-engine.ts        # Server Action — AI API integration
├── public/
│   └── sentinel-logo.svg       # The Sentinel character logo
└── README.md
```

### Data Flow

```
User pastes text
      │
      ▼
app/dashboard/page.tsx          (Client — validates, calls server action)
      │
      ▼
app/actions/gemini.ts           (Server Action — trim, clamp 5000 chars)
      │
      ▼
Gemini 2.5 Pro API              (responseMimeType: "application/json")
      │
      ▼
SentimentResponse { catalyst_score, volatility_risk, key_drivers, action_signal }
      │
      ▼
Dashboard renders result        (Framer Motion animations, dynamic color coding)
```

### Why Server Action?

`app/actions/gemini.ts` runs on the server — meaning `GEMINI_API_KEY` **never exposed to the browser**. This is the secure pattern for Next.js App Router and doesn't require a separate API route.

---

## Local Installation

### Prerequisites
- Node.js ≥ 18
- Google Gemini API Key ([get it here](https://aistudio.google.com/apikey))

### Steps

```bash
# 1. Clone repo
git clone https://github.com/ashchanance/scalita-AI.git
cd scalita-AI

# 2. Install dependencies
npm install

# 3. Setup environment variable
cp .env.example .env.local
# Edit .env.local and fill GEMINI_API_KEY

# 4. Run dev server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Important:** Add `GEMINI_API_KEY` to **Vercel Dashboard → Settings → Environment Variables** before deploying.

---

## Design Decisions

### Visual Identity — "Industrial Terminal"

Scalita AI is designed with a **monochrome industrial terminal** aesthetic — completely solid black (`#09090b`) with emerald accents only on live/active elements, and red/green only on trading signals.

This decision was deliberate: traders don't need a beautiful UI, they need a UI that **doesn't steal attention** and lets the data speak.

| Element | Decision | Reason |
|---|---|---|
| Font | `font-mono` (system) | Consistent with terminal aesthetic, no need for Google Fonts |
| Background | `#09090b` (zinc-950) | Blacker than pure black, reducing eye strain during night trading |
| Accent warna | Emerald for live, red/yellow/green for signals | Intuitive mapping: green = up, red = down |
| Animation | Framer Motion, ease `[0.22, 1, 0.36, 1]` | Custom cubic bezier that feels like "precision instrument" not playful |

### "The Sentinel" Character

The Sentinel AI character in Scalita AI is visualized as a **wireframe icosahedron** — not a humanoid avatar. This was deliberate:

- Icosahedron is a perfect geometric shape — symbolizing pure calculation without bias
- Wireframe without fill = AI that "sees through" the data
- Infinite 3D rotation = "always watching the market"
- No face = no emotion, no opinion — only signals

### AI Integration — Not a Chatbot

The main difference between Scalita AI and generic AI applications: **its output is structured JSON**, not free text. Gemini is forced to use `responseMimeType: "application/json"` so the response is always machine-parseable. No hallucination format, no preamble.

---

## Validation & Safety

```typescript
// app/actions/gemini.ts
const trimmed = text.trim();
if (!trimmed) throw new Error("Input cannot be empty");
const safeText = trimmed.substring(0, 5000);  // Token limit guard

// Post-parse validation
parsed.catalyst_score = Math.min(100, Math.max(1, Math.round(parsed.catalyst_score)));
parsed.key_drivers = parsed.key_drivers.slice(0, 3);
```

---

## Disclaimer

> Scalita AI is an AI-powered sentiment analysis tool. Output is not investment advice. Always conduct independent research before making trading decisions.

---

## License

MIT

---

*Scalita AI — AI-Powered Market Sentiment Analysis Platform — 2026*
