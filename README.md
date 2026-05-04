<div align="center">

# 🏥 MedChat AI

### AI-Powered Multi-Modal Medical Diagnostic Platform

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB%20%2B%20Edge-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.0%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*A comprehensive medical consultation platform that combines AI diagnostics, medical image analysis, real-time research retrieval, and multi-language support — built with a secure, serverless architecture.*

---

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-system-architecture) • [Setup](#-getting-started) • [Languages](#-supported-languages)

</div>

---

## ✨ Features

### 🩺 AI Medical Consultation
- **Symptom-based diagnosis** with interactive MCQ-driven assessments
- **Differential diagnosis** with probability charts and clinical reasoning
- **SOAP-format diagnostic reports** exportable as styled PDFs
- **Conversation memory** — maintains clinical context across the session

### 🔬 Medical Image Analysis
- **X-Ray, MRI & CT scan** interpretation via Gemini 2.0 Flash Vision AI
- **Drag & drop** image upload with preview
- **Real-time clinical findings** extraction from medical images

### 📚 Medical Research Module
- **Tavily AI Search** — Real-time web search with AI-summarized answers and image results
- **WHO Global Health Observatory** — Live statistics and disease outbreak alerts
- **PubMed** — Latest peer-reviewed medical research papers
- **Source selection controls** — Toggle individual sources on/off with real-time status
- **Cited responses** — Every answer includes clickable source citations

### 📄 Document-Augmented Diagnosis (RAG)
- **Upload medical reports** (PDF, images) for AI-contextualized diagnosis
- **Gemini 2.0 Flash OCR** for handwritten prescription/report extraction
- **Automatic report injection** into diagnostic context via RAG pipeline

### 📋 History Management
- **Full conversation history** — search, filter, and browse past sessions
- **Multi-select & bulk delete** past diagnostic conversations
- **Session restore** — continue any previous conversation

### 🌐 Multi-Language Support
- **11 Indian languages** with real-time UI translation
- AI responses adapt to the selected language
- All interface elements, prompts, and status messages are fully localized

### 🔐 Authentication & Persistence
- **Supabase Auth** with email/password and Google OAuth
- **Chat session persistence** — conversations saved and restored across sessions
- **Protected routes** — secure access to diagnostic features

### 🎙️ Voice & Accessibility
- **Voice input** — speak your symptoms instead of typing
- **Text-to-speech** — listen to AI responses
- **Dark/Light mode** with smooth transitions
- **Responsive design** — works on mobile, tablet, and desktop

### 🔒 Secure Architecture
- **All API keys stored server-side** in Supabase Edge Functions
- **No secrets exposed** to the browser — Gemini, HuggingFace, and Tavily keys are proxied securely
- **Token-based auth verification** on every Edge Function call

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Tailwind CSS 3 |
| **Build** | Vite 6 |
| **AI Chat Model** | HuggingFace Inference (google/gemma-3-27b-it) via `ai-chat` Edge Function |
| **AI Vision/OCR** | Google Gemini 2.0 Flash via `gemini-extract` Edge Function |
| **Web Search** | Tavily AI Search via `tavily-search` Edge Function |
| **Medical Data** | WHO GHO API, WHO Disease Outbreak News, PubMed E-utilities |
| **Auth & DB** | Supabase (PostgreSQL + Auth + Row Level Security) |
| **Serverless** | Supabase Edge Functions (Deno runtime) |
| **Localization** | Custom i18n system (11 languages) |
| **PDF Export** | Browser-native PDF generation with probability bar charts |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│          React 19 + Vite + TailwindCSS + Router v7       │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │Dashboard │ │ ChatPage │ │ScanPage  │ │HistoryPage │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│        │            │            │             │         │
│  ┌─────┴────────────┴────────────┴─────────────┴─────┐  │
│  │              Library Layer                         │  │
│  │  api.js │ rag.js │ search.js │ supabase.js        │  │
│  └───────────────────┬───────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTPS (Bearer Token Auth)
┌──────────────────────┼──────────────────────────────────┐
│              SUPABASE BACKEND                            │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Edge Functions (Deno Runtime)            │    │
│  │                                                   │    │
│  │  ai-chat ─────────→ HuggingFace (Gemma 3 27B)   │    │
│  │  gemini-extract ──→ Gemini 2.0 Flash (OCR)       │    │
│  │  tavily-search ───→ Tavily API (Web Search)      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐     │
│  │ PostgreSQL   │  │  Auth        │  │  Storage   │     │
│  │ chat_sessions│  │ Email+Google │  │ med-images │     │
│  │ messages     │  │   OAuth      │  │   bucket   │     │
│  └──────────────┘  └──────────────┘  └───────────┘     │
└─────────────────────────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌───────────┐ ┌──────────┐ ┌──────────┐
   │ WHO APIs  │ │ PubMed   │ │  CORS    │
   │ GHO + DON │ │ E-utils  │ │  Proxy   │
   └───────────┘ └──────────┘ └──────────┘
   (called directly from frontend — free, no keys)
```

---

## 📁 Project Structure

```
MedChat-AI/
├── public/
│   └── pdf.worker.min.mjs          # PDF.js worker for report parsing
├── src/
│   ├── components/
│   │   ├── DocumentUpload.jsx      # Medical report upload (PDF/image)
│   │   ├── InputArea.jsx           # Chat input with voice & image
│   │   ├── Message.jsx             # Message bubble + diagnosis chart + image gallery
│   │   ├── ProtectedRoute.jsx      # Auth-guarded route wrapper
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── SymptomChecker.jsx      # MCQ-based symptom assessment
│   │   ├── Toast.jsx               # Notification toasts
│   │   ├── TopBar.jsx              # Header with language & theme controls
│   │   ├── VoiceButton.jsx         # Text-to-speech button
│   │   └── WelcomeScreen.jsx       # Section-specific landing screens
│   ├── contexts/
│   │   ├── AuthContext.jsx         # Supabase auth state management
│   │   └── LanguageContext.jsx     # i18n language provider
│   ├── i18n/
│   │   ├── index.js                # Language registry & translation loader
│   │   └── locales/                # 11 language JSON files (en, hi, mr, gu, bn, ta, te, kn, ml, pa, ur)
│   ├── lib/
│   │   ├── api.js                  # HuggingFace streaming inference via Edge Function
│   │   ├── export.js               # PDF report generation with charts
│   │   ├── rag.js                  # Document retrieval & OCR via Gemini Edge Function
│   │   ├── search.js               # Tavily + WHO + PubMed search orchestrator
│   │   └── supabase.js             # Supabase client & session management
│   ├── pages/
│   │   ├── AuthPage.jsx            # Login / Sign-up page
│   │   ├── ChatPage.jsx            # Main consultation interface
│   │   ├── Dashboard.jsx           # Diagnostic hub / home
│   │   ├── HistoryPage.jsx         # Session history with search & bulk actions
│   │   └── ScanAnalysis.jsx        # Medical image analysis (X-Ray, MRI, CT)
│   ├── App.jsx                     # Router & layout
│   ├── config.js                   # System prompts, AI config & Edge Function URLs
│   ├── index.css                   # Global styles & design system
│   └── main.jsx                    # React entry point
├── supabase/
│   └── functions/
│       ├── ai-chat/index.ts        # Edge Function: proxy to HuggingFace (Gemma 3)
│       ├── gemini-extract/index.ts # Edge Function: proxy to Gemini 2.0 Flash (OCR)
│       └── tavily-search/index.ts  # Edge Function: proxy to Tavily Search API
├── .env.example                    # Environment variable template
├── index.html                      # HTML entry point
├── package.json                    # Dependencies & scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── vite.config.js                  # Vite build configuration
```

---

## 🔄 Research Module — Data Flow

```
User Query
    │
    ├─── Tavily AI Search ──→ Web results + images + AI summary
    │     (via tavily-search Edge Function)
    │
    ├─── WHO GHO API ──────→ Health statistics + disease indicators
    │     (direct call, no key needed)
    │
    ├─── WHO DON API ──────→ Disease outbreak alerts
    │     (direct call, no key needed)
    │
    └─── PubMed E-utils ───→ Peer-reviewed papers + PMIDs
          (direct call, no key needed)
    │
    ▼
Context Injection → AI generates cited, evidence-based response
    │
    ▼
Message Bubble → Text + Image Gallery + Source Citations
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Supabase** project with Edge Functions deployed
- API keys (all have free tiers):
  - [HuggingFace](https://huggingface.co/settings/tokens) — AI model inference
  - [Supabase](https://supabase.com) — Authentication & database
  - [Tavily](https://tavily.com) — Web search (1000 free/month)
  - [Google AI Studio](https://aistudio.google.com/apikey) — Gemini API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Atharv-Gujar/MedChat-AI.git
cd MedChat-AI

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public key |

> **Note:** HuggingFace, Gemini, and Tavily API keys are stored as **Supabase Edge Function secrets** (server-side only) and are never exposed to the client.

### Edge Function Secrets (set via Supabase Dashboard)

| Secret | Description |
|--------|-------------|
| `HF_API_KEY` | HuggingFace API token for Gemma 3 inference |
| `GEMINI_API_KEY` | Google Gemini API key for vision/OCR |
| `TAVILY_API_KEY` | Tavily API key for web search |

---

## 🌍 Supported Languages

| Language | Code | Language | Code |
|----------|------|----------|------|
| English | `en` | Kannada | `kn` |
| हिन्दी (Hindi) | `hi` | മലയാളം (Malayalam) | `ml` |
| বাংলা (Bengali) | `bn` | मराठी (Marathi) | `mr` |
| ગુજરાતી (Gujarati) | `gu` | ਪੰਜਾਬੀ (Punjabi) | `pa` |
| தமிழ் (Tamil) | `ta` | తెలుగు (Telugu) | `te` |
| اردو (Urdu) | `ur` | | |

---

## 📜 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

---

## ⚠️ Disclaimer

> **MedChat AI is for informational and educational purposes only.** It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical decisions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Atharv Gujar](https://github.com/Atharv-Gujar)**

</div>
