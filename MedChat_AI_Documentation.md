# MedChat AI — Complete Technical Documentation

**Version:** 2.0.0 | **Date:** May 2026 | **Stack:** React 19 + Vite + Supabase + Gemma 3 27B

---

## 1. Project Overview

MedChat AI is an AI-powered clinical diagnostic platform that enables patients to describe symptoms via an interactive MCQ-based assessment and receive SOAP-format diagnostic reports. It also supports medical imaging analysis (X-Ray, MRI, CT), medical document upload with OCR, real-time medical research via WHO/PubMed, conversation persistence, and full multilingual support across 11 Indian languages.

### Key Features
- **Interactive Symptom Assessment** — MCQ-driven clinical evaluation with retry logic
- **SOAP Diagnostic Reports** — Structured medical reports with differential diagnosis probabilities
- **Medical Imaging Analysis** — X-Ray, MRI, CT scan interpretation via AI
- **RAG Document Pipeline** — Upload medical reports (PDF/images) for AI-contextualized diagnosis
- **Medical Research Engine** — Live data from WHO GHO, WHO Disease Outbreak News, PubMed, and Tavily web search
- **Conversation Persistence** — All sessions and messages saved to Supabase PostgreSQL
- **History Management** — Search, filter, multi-select, and bulk delete past sessions
- **Multilingual UI** — 11 languages: English, Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada, Malayalam, Punjabi, Urdu
- **PDF Export** — Professional medical reports with probability bar charts
- **Authentication** — Email/password + Google OAuth via Supabase Auth
- **Dark/Light Theme** — CSS variable-based theming with localStorage persistence
- **Voice Input** — Web Speech API for hands-free symptom entry
- **Secure Architecture** — All API keys stored server-side in Supabase Edge Functions

---

## 2. Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│  React 19 + Vite + TailwindCSS + React Router v7    │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │Dashboard │ │ ChatPage │ │ScanPage  │ │History │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│        │            │            │           │      │
│  ┌─────┴────────────┴────────────┴───────────┴───┐  │
│  │              Library Layer                     │  │
│  │  api.js │ rag.js │ search.js │ supabase.js    │  │
│  └───────────────────┬───────────────────────────┘  │
└──────────────────────┼──────────────────────────────┘
                       │ HTTPS (Bearer Token Auth)
┌──────────────────────┼──────────────────────────────┐
│              SUPABASE BACKEND                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │          Edge Functions (Deno)               │    │
│  │  ai-chat ──→ HuggingFace (Gemma 3 27B)     │    │
│  │  gemini-extract ──→ Gemini 2.0 Flash (OCR)  │    │
│  │  tavily-search ──→ Tavily API (Web Search)   │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  PostgreSQL   │  │  Auth (GoTrue)│  │  Storage  │ │
│  │chat_sessions │  │Email+Google  │  │med-images │ │
│  │messages      │  │  OAuth       │  │  bucket   │ │
│  │user_documents│  └──────────────┘  └───────────┘ │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  WHO GHO API    PubMed NCBI    WHO Outbreak News
  (Free, no key) (Free, no key) (Free, no key)
```

### 2.2 File Structure

```
MedChat-AI/
├── src/
│   ├── App.jsx                    # Root router & layout shell
│   ├── main.jsx                   # React entry point
│   ├── config.js                  # System prompts, section configs, edge function URLs
│   ├── index.css                  # Global CSS variables, themes, animations
│   ├── components/
│   │   ├── Sidebar.jsx            # Navigation sidebar with section links
│   │   ├── TopBar.jsx             # Top navigation bar with search & language selector
│   │   ├── InputArea.jsx          # Chat input with image upload, voice, send
│   │   ├── Message.jsx            # Chat message renderer with markdown/MCQ support
│   │   ├── SymptomChecker.jsx     # MCQ assessment UI with progress tracking
│   │   ├── WelcomeScreen.jsx      # Landing screen with quick prompts
│   │   ├── DocumentUpload.jsx     # Medical report upload modal with RAG
│   │   ├── VoiceButton.jsx        # Web Speech API voice input
│   │   ├── Toast.jsx              # Notification toast component
│   │   └── ProtectedRoute.jsx     # Auth guard wrapper
│   ├── pages/
│   │   ├── Dashboard.jsx          # Home page with diagnostic cards
│   │   ├── ChatPage.jsx           # General medical + research chat
│   │   ├── ScanAnalysis.jsx       # X-Ray/MRI/CT image analysis page
│   │   ├── HistoryPage.jsx        # Conversation history with search/delete
│   │   └── AuthPage.jsx           # Login/signup/reset password
│   ├── contexts/
│   │   ├── AuthContext.jsx        # Supabase auth state management
│   │   └── LanguageContext.jsx    # i18n language state & translation function
│   ├── lib/
│   │   ├── api.js                 # AI chat streaming via Edge Function proxy
│   │   ├── rag.js                 # PDF/image text extraction & document storage
│   │   ├── search.js              # WHO + PubMed + Tavily web search orchestrator
│   │   ├── supabase.js            # Supabase client, session/message CRUD
│   │   └── export.js              # HTML/PDF diagnostic report generator
│   └── i18n/
│       ├── index.js               # Language registry & lazy loader with English fallback
│       └── locales/               # 11 JSON translation files (en, hi, mr, gu, bn, ta, te, kn, ml, pa, ur)
├── supabase/functions/
│   ├── ai-chat/index.ts           # HuggingFace proxy Edge Function
│   ├── gemini-extract/index.ts    # Gemini 2.0 Flash OCR Edge Function
│   └── tavily-search/index.ts     # Tavily web search Edge Function
└── .env                           # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

