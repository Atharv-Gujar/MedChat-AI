import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import WelcomeScreen from './components/WelcomeScreen';
import Message from './components/Message';
import InputArea from './components/InputArea';
import Toast from './components/Toast';
import { SECTIONS, API_KEY, API_URL, MODEL } from './config';

const STORAGE_KEY = 'medchat-history';

function loadHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const h = {};
  Object.keys(SECTIONS).forEach(k => (h[k] = []));
  return h;
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('medchat-theme') || 'dark');
  const [section, setSection] = useState('general');
  const [history, setHistory] = useState(loadHistory);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [streamingText, setStreamingText] = useState('');
  const chatRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem('medchat-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const showToast = (message) => setToast({ show: true, message });

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    });
  }, []);

  useEffect(scrollDown, [history, loading, streamingText, scrollDown]);

  const sendMessage = async (text) => {
    if (!text.trim() && !image) return;

    const userMsg = { role: 'user', text: text.trim(), image: image?.base64 || null, timestamp: new Date().toISOString() };
    const img = image;

    setHistory(h => ({ ...h, [section]: [...h[section], userMsg] }));
    setImage(null);
    setLoading(true);
    setStreamingText('');

    try {
      const reply = await callAPIStream(text.trim(), img, section, history[section], (partial) => {
        setStreamingText(partial);
        scrollDown();
      });
      const botMsg = { role: 'assistant', text: reply, timestamp: new Date().toISOString() };
      setHistory(h => ({ ...h, [section]: [...h[section], botMsg] }));
      setStreamingText('');
    } catch (err) {
      if (err.name === 'AbortError') return;
      const errMsg = { role: 'assistant', text: `**Error**: ${err.message || 'Something went wrong.'}`, timestamp: new Date().toISOString() };
      setHistory(h => ({ ...h, [section]: [...h[section], errMsg] }));
      setStreamingText('');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setHistory(h => ({ ...h, [section]: [] }));
    window.speechSynthesis?.cancel();
  };

  const exportPDF = () => {
    const msgs = history[section];
    if (!msgs.length) return;

    const sectionName = SECTIONS[section].name;
    const now = new Date().toLocaleString();
    const date = new Date().toISOString().split('T')[0];

    const conversationSummary = msgs.map(msg => ({
      role: msg.role === 'user' ? 'Patient' : 'AI Assistant',
      text: msg.text || '',
      time: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      hasImage: !!msg.image
    }));

    let html = `<!DOCTYPE html><html><head>
      <title>MedChat AI Report — ${date}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; padding: 48px; color: #1e293b; line-height: 1.7; background: white; }
        .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .logo-icon { width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb, #10b981); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px; }
        .logo-text { font-size: 18px; font-weight: 800; background: linear-gradient(90deg, #2563eb, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
        .header h1 { font-size: 24px; color: #0f172a; margin: 8px 0 4px; }
        .header-meta { display: flex; gap: 20px; font-size: 12px; color: #64748b; margin-top: 4px; }
        .conv-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 20px; padding: 8px 14px; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 6px 6px 0; }
        .conv-msg { padding: 14px 0; }
        .conv-msg + .conv-msg { border-top: 1px solid #f1f5f9; }
        .conv-role { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 4px; }
        .conv-role.ai { color: #2563eb; }
        .conv-text { font-size: 13px; line-height: 1.7; color: #334155; white-space: pre-wrap; }
        .conv-image { font-size: 12px; color: #64748b; font-style: italic; margin-bottom: 4px; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
        @media print { body { padding: 24px; } }
      </style></head><body>`;

    html += `<div class="header">
      <div class="logo"><div class="logo-icon">M</div><div class="logo-text">MedChat AI</div></div>
      <h1>Consultation Log</h1>
      <div class="header-meta">
        <span><strong>Department:</strong> ${sectionName}</span>
        <span><strong>Date:</strong> ${now}</span>
        <span><strong>Report ID:</strong> MC-${Date.now().toString(36).toUpperCase()}</span>
      </div>
    </div>`;

    html += `<div class="conv-title">Consultation Log</div>`;
    for (const msg of conversationSummary) {
      html += `<div class="conv-msg">
        <div class="conv-role${msg.role === 'AI Assistant' ? ' ai' : ''}">${msg.role} ${msg.time ? `· ${msg.time}` : ''}</div>`;
      if (msg.hasImage) html += `<div class="conv-image">Medical image attached</div>`;
      if (msg.text) html += `<div class="conv-text">${msg.text.replace(/[#*_`]/g, '')}</div>`;
      html += `</div>`;
    }

    html += `<div class="footer">
      This report is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.<br/>
      MedChat AI · Powered by MedGemma · ${date}
    </div></body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const messages = history[section];
  const hasMessages = messages.length > 0 || loading;

  return (
    <div className={`h-screen w-screen overflow-hidden font-sans ${theme === 'dark' ? 'bg-dark-900 text-slate-100' : 'bg-surface-light text-slate-900'}`}>
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 ${theme === 'dark'
          ? 'bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(43,127,255,0.06),transparent),radial-gradient(ellipse_60%_80%_at_90%_80%,rgba(16,185,129,0.04),transparent)]'
          : 'bg-[radial-gradient(ellipse_80%_60%_at_10%_20%,rgba(43,127,255,0.04),transparent),radial-gradient(ellipse_60%_80%_at_90%_80%,rgba(16,185,129,0.03),transparent)]'
        }`} />
        <div className="absolute inset-0 bg-grid" />
      </div>

      <div className="relative z-10 flex h-screen">
        <Sidebar
          section={section}
          setSection={(s) => { setSection(s); setSidebarOpen(false); }}
          theme={theme}
          toggleTheme={toggleTheme}
          clearChat={clearChat}
          messages={messages}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className="flex flex-col flex-1 min-w-0">
          <TopBar
            theme={theme}
            onMenuClick={() => setSidebarOpen(true)}
            onExport={exportPDF}
            hasMessages={messages.length > 0}
          />

          <main className="flex-1 flex flex-col min-h-0">
            {!hasMessages ? (
              <WelcomeScreen section={section} setSection={setSection} theme={theme} onPrompt={sendMessage} />
            ) : (
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scroll-smooth">
                {messages.map((msg, i) => (
                  <Message key={i} msg={msg} theme={theme} onCopy={() => showToast('Copied to clipboard!')} />
                ))}
                {loading && (
                  streamingText ? (
                    <Message
                      msg={{ role: 'assistant', text: streamingText }}
                      theme={theme}
                      onCopy={() => showToast('Copied to clipboard!')}
                    />
                  ) : (
                    <TypingIndicator theme={theme} />
                  )
                )}
              </div>
            )}

            <InputArea
              theme={theme}
              section={section}
              image={image}
              setImage={setImage}
              onSend={sendMessage}
              loading={loading}
            />
          </main>
        </div>
      </div>

      <Toast
        message={toast.message}
        show={toast.show}
        onClose={() => setToast({ show: false, message: '' })}
        theme={theme}
      />
    </div>
  );
}

function TypingIndicator({ theme }) {
  return (
    <div className="flex gap-3 max-w-[800px] w-full mx-auto animate-slide-in">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-[0_0_20px_rgba(43,127,255,0.12)]">AI</div>
      <div className={`px-5 py-4 rounded-2xl flex items-center gap-1.5 border ${theme === 'dark' ? 'bg-dark-800/40 border-white/[0.06] backdrop-blur-xl' : 'bg-white/60 border-slate-200/60 backdrop-blur-xl'}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-typing-bounce typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-typing-bounce typing-dot" />
        <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-typing-bounce typing-dot" />
      </div>
    </div>
  );
}

