export default function TopBar({ theme, onMenuClick, onExport, hasMessages }) {
  const dark = theme === 'dark';

  return (
    <div className={`flex items-center justify-between px-5 py-3 border-b z-20
      ${dark ? 'bg-dark-800/80 border-white/[0.06] backdrop-blur-xl' : 'bg-white/80 border-slate-200/60 backdrop-blur-xl'}`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className={`w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl md:hidden transition-colors
            ${dark ? 'hover:bg-white/[0.06]' : 'hover:bg-slate-100'}`}
        >
          <span className={`block w-4 h-[1.5px] rounded-full ${dark ? 'bg-slate-400' : 'bg-slate-600'}`} />
          <span className={`block w-4 h-[1.5px] rounded-full ${dark ? 'bg-slate-400' : 'bg-slate-600'}`} />
          <span className={`block w-4 h-[1.5px] rounded-full ${dark ? 'bg-slate-400' : 'bg-slate-600'}`} />
        </button>
        <h1 className="text-base font-bold md:hidden bg-gradient-to-r from-brand-500 to-emerald-500 bg-clip-text text-transparent">
          MedChat AI
        </h1>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <button
          onClick={onExport}
          disabled={!hasMessages}
          title="Export as PDF"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
            ${!hasMessages
              ? 'opacity-25 cursor-not-allowed'
              : dark
                ? 'text-slate-400 hover:text-brand-400 hover:bg-white/[0.06]'
                : 'text-slate-500 hover:text-brand-500 hover:bg-slate-100'
            }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </button>

        <button
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative
            ${dark ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500" />
        </button>

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ml-1
          ${dark ? 'bg-brand-500/15 text-brand-400' : 'bg-brand-100 text-brand-600'}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