---

## 3. Authentication System

### 3.1 Flow
1. User navigates to `/auth` → `AuthPage.jsx` renders login/signup/reset forms
2. **Email/Password**: Calls `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()`
3. **Google OAuth**: Calls `supabase.auth.signInWithOAuth({ provider: 'google' })`
4. **Password Reset**: Calls `supabase.auth.resetPasswordForEmail()` with redirect URL
5. On success, `AuthContext` updates `user` and `session` state
6. `ProtectedRoute` checks `useAuth().user` — redirects to `/auth` if null

### 3.2 Token Flow for Edge Functions
- Every API call reads `supabase.auth.getSession()` → extracts `access_token`
- Token sent as `Authorization: Bearer <token>` header to Edge Functions
- Edge Functions verify the token by calling `supabase.auth.getUser()` server-side
- Unauthorized requests receive HTTP 401

---

## 4. AI Diagnostic Engine

### 4.1 Model: Gemma 3 27B-IT
- Hosted on HuggingFace Inference API
- Proxied through Supabase Edge Function `ai-chat`
- Streaming SSE responses parsed client-side in `api.js`
- Retry logic: up to 3 retries on HTTP 429 with exponential backoff (2s, 4s, 8s)

### 4.2 Three Operating Modes (defined in `config.js`)

**Mode 1 — Normal Chat**: General health questions answered conversationally.

**Mode 2 — MCQ Symptom Assessment**: When user reports new symptoms, AI responds with structured JSON:
```json
{
  "thinking": "3-5 word note",
  "question": "Assessment question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "step": 1,
  "totalSteps": 4
}
```
- 3-6 questions based on symptom complexity
- Retry mechanism for clinically inconsistent answers
- Custom "Other" option for free-text responses
- After final answer → generates full SOAP Diagnostic Report

**Mode 3 — Report Analysis**: When uploaded medical records are in context, AI directly analyzes documents without MCQ. References specific lab values, imaging findings, and diagnoses.

### 4.3 SOAP Report Format
Every diagnostic report follows this structure:
- **S (Subjective)**: Chief complaint, history of present illness, patient context, uploaded records summary
- **O (Objective)**: Clinical data from uploaded reports, AI assessment observations
- **A (Assessment)**: Differential diagnosis with probability percentages (must sum to ~100%), clinical impression with urgency level (Low/Moderate/High)
- **P (Plan)**: Home remedies, lifestyle changes, doctor consultation recommendations, follow-up, warning signs

### 4.4 Safety Rules
- **NEVER recommends specific medications** — only describes treatment types (e.g., "anti-inflammatory treatment")
- Emergency symptoms skip MCQ and advise calling emergency services immediately
- All reports end with disclaimer: "This is for informational purposes only"

---

## 5. Medical Imaging Analysis

### 5.1 Supported Modalities
| Modality | Route | System Prompt Focus |
|----------|-------|-------------------|
| X-Ray | `/xray` | Fractures, opacities, masses, effusions, calcifications |
| MRI | `/mri` | Soft tissue, signal abnormalities, herniation, tears |
| CT | `/ct` | Masses, lesions, hemorrhage, contrast enhancement |

### 5.2 Workflow (ScanAnalysis.jsx)
1. User uploads image via drag-and-drop or file picker
2. Image converted to base64 data URI
3. Sent to AI via `callAPIStream()` with modality-specific system prompt
4. AI generates immediate SOAP report (no MCQ for imaging)
5. User can ask follow-up questions about the same scan
6. Session persisted to Supabase with section tag (xray/mri/ct)

### 5.3 Language Support
- `langMeta.name` (e.g., "Hindi") injected into system prompt
- AI generates entire diagnostic report in selected language
- UI labels use `t()` translation function

---

## 6. RAG Document Pipeline

