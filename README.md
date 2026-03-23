# MedChat AI

A modern, AI-powered medical consultation chatbot built with React and Vite. MedChat AI provides multi-modal diagnostic capabilities including X-Ray, MRI, and CT scan analysis with real-time AI-generated reports.

## Features

- **Multi-Modal Diagnostics** — Analyze X-Rays, MRI scans, CT scans, and general medical queries
- **Image Upload & Analysis** — Upload medical images for instant AI-generated diagnostic reports
- **Real-Time Streaming** — AI responses stream in real-time for a responsive experience
- **Voice Input & Output** — Speak your queries and listen to AI responses using Web Speech API
- **PDF Export** — Export consultation logs as clean, printable PDF documents
- **Dark & Light Themes** — Professional UI with seamless theme switching
- **Persistent Chat History** — Conversations are saved locally per diagnostic section
- **Drag & Drop** — Drag medical images directly into the chat

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 6 | Build tool & dev server |
| Tailwind CSS 4 | Styling |
| Hugging Face API | AI model backend (MedGemma) |
| Web Speech API | Voice input & text-to-speech |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/Atharv-Gujar/MedChat-AI.git
cd MedChat-AI
npm install
```

### Configuration

Create a `.env` file in the project root:

```env
VITE_API_KEY=your-huggingface-api-key
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
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── App.jsx              # Main application component
    ├── config.js            # API keys, model config, system prompts
    ├── index.css            # Global styles & print styles
    ├── main.jsx             # Entry point
    └── components/
        ├── InputArea.jsx    # Text input, image upload, voice input
        ├── Message.jsx      # Chat message rendering with markdown
        ├── Sidebar.jsx      # Navigation, theme toggle, actions
        ├── Toast.jsx        # Notification toasts
        ├── TopBar.jsx       # Top bar with export & notifications
        ├── VoiceButton.jsx  # Text-to-speech for messages
        └── WelcomeScreen.jsx # Landing page with feature cards
```

## Diagnostic Modes

| Mode | Behavior |
|---|---|
| General Medical | Interactive — asks follow-up questions before diagnosis |
| X-Ray Analysis | Direct — generates comprehensive report from uploaded image |
| MRI Scan | Direct — generates comprehensive report from uploaded image |
| CT Scan | Direct — generates comprehensive report from uploaded image |

## PDF Export

Click the document icon in the top bar to export the current consultation as a PDF. The export includes:
- MedChat AI branded header
- Department and timestamp
- Full consultation log with Patient/AI labels
- Disclaimer footer

## Disclaimer

This application is for **informational purposes only** and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.

## License

MIT
