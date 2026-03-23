import { SECTIONS } from '../config';

const icons = {
  general: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="10" y1="11" x2="14" y2="11" />
    </svg>
  ),
  xray: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="10" r="3" />
      <path d="M8 17h8" /><path d="M10 14v3" /><path d="M14 14v3" />
    </svg>
  ),
  mri: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
      <path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" />
    </svg>
  ),
  ct: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
};

export default function Sidebar({ section, setSection, theme, toggleTheme, clearChat, messages = [], open, onClose }) {
  const dark = theme === 'dark';

  return (
    <aside className={`
      w-[260px] min-w-[260px] h-screen flex flex-col z-30 transition-transform duration-300
      border-r shadow-sidebar
      ${dark ? 'bg-dark-800 border-white/[0.06]' : 'bg-white border-slate-200/60'}
      max-md:fixed max-md:left-0 max-md:top-0 max-md:shadow-2xl
      ${open ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}
    `}>
      <div className={`flex items-center gap-3 px-5 pt-5 pb-4`}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-emerald-500 flex items-center justify-center text-white shadow-lg animate-pulse-glow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h1 className="text-[1rem] font-bold bg-gradient-to-r from-brand-500 to-emerald-500 bg-clip-text text-transparent leading-tight">MedChat AI</h1>
          <span className={`text-[0.62rem] font-medium ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Powered by MedGemma</span>
        </div>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className={`text-[0.62rem] font-semibold uppercase tracking-[0.12em] px-2 pb-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>Diagnostics</div>

        {Object.entries(SECTIONS).map(([key, s]) => {
          const active = key === section;
          return (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-left relative
                ${active
                  ? dark
                    ? 'bg-brand-500/[0.08] text-white'
                    : 'bg-brand-50 text-brand-600'
                  : dark
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
            >
              {active && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${dark ? 'bg-brand-500' : 'bg-brand-500'}`} />
              )}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                ${active
                  ? dark ? 'bg-brand-500/15 text-brand-400' : 'bg-brand-100 text-brand-600'
                  : dark ? 'bg-white/[0.04] text-slate-500' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {icons[key]}
              </div>
              <span className="text-[0.82rem] font-medium">{s.name}</span>
            </button>
          );
        })}
      </nav>

      <div className={`px-3 pb-3 space-y-1`}>
        <button
          onClick={clearChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
            bg-gradient-to-r from-brand-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-brand-500/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Analysis
        </button>

        <button
          onClick={clearChat}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
            ${dark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/[0.06]' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50'}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14H7L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </div>
          <span className="text-[0.82rem] font-medium">Clear Chat</span>
        </button>

        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
            ${dark ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </div>
          <span className="text-[0.82rem] font-medium">{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className={`flex items-start gap-1.5 px-3 pt-2 text-[0.6rem] leading-relaxed ${dark ? 'text-slate-600' : 'text-slate-400'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          For informational purposes only. Not a substitute for professional medical advice.
        </div>
      </div>
    </aside>
  );
}
