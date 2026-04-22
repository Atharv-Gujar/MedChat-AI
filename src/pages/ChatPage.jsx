import { useState, useRef, useCallback, useEffect } from 'react';
import { SECTIONS } from '../config';
import InputArea from '../components/InputArea';
import Message from '../components/Message';
import SymptomChecker from '../components/SymptomChecker';
import Toast from '../components/Toast';
import { callAPIStream } from '../lib/api';
import { exportDiagnosis } from '../lib/export';
import { createChatSession, saveMessage, isSupabaseConfigured } from '../lib/supabase';

// Robust MCQ parser — handles raw JSON, markdown fenced, partial formats
function parseMCQ(text) {
  if (!text) return null;
  const cleaned = text.trim();

  const strategies = [
    () => JSON.parse(cleaned),
    () => { const m = cleaned.match(/```(?:mcq|json)?\s*([\s\S]*?)```/); return m ? JSON.parse(m[1].trim()) : null; },
    () => { const m = cleaned.match(/\{[\s\S]*?"question"\s*:\s*"[\s\S]*?\}/); return m ? JSON.parse(m[0]) : null; },
    () => { const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}'); if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1)); return null; },
  ];

  for (const strategy of strategies) {
    try {
      const parsed = strategy();
      if (parsed && parsed.question && parsed.options && Array.isArray(parsed.options) && parsed.options.length >= 2) {
        return { thinking: parsed.thinking || 'Analyzing symptoms', question: parsed.question, options: parsed.options.slice(0, 4), step: parsed.step || 1, totalSteps: parsed.totalSteps || 4 };
      }
    } catch (e) { /* try next */ }
  }
  return null;
}

function looksLikeMCQ(text) {
  if (!text) return false;
  const t = text.trim();
  return (t.startsWith('{') && t.includes('"question"')) || (t.startsWith('```') && t.includes('question')) || (t.startsWith('{') && t.includes('"thinking"'));
}

export default function ChatPage({ sectionKey, theme }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [mcqData, setMcqData] = useState(null);
  const chatRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sec = SECTIONS[sectionKey];
  const dark = theme === 'dark';

  // Reset session when section changes
  useEffect(() => { sessionIdRef.current = null; }, [sectionKey]);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; });
  }, []);
  useEffect(scrollDown, [messages, loading, streamingText, mcqData, scrollDown]);

  // Save message to Supabase (fire-and-forget)
  const persistMessage = (role, content, meta = {}) => {
    if (!sessionIdRef.current) return;
    saveMessage(sessionIdRef.current, role, content, null, meta).catch(() => {});
  };

  const sendMessage = async (text, isFromMCQ = false) => {
    if (!text.trim() && !image) return;

    // Create Supabase session on first message
    if (!sessionIdRef.current && isSupabaseConfigured()) {
      const session = await createChatSession(sectionKey, text.trim().slice(0, 80));
      if (session) sessionIdRef.current = session.id;
    }

    const userMsg = { role: 'user', text: text.trim(), image: image?.base64 || null, timestamp: new Date().toISOString(), isMcqAnswer: isFromMCQ };
    const img = image;
    setMessages(p => [...p, userMsg]);
    setImage(null); setLoading(true); setStreamingText('');

    // Persist user message
    persistMessage('user', text.trim(), { isMcqAnswer: isFromMCQ });

    try {
      const historyForAPI = messages.map(m => ({ role: m.role, text: m.rawText || m.text, image: m.image }));
      const reply = await callAPIStream(text.trim(), img, sectionKey, historyForAPI, (partial) => { setStreamingText(partial); scrollDown(); });

      const mcq = parseMCQ(reply);
      if (mcq) {
        setMcqData(mcq);
        setMessages(p => [...p, { role: 'assistant', text: '', rawText: reply, isMcq: true, mcqData: mcq, timestamp: new Date().toISOString() }]);
        persistMessage('assistant', reply, { type: 'mcq', step: mcq.step });
      } else {
        setMcqData(null);
        setMessages(p => [...p, { role: 'assistant', text: reply, rawText: reply, timestamp: new Date().toISOString() }]);
        persistMessage('assistant', reply, { type: reply.includes('Diagnostic Report') ? 'report' : 'chat' });
      }
      setStreamingText('');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMcqData(null);
      setMessages(p => [...p, { role: 'assistant', text: `**Error**: ${err.message}`, rawText: `Error: ${err.message}`, timestamp: new Date().toISOString() }]);
      setStreamingText('');
    } finally { setLoading(false); }
  };

  const handleMCQAnswer = (answer) => { setMcqData(null); sendMessage(answer, true); };
  const clearChat = () => { setMessages([]); setMcqData(null); sessionIdRef.current = null; window.speechSynthesis?.cancel(); };
  const handleExport = () => {
    if (!messages.length) { setToast({ show: true, message: 'No diagnosis to export' }); return; }
    const exportableMessages = messages.filter(m => m.text && !m.isMcq);
    exportDiagnosis(exportableMessages, sec.name);
    setToast({ show: true, message: 'Report generated!' });
  };

  // Only show non-MCQ messages
  const displayMessages = messages.filter(m => !m.isMcq && !m.isMcqAnswer);

  // Determine if streaming looks like MCQ (hide raw JSON)
  const isStreamingMCQ = looksLikeMCQ(streamingText);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ background: dark ? '#131b2e' : '#ffffff' }}>
        <div>
          <h2 className="text-lg font-bold font-display" style={{ color: 'var(--on-surface)' }}>{sec.name}</h2>
          <p className="text-xs" style={{ color: 'var(--outline)' }}>{sec.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button onClick={handleExport} className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5"
              style={{ background: 'linear-gradient(135deg, #7ad7c6, #006156)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export Diagnosis
            </button>
          )}
          <button onClick={clearChat} className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:opacity-70" style={{ color: 'var(--outline)' }}>Clear</button>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 scroll-smooth" style={{ background: 'var(--bg)' }}>
        {messages.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: dark ? 'rgba(122,215,198,0.06)' : 'rgba(0,121,107,0.06)', color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            </div>
            <h3 className="text-lg font-bold mb-1 font-display" style={{ color: 'var(--on-surface)' }}>{sec.name}</h3>
            <p className="text-sm max-w-md mb-6" style={{ color: 'var(--outline)' }}>Describe your symptoms and I'll guide you through a quick assessment.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {['I have a headache', 'My stomach hurts', 'I feel dizzy and tired', 'I have a sore throat'].map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)} className="prompt-pill">{p}</button>
              ))}
            </div>
          </div>
        )}

        {displayMessages.map((msg, i) => (
          <Message key={i} msg={msg} theme={theme} onCopy={() => setToast({ show: true, message: 'Copied!' })} />
        ))}

        {/* MCQ UI */}
        {mcqData && !loading && (
          <SymptomChecker mcqData={mcqData} onAnswer={handleMCQAnswer} theme={theme} />
        )}

        {/* Loading indicator — HIDE if streaming looks like MCQ */}
        {loading && streamingText && !isStreamingMCQ && (
          <Message msg={{ role: 'assistant', text: streamingText }} theme={theme} onCopy={() => {}} />
        )}

        {/* Show "Preparing question..." when MCQ is being streamed */}
        {loading && isStreamingMCQ && (
          <div className="flex gap-4 max-w-[800px] w-full mx-auto animate-fadeIn">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #7ad7c6, #006156)' }}>AI</div>
            <div className="px-5 py-4 rounded-2xl flex items-center gap-3" style={{ background: 'var(--surface-container)' }}>
              <div className="w-4 h-4 border-2 border-t-[var(--primary)] rounded-full animate-spin" style={{ borderColor: 'var(--outline-variant)', borderTopColor: 'var(--primary)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>Preparing assessment question...</span>
            </div>
          </div>
        )}

        {/* Generic loading dots */}
        {loading && !streamingText && (
          <div className="flex gap-3 max-w-[800px] w-full mx-auto">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #7ad7c6, #006156)' }}>AI</div>
            <div className="px-5 py-4 rounded-2xl flex items-center gap-2" style={{ background: 'var(--surface-container)' }}>
              {[0,.15,.3].map((d,i) => <div key={i} className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--primary)', animationDelay: `${d}s` }}/>)}
            </div>
          </div>
        )}
      </div>

      {!mcqData && (
        <InputArea theme={theme} section={sectionKey} image={image} setImage={setImage} onSend={sendMessage} loading={loading} />
      )}
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ show: false, message: '' })} theme={theme} />
    </div>
  );
}
