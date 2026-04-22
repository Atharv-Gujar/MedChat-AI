# MedChat AI

A modern, AI-powered medical consultation chatbot built with React and Vite. MedChat AI provides multi-modal diagnostic capabilities including X-Ray, MRI, and CT scan analysis with real-time AI-generated reports, auto-advancing MCQ flows, and Supabase data persistence.

## Features

- **Multi-Modal Diagnostics** — Analyze X-Rays, MRI scans, CT scans, and general medical queries
- **Interactive MCQ Flow** — Intelligent auto-advancing multi-choice symptom assessment 
- **Differential Diagnosis Visualization** — Professional progress bar charts indicating probability percentages for various conditions
- **Cloud Persistence (Supabase)** — Chat history, sessions, and medical images are securely saved to the cloud
- **Image Upload & Analysis** — Upload medical images for instant AI-generated diagnostic reports
- **Real-Time Streaming** — AI responses stream in real-time for a responsive experience
- **Voice Input & Output** — Speak your queries and listen to AI responses using Web Speech API
- **Professional PDF Export** — Export consultation logs as clinical-grade printable PDF documents
- **Dark & Light Themes** — Professional UI with seamless theme switching
- **Drag & Drop** — Drag medical images directly into the chat

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 6 | Build tool & dev server |
| Tailwind CSS 4 | Styling & Animations |
| Hugging Face API | AI model backend (MedGemma) |
| Supabase | PostgreSQL Database, Authentication & Edge Storage |
| Web Speech API | Voice input & text-to-speech |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase Project
- Hugging Face API Token

### Installation

```bash
git clone https://github.com/Atharv-Gujar/MedChat-AI.git
cd MedChat-AI
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
# HuggingFace Token: https://huggingface.co/settings/tokens
VITE_API_KEY=your-huggingface-api-key

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

Run the following in your Supabase SQL Editor:
```sql
CREATE TABLE chat_sessions (id uuid default uuid_generate_v4() primary key, section text, title text, created_at timestamp default now(), updated_at timestamp default now());
CREATE TABLE messages (id uuid default uuid_generate_v4() primary key, session_id uuid references chat_sessions on delete cascade, role text, content text, image_url text, metadata jsonb default '{}'::jsonb, created_at timestamp default now());

-- Enable RLS and public access for development
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on chat_sessions" ON chat_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true) WITH CHECK (true);
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

## Project Structure

```
medchat/
├── package.json
├── tailwind.config.js
└── src/
    ├── App.jsx              # Main application routing
    ├── config.js            # API keys, model config, system prompts
    ├── lib/
    │   ├── api.js           # HuggingFace API integration
    │   ├── export.js        # PDF Medical Report generator
    │   └── supabase.js      # Supabase Client & CRUD helpers
    └── components/
        ├── Message.jsx      # Chat message rendering with charts
        ├── SymptomChecker.jsx # Auto-advancing MCQ interface
        └── ...
```

## Disclaimer

This application is for **informational purposes only** and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.

## License

MIT
