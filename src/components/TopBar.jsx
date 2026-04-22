export default function TopBar({ onMenuClick, theme, toggleTheme }) {
  const dark = theme === 'dark';

  return (
    <div className="flex items-center justify-between px-5 py-3 z-20 glass"
      style={{ background: dark ? 'rgba(19,27,46,0.8)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-xl md:hidden transition-colors hover:opacity-70">
          <span className="block w-4 h-[1.5px] rounded-full" style={{ background: 'var(--on-surface-variant)' }} />
          <span className="block w-4 h-[1.5px] rounded-full" style={{ background: 'var(--on-surface-variant)' }} />
          <span className="block w-4 h-[1.5px] rounded-full" style={{ background: 'var(--on-surface-variant)' }} />
        </button>
        <h1 className="text-base font-extrabold tracking-tight font-display" style={{ color: 'var(--primary)' }}>MedChat AI</h1>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--outline)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search diagnostics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
            style={{
              background: dark ? 'rgba(255,255,255,0.04)' : 'var(--surface-container)',
              color: 'var(--on-surface)',
              border: 'none',
              boxShadow: `inset 0 0 0 1px ${dark ? 'rgba(63,73,73,0.25)' : 'rgba(203,213,225,0.5)'}`,
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button onClick={toggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:opacity-70"
          style={{ color: 'var(--on-surface-variant)' }} title={dark ? 'Light mode' : 'Dark mode'}>
          {dark ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
        </button>

        {/* Profile */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: dark ? 'rgba(122,215,198,0.1)' : 'rgba(0,121,107,0.08)', color: 'var(--primary)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