async function callAPIStream(text, image, section, prevHistory, onChunk) {
  const sec = SECTIONS[section];
  const messages = [{ role: 'system', content: sec.systemPrompt }];

  const recent = prevHistory.slice(-10);
  for (const msg of recent) {
    if (msg.role === 'user') {
      const content = [];
      if (msg.text) content.push({ type: 'text', text: msg.text });
      if (msg.image) content.push({ type: 'image_url', image_url: { url: msg.image } });
      messages.push({ role: 'user', content });
    } else if (msg.role === 'assistant') {
      messages.push({ role: 'assistant', content: msg.text });
    }
  }

  const currentContent = [];
  if (text) currentContent.push({ type: 'text', text });
  if (image) currentContent.push({ type: 'image_url', image_url: { url: image.base64 } });
  if (currentContent.length) messages.push({ role: 'user', content: currentContent });

  const MAX_RETRIES = 3;
  const body = JSON.stringify({ model: MODEL, messages, max_tokens: 2048, temperature: 0.7, stream: true });

  let res;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body,
    });

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const waitSec = Math.pow(2, attempt + 1);
      onChunk(`*Rate limited — retrying in ${waitSec}s... (attempt ${attempt + 2}/${MAX_RETRIES + 1})*`);
      await new Promise(r => setTimeout(r, waitSec * 1000));
      continue;
    }
    break;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onChunk(full);
        }
      } catch {}
    }
  }

  return full || 'No response received.';
}