### 6.1 Supported File Types
- **PDF**: Text extracted via `pdfjs-dist` library, page-by-page
- **Images** (JPG/PNG): OCR via Gemini 2.0 Flash Edge Function, fallback to HuggingFace
- **Text files**: Direct text reading

### 6.2 OCR Extraction (rag.js)
1. Image → base64 conversion
2. Sent to `gemini-extract` Edge Function with specialized medical OCR prompt
3. Extracts: document header, patient info, vitals, clinical notes, prescriptions
4. Handles both printed AND handwritten text (marks uncertain words with [?])
5. Fallback: HuggingFace via `ai-chat` Edge Function if Gemini fails

### 6.3 Storage
- Full document text stored in `user_documents` table (Supabase PostgreSQL)
- Upserted by `user_id + file_name` (no duplicates)
- Retrieved at chat time via `getUserDocumentsContext()` → injected into system prompt

### 6.4 Context Injection
When documents exist, the system prompt is augmented with:
```
## Patient's Uploaded Medical Records & Reports:
━━━ Document 1: "report.pdf" (application/pdf) ━━━
[full extracted text]
```
This triggers Mode 3 (Report Analysis) — AI references specific values from uploaded documents.

---

## 7. Medical Research Engine

### 7.1 Data Sources (search.js)

| Source | API | Auth | Data Type |
|--------|-----|------|-----------|
| WHO GHO | OData REST | Free, no key | Health statistics (life expectancy, mortality, disease prevalence) |
| WHO DON | REST API | Free, no key | Disease outbreak news |
| PubMed | NCBI E-utilities | Free, no key | Peer-reviewed research papers |
| Tavily | AI Search API | API key (server-side) | General web search with AI summaries |

### 7.2 Smart Trigger System
`shouldSearchWeb()` analyzes user queries for:
- **Temporal words**: "latest", "recent", "2025", "guidelines"
- **Research words**: "study", "research", "trial", "pubmed"
- **Medical words**: "treatment for", "vaccine", "survival rate", "outbreak"
- **Skip patterns**: Short messages, greetings, MCQ answers

### 7.3 Source Selection UI
Users can toggle individual sources (Web, WHO, PubMed) in the Research section. Each source runs in parallel via `Promise.allSettled()`.

### 7.4 Context Formatting
Results are formatted as structured text and injected into the AI prompt:
- WHO stats → markdown tables (Country | Year | Value)
- Outbreak news → titled summaries with dates and links
- PubMed → paper titles with authors, journal, PMID
- Tavily → web snippets with source URLs

---

## 8. Conversation Persistence

### 8.1 Database Schema (Supabase PostgreSQL)

**chat_sessions table:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| section | TEXT | "general", "research", "xray", "mri", "ct" |
| title | TEXT | Session title (auto-generated) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last activity timestamp |

**messages table:**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| session_id | UUID | Foreign key to chat_sessions |
| role | TEXT | "user" or "assistant" |
| content | TEXT | Message text content |
| image_url | TEXT | Optional attached image URL |
| metadata | JSONB | Additional data (MCQ state, etc.) |
| created_at | TIMESTAMPTZ | Timestamp |

**user_documents table:**
| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Foreign key to auth.users |
| file_name | TEXT | Original filename |
| file_type | TEXT | MIME type |
| full_text | TEXT | Complete extracted text |
| char_count | INT | Character count |

### 8.2 Session Lifecycle
1. User sends first message → `createChatSession(section, title, userId)` creates new session
2. Each message → `saveMessage(sessionId, role, content, imageUrl, metadata)` persists to DB
3. Session `updated_at` refreshed on every new message
4. History page reads all sessions via `listChatSessions()`

---

## 9. History Page

### 9.1 Features (HistoryPage.jsx)
- **Session Listing**: All conversations sorted by recency with relative timestamps
- **Title Search**: Filter sessions by title
- **Deep Message Search**: Search inside message content across all sessions
- **Section Filtering**: Filter by General, Research, X-Ray, MRI, CT with count badges
- **Expandable View**: Click session to see full message history inline
- **Multi-Select Mode**: Select individual sessions or "Select All"
- **Bulk Delete**: Delete multiple selected sessions with confirmation
- **Individual Delete**: Delete single sessions with confirmation
- **SOAP/Diagnostic Badges**: Visual indicators for sessions containing diagnostic reports

### 9.2 Search Implementation
- Title search: client-side string matching on session titles
- Message search: loads messages for each session via `getMessages()`, searches content with `highlightMatch()` for visual highlighting
- Debounced to avoid excessive API calls

---

## 10. Internationalization (i18n)

### 10.1 Architecture
- **11 languages** supported with lazy-loaded JSON locale files
- `LanguageContext` provides `t(key, params)` translation function globally
- English loaded as base; selected language merged on top (English fallback for missing keys)
- Language persisted in `localStorage('medchat-lang')`

