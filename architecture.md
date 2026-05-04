# MedChat-AI System Architecture

Here is the updated visual representation of your system's architecture, including the Research Engine APIs. 

![Generated Architecture](./architecture.png)

## Detailed Technical Flow Diagram (Mermaid)

This diagram maps out exactly how your current codebase components, including all the external data sources and edge functions, are connected.
*Most markdown previews in IDEs like VS Code will automatically render this diagram.*

```mermaid
graph LR
    subgraph Frontend ["Frontend (React/Vite)"]
        UI["React UI Components<br/>(Dashboard, Chat, ScanAnalysis)"]
        Contexts["Contexts<br/>(AuthContext, LanguageContext)"]
        Router["React Router<br/>(Protected Routes)"]
        SearchLib["search.js<br/>(Research Orchestrator)"]
        
        UI <--> Contexts
        UI <--> Router
        UI <--> SearchLib
    end

    subgraph Backend ["Backend (Supabase)"]
        Auth["Supabase Auth"]
        DB[(PostgreSQL DB<br/>pgvector)]
        
        subgraph EdgeFunctions ["Edge Functions"]
            ChatFunc["ai-chat"]
            VisionFunc["gemini-extract"]
            TavilyFunc["tavily-search"]
        end
    end

    subgraph ExternalAPIs ["External AI & Research Providers"]
        HF["HuggingFace Router<br/>(google/gemma-3-27b-it)"]
        Gemini["Google Gemini API<br/>(gemini-2.0-flash)"]
        Tavily["Tavily Search API<br/>(AI Web Search)"]
        WHO["WHO APIs<br/>(GHO & Outbreak News)"]
        PubMed["PubMed E-utilities"]
    end

    %% Client to Supabase standard services
    Contexts -- "Authenticate/Session" --> Auth
    UI -- "Fetch/Save History" --> DB

    %% Client to Edge Functions
    UI -- "Send Chat Messages" --> ChatFunc
    UI -- "Upload Medical Scans" --> VisionFunc
    SearchLib -- "Secure Search Request" --> TavilyFunc

    %% Direct Client API calls (CORS Proxy used)
    SearchLib -- "Fetch Stats/News" --> WHO
    SearchLib -- "Fetch Research Papers" --> PubMed

    %% Edge Functions to External APIs
    ChatFunc -- "Standard Chat/RAG" --> HF
    VisionFunc -- "OCR/Vision Extraction" --> Gemini
    TavilyFunc -- "AI Web Search" --> Tavily
    
    %% Edge Functions Auth Verification
    ChatFunc -. "Verify Token" .-> Auth
    VisionFunc -. "Verify Token" .-> Auth
    TavilyFunc -. "Verify Token" .-> Auth

    %% Styling
    classDef frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#000
    classDef backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef api fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    
    class Frontend frontend
    class Backend backend
    class ExternalAPIs api
```
