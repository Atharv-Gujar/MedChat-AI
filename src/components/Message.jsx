import VoiceButton from './VoiceButton';

export default function Message({ msg, theme, onCopy }) {
  const dark = theme === 'dark';
  const isUser = msg.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text).then(() => {
      if (onCopy) onCopy();
    }).catch(() => {});
  };

  const isReport = !isUser && msg.text && msg.text.includes('Diagnostic Report');

  return (
    <div className={`flex gap-3 max-w-[800px] w-full mx-auto animate-slide-in ${isUser ? 'flex-row-reverse' : ''}`}>

      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0
        ${isUser
          ? dark ? 'bg-white/10 text-slate-400' : 'bg-brand-100 text-brand-600'
          : 'bg-gradient-to-br from-brand-500 to-emerald-500 text-white shadow-[0_0_20px_rgba(43,127,255,0.12)]'
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </div>


      <div className="flex-1 min-w-0">
        <div className={`px-4 py-3 rounded-2xl text-[0.87rem] leading-relaxed break-words border relative group
          ${isReport
            ? dark
              ? 'bg-gradient-to-br from-brand-500/[0.08] to-emerald-500/[0.05] border-brand-500/20 backdrop-blur-xl report-card'
              : 'bg-gradient-to-br from-brand-500/[0.05] to-emerald-500/[0.03] border-brand-200/40 backdrop-blur-xl report-card'
            : isUser
              ? dark
                ? 'bg-gradient-to-br from-brand-500/15 to-emerald-500/10 border-brand-500/20 text-slate-100'
                : 'bg-gradient-to-br from-brand-500/[0.07] to-emerald-500/[0.04] border-brand-200/40 text-slate-800'
              : dark
                ? 'bg-dark-700/60 border-white/[0.06] text-slate-200 backdrop-blur-xl'
                : 'bg-white border-slate-200/60 text-slate-700 shadow-card'
          }`}
        >

          {!isUser && msg.text && (
            <div className={`absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${dark ? 'bg-dark-800/80' : 'bg-white/80'} rounded-lg px-1 py-0.5 backdrop-blur-xl`}>
              <VoiceButton text={msg.text} theme={theme} />
              <button
                onClick={handleCopy}
                title="Copy message"
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all
                  ${dark ? 'text-slate-500 hover:text-emerald-400 hover:bg-white/[0.06]' : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-100'}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
            </div>
          )}

          {msg.image && (
            <img
              src={msg.image}
              alt="Uploaded medical image"
              className={`max-w-[280px] max-h-[280px] rounded-xl mb-2 border ${dark ? 'border-white/10' : 'border-slate-200'}`}
            />
          )}
          {msg.text && (
            <div className={`msg-content ${dark ? 'text-slate-300' : 'text-slate-600'}`} dangerouslySetInnerHTML={{ __html: formatMd(msg.text) }} />
          )}


          {isReport && (
            <div className={`mt-3 pt-3 border-t flex items-center gap-2 text-[0.7rem] font-semibold
              ${dark ? 'border-white/[0.06] text-brand-400' : 'border-slate-200/60 text-brand-500'}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              DIAGNOSTIC REPORT
            </div>
          )}
        </div>
        {msg.timestamp && (
          <div className={`text-[0.64rem] mt-1.5 px-1 ${dark ? 'text-slate-600' : 'text-slate-400'} ${isUser ? 'text-right' : ''}`}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatMd(text) {
  let h = text;

  h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<div class="code-block"><div class="code-header"><span>${lang || 'code'}</span></div><pre><code>${code.trim()}</code></pre></div>`;
  });

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
