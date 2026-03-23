import { useEffect } from 'react';

export default function Toast({ message, show, onClose, theme }) {
  const dark = theme === 'dark';

  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2500);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
      <div className={`px-5 py-2.5 rounded-xl text-sm font-medium border backdrop-blur-2xl shadow-2xl
        ${dark
          ? 'bg-dark-800/90 border-white/[0.08] text-emerald-400'
          : 'bg-white/90 border-slate-200/60 text-emerald-600 shadow-card'
        }`}>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {message}
        </div>
      </div>
    </div>
  );
}