### 10.2 Translation Coverage
Every UI element uses `t()` calls:
- Sidebar navigation labels
- Dashboard cards and descriptions
- Chat interface (input placeholders, buttons, prompts)
- Symptom checker (questions, options, progress)
- Scan analysis (upload, export, findings labels)
- History page (search, select, delete, filter labels)
- Auth page (sign in, sign up, reset forms)
- Toast notifications

### 10.3 AI Response Localization
When language ≠ English, the system prompt is augmented with:
```
## LANGUAGE INSTRUCTION:
You MUST respond entirely in {language}. All text, questions, options,
headings, and explanations must be in {language}.
```

---

## 11. PDF Export System

### 11.1 Report Generation (export.js)
1. Extracts diagnostic report from AI messages (finds SOAP content)
2. Converts markdown to styled HTML (headings, lists, bold, italic)
3. Generates professional clinical document with:
   - Report header with unique ID (MCR-YYYY-XXXXXX)
   - Info grid (Department, Date, Status)
   - Patient-reported symptoms list
   - Differential diagnosis probability bar chart
   - Full SOAP report content
   - Signature block and disclaimer
4. Opens in new browser tab → triggers `window.print()` for PDF save

---

## 12. Edge Functions (Server-Side Proxies)

### 12.1 ai-chat (HuggingFace Proxy)
- **Endpoint**: `POST /functions/v1/ai-chat`
- **Auth**: Validates Supabase JWT token
- **Forwards to**: `https://router.huggingface.co/v1/chat/completions`
- **Supports**: Streaming (SSE) and non-streaming modes
- **Secret**: `HF_API_KEY` stored in Supabase project secrets

### 12.2 gemini-extract (Gemini OCR Proxy)
- **Endpoint**: `POST /functions/v1/gemini-extract`
- **Auth**: Validates Supabase JWT token
- **Forwards to**: Gemini 2.0 Flash `generateContent` API
- **Input**: base64 image data + OCR prompt
- **Output**: Extracted text from medical documents
- **Secret**: `GEMINI_API_KEY`

### 12.3 tavily-search (Web Search Proxy)
- **Endpoint**: `POST /functions/v1/tavily-search`
- **Auth**: Validates Supabase JWT token
- **Forwards to**: `https://api.tavily.com/search`
- **Config**: Advanced search depth, includes images and AI answer, max 5 results
- **Secret**: `TAVILY_API_KEY`

---

## 13. UI/UX Design System

### 13.1 Theming
- CSS custom properties (`--bg`, `--surface`, `--primary`, `--on-surface`, `--outline`, etc.)
- Dark theme: Deep backgrounds (#0b0f14, #111827) with teal primary (#7ad7c6)
- Light theme: Clean whites (#ffffff, #f8fafc) with teal primary (#0d9488)
- Theme toggle persisted in `localStorage('medchat-theme')`

### 13.2 Component Design
- **Glassmorphism**: Sidebar and modals use `backdrop-filter: blur()` with semi-transparent backgrounds
- **Micro-animations**: Hover effects, loading spinners, fade transitions
- **Responsive**: Mobile-first with sidebar overlay on small screens, fixed sidebar on desktop
- **Typography**: Google Fonts (Manrope for headings, Inter for body)

---

## 14. Environment & Deployment

### 14.1 Required Environment Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 14.2 Supabase Project Secrets (Edge Functions)
```
HF_API_KEY=hf_xxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxx
TAVILY_API_KEY=tvly-xxxxxxxxx
```

### 14.3 Build & Deploy
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (Vite HMR on :5173)
npm run build        # Production build to dist/
```
Deploy `dist/` to Vercel/Netlify with environment variables configured.

### 14.4 Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.0 | UI framework |
| react-dom | 19.1.0 | DOM renderer |
| react-router-dom | 7.14.2 | Client-side routing |
| @supabase/supabase-js | 2.104.0 | Supabase client (auth, DB, storage) |
| pdfjs-dist | 5.4.624 | PDF text extraction |
| vite | 6.3.0 | Build tool & dev server |
| tailwindcss | 3.4.17 | Utility CSS framework |

---

## 15. Security Considerations

1. **No client-side API keys** — All third-party keys stored in Supabase Edge Function secrets
2. **JWT authentication** — Every Edge Function validates the user's Supabase access token
3. **Row-Level Security (RLS)** — Supabase tables use RLS policies so users can only access their own data
4. **No medication recommendations** — System prompt strictly forbids naming specific drugs
5. **Medical disclaimer** — Every report includes professional consultation advisory
6. **CORS headers** — Edge Functions allow cross-origin requests with proper headers

---

*Generated by MedChat AI Documentation System — May 2026*
