<div align="center">

# 🏥 MedChat AI

### AI-Powered Multi-Modal Medical Diagnostic Platform

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*A comprehensive medical consultation platform that combines AI diagnostics, medical image analysis, real-time research retrieval, and multi-language support.*

---

[Features](#-features) • [Demo](#-screenshots) • [Tech Stack](#-tech-stack) • [Setup](#-getting-started) • [Architecture](#-architecture) • [Languages](#-supported-languages)

</div>

---

## ✨ Features

### 🩺 AI Medical Consultation
- **Symptom-based diagnosis** with interactive MCQ-driven assessments
- **Differential diagnosis** with probability charts and clinical reasoning
- **Diagnostic reports** exportable as styled PDFs
- **Conversation memory** — maintains clinical context across the session

### 🔬 Medical Image Analysis
- **X-Ray, MRI & CT scan** interpretation via AI
- **Drag & drop** image upload with preview
- **Real-time clinical findings** extraction from medical images

### 📚 Medical Research Module
- **Tavily AI Search** — Real-time web search with AI-summarized answers and image results
- **WHO Global Health Observatory** — Live statistics and disease outbreak alerts
- **PubMed** — Latest peer-reviewed medical research papers
- **Source selection controls** — Toggle individual sources on/off with real-time status
- **Cited responses** — Every answer includes clickable source citations

### 📄 Document-Augmented Diagnosis
- **Upload medical reports** (PDF, images) for AI-contextualized diagnosis
- **Full-text extraction** from uploaded documents
- **Automatic report injection** into diagnostic context

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

---

## 🖼️ Screenshots

| Dashboard | AI Consultation | Research Module |
|:---------:|:---------------:|:---------------:|
| Multi-modal diagnostic hub | Symptom MCQ + diagnosis chart | Tavily + WHO + PubMed search |

| Scan Analysis | Multi-Language | Dark Mode |
|:-------------:|:--------------:|:---------:|
| X-Ray/MRI/CT interpretation | 11 Indian languages | Full dark theme support |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router 7, Tailwind CSS 3 |
| **Build** | Vite 6 |
| **AI Model** | HuggingFace Inference API (Mistral / medical LLMs) |
| **Auth & DB** | Supabase (PostgreSQL + Auth + Row Level Security) |
| **Web Search** | Tavily AI Search (primary), WHO GHO API, PubMed E-utilities |
| **Document Processing** | Full-text extraction + Supabase storage |
| **PDF Parsing** | pdf.js (Mozilla) |
| **Localization** | Custom i18n system (11 languages) |
| **Export** | Browser-native PDF generation with styled templates |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- API keys (all have free tiers):
  - [HuggingFace](https://huggingface.co/settings/tokens) — AI model inference
  - [Supabase](https://supabase.com) — Authentication & database
  - [Tavily](https://tavily.com) — Web search (1000 free/month)

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
| `VITE_API_KEY` | ✅ | HuggingFace API token for AI inference |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public key |
| `VITE_TAVILY_API_KEY` | ⚡ | Tavily API key (needed for web search in Research module) |

> **Note:** WHO and PubMed APIs are completely free and require no API keys.

---

## 📁 Architecture

```
MedChat-AI/
├── public/
│   └── pdf.worker.min.mjs      # PDF.js worker for report parsing
├── src/
│   ├── components/
│   │   ├── DocumentUpload.jsx   # Medical report upload (PDF/image)
│   │   ├── InputArea.jsx        # Chat input with voice & image
│   │   ├── Message.jsx          # Message bubble + diagnosis chart + image gallery
│   │   ├── ProtectedRoute.jsx   # Auth-guarded route wrapper
│   │   ├── Sidebar.jsx          # Navigation sidebar
│   │   ├── SymptomChecker.jsx   # MCQ-based symptom assessment
│   │   ├── Toast.jsx            # Notification toasts
│   │   ├── TopBar.jsx           # Header with language & theme controls
│   │   ├── VoiceButton.jsx      # Text-to-speech button
│   │   └── WelcomeScreen.jsx    # Section-specific landing screens
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Supabase auth state management
│   │   └── LanguageContext.jsx  # i18n language provider
│   ├── i18n/
│   │   ├── index.js             # Language registry & translation loader
│   │   └── locales/             # 11 language JSON files
│   ├── lib/
│   │   ├── api.js               # HuggingFace streaming inference
│   │   ├── export.js            # PDF report generation
│   │   ├── rag.js               # Document retrieval from Supabase
│   │   ├── search.js            # Tavily + WHO + PubMed orchestrator
│   │   └── supabase.js          # Supabase client & session management
│   ├── pages/
│   │   ├── AuthPage.jsx         # Login / Sign-up page
│   │   ├── ChatPage.jsx         # Main consultation interface
│   │   ├── Dashboard.jsx        # Diagnostic hub / home
│   │   └── ScanAnalysis.jsx     # Medical image analysis
│   ├── App.jsx                  # Router & layout
│   ├── config.js                # System prompts & AI configuration
│   ├── index.css                # Global styles & design system
│   └── main.jsx                 # React entry point
├── .env.example                 # Environment variable template
├── index.html                   # HTML entry point
├── package.json                 # Dependencies & scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── vite.config.js               # Vite build configuration
```

---

## 🔄 Research Module — Data Flow

```
User Query
    │
    ├─── Tavily AI Search ──→ Web results + images + AI summary
    │       (priority 1)
    │
    ├─── WHO GHO API ──────→ Health statistics + outbreak alerts
    │       (priority 2)
    │
    └─── PubMed E-utils ───→ Peer-reviewed papers + PMIDs
            (priority 3)
    │
    ▼
Context Injection → AI generates cited, evidence-based response
    │
    ▼
Message Bubble → Text + Image Gallery + Source Citations
```

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
