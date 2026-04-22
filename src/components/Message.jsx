import VoiceButton from './VoiceButton';

// Parse differential diagnosis lines: "**Condition** — XX% — explanation"
function parseDifferentialDiagnosis(text) {
  const lines = text.split('\n');
  const results = [];
  const colors = ['#7ad7c6', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa'];
  for (const line of lines) {
    const match = line.match(/\*\*(.+?)\*\*\s*[—–-]\s*(\d+)%\s*[—–-]\s*(.+)/);
    if (match) {
      results.push({ name: match[1].trim(), pct: parseInt(match[2]), detail: match[3].trim(), color: colors[results.length % colors.length] });
    }
  }
  return results.length >= 2 ? results : null;
}

// Probability bar chart component
function DiagnosisChart({ items, dark }) {
  return (
    <div className="my-4 p-5 rounded-2xl" style={{ background: dark ? 'rgba(122,215,198,0.04)' : 'rgba(0,121,107,0.03)', boxShadow: `inset 0 0 0 1px ${dark ? 'rgba(122,215,198,0.1)' : 'rgba(0,121,107,0.08)'}` }}>
      <div className="flex items-center gap-2 mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: 'var(--primary)' }}>
          <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
        </svg>
        <span className="text-xs font-bold uppercase tracking-wider font-display" style={{ color: 'var(--primary)' }}>Differential Diagnosis — Probability</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[0.8rem] font-bold" style={{ color: 'var(--on-surface)' }}>{item.name}</span>
              <span className="text-sm font-bold font-display" style={{ color: item.color }}>{item.pct}%</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${item.pct}%`, background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`, animation: `growBar 1s ease-out ${i * 0.15}s both` }} />
            </div>
            <p className="text-[0.7rem] mt-1 leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Message({ msg, theme, onCopy }) {
  const isUser = msg.role === 'user';
  const dark = theme === 'dark';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text).then(() => { if (onCopy) onCopy(); }).catch(() => {});
  };

  const isReport = !isUser && msg.text && (msg.text.includes('Diagnostic Report') || msg.text.includes('Differential Diagnosis'));

  // Parse differential diagnosis for chart
  const diffDx = !isUser && msg.text ? parseDifferentialDiagnosis(msg.text) : null;

  // Remove the raw differential lines from text if chart will be rendered
  let displayText = msg.text || '';
  if (diffDx && displayText) {
    // We'll let the markdown render the full text, but inject chart after
  }

  return (
    <div className={`flex gap-3 max-w-[800px] w-full mx-auto animate-slideIn ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 font-display"
        style={isUser
          ? { background: dark ? 'rgba(122,215,198,0.1)' : 'rgba(0,121,107,0.08)', color: 'var(--primary)' }
          : { background: 'linear-gradient(135deg, #7ad7c6, #006156)', color: 'white' }
        }>
        {isUser ? 'You' : 'AI'}
      </div>

      <div className="flex-1 min-w-0">
        <div className={`px-4 py-3 rounded-2xl text-[0.87rem] leading-relaxed break-words relative group ${isReport ? 'report-card' : ''}`}
          style={{
            background: isReport
              ? (dark ? 'rgba(122,215,198,0.03)' : 'rgba(0,121,107,0.03)')
              : isUser
                ? (dark ? 'rgba(122,215,198,0.06)' : 'rgba(0,121,107,0.05)')
                : 'var(--surface-container)',
            color: 'var(--on-surface)',
            boxShadow: !isUser ? `inset 0 0 0 1px ${dark ? 'rgba(63,73,73,0.15)' : 'rgba(203,213,225,0.3)'}` : 'none',
          }}>
          {!isUser && msg.text && (
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl px-1 py-0.5 backdrop-blur-xl"
              style={{ background: dark ? 'rgba(19,27,46,0.9)' : 'rgba(255,255,255,0.9)' }}>
              <VoiceButton text={msg.text} theme={theme} />
              <button onClick={handleCopy} title="Copy"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{ color: 'var(--outline)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          )}

          {msg.image && (
            <img src={msg.image} alt="Medical image" className="max-w-[280px] max-h-[280px] rounded-xl mb-2" />
          )}
          {msg.text && (
            <div className={`msg-content ${dark ? 'msg-dark' : ''}`} dangerouslySetInnerHTML={{ __html: formatMd(displayText) }} />
          )}

          {/* Differential Diagnosis Chart */}
          {diffDx && <DiagnosisChart items={diffDx} dark={dark} />}

          {isReport && (
            <div className="mt-3 pt-3 flex items-center gap-2 text-[0.7rem] font-bold font-display" style={{ borderTop: `1px solid ${dark ? 'rgba(122,215,198,0.1)' : 'rgba(0,121,107,0.1)'}`, color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              DIAGNOSTIC REPORT
            </div>
          )}
        </div>
        {msg.timestamp && (
          <div className={`text-[0.62rem] mt-1.5 px-1 ${isUser ? 'text-right' : ''}`} style={{ color: 'var(--outline)' }}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatMd(text) {
  let h = text;
  h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<div class="code-block"><div class="code-header"><span>${lang || 'code'}</span></div><pre><code>${code.trim()}</code></pre></div>`);
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  h = h.replace(/^---+$/gm, '<hr/>');
  h = h.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  h = h.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  h = h.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  h = h.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  h = h.replace(/^[-*] (.+)$/gm, '<li>$1</li>');
  h = h.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  h = h.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<ol') || p.startsWith('<pre') || p.startsWith('<div') || p.startsWith('<hr') || p.startsWith('<blockquote')) return p;
    return `<p>${p}</p>`;
  }).join('');
  h = h.replace(/\n/g, '<br/>');
  return h;
}
