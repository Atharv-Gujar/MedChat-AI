import { SECTIONS, QUICK_PROMPTS } from '../config';
import { useLanguage } from '../contexts/LanguageContext';

const sectionIcons = {
  general: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
      <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="10" y1="11" x2="14" y2="11" />
    </svg>
  ),
  xray: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="10" r="3" />
      <path d="M8 17h8" /><path d="M10 14v3" /><path d="M14 14v3" />
    </svg>
  ),
  mri: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
      <path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" />
    </svg>
  ),
  ct: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-7 h-7">
      <ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
};

const iconBgColors = {
  general: 'bg-emerald-500/10 text-emerald-500',
  xray: 'bg-brand-500/10 text-brand-500',
  mri: 'bg-purple-500/10 text-purple-500',
  ct: 'bg-teal-500/10 text-teal-500',
};

export default function WelcomeScreen({ section, setSection, theme, onPrompt }) {
  const dark = theme === 'dark';
  const sec = SECTIONS[section];
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto animate-fade-in-up">
      <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-6 text-[0.72rem] font-semibold tracking-wide uppercase
        ${dark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-status-pulse" />
        {t('ai_core_active')}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          {t('welcome_title').split('MedChat AI')[0]}<span className="bg-gradient-to-r from-brand-500 to-emerald-500 bg-clip-text text-transparent">MedChat AI</span>
        </h2>
        <p className={`text-sm max-w-lg mx-auto leading-relaxed ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('welcome_subtitle')}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-10">
        <button
          onClick={() => onPrompt('I would like to start a consultation')}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5 transition-all"
        >
          {t('start_consultation')}
        </button>
        <button
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5
            ${dark ? 'border-white/[0.1] text-slate-300 hover:bg-white/[0.04]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          {t('view_recent_reports')}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-[820px] w-full mb-8">
        {Object.entries(SECTIONS).map(([key, s], i) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`group text-center p-5 rounded-2xl border transition-all duration-300 animate-card-enter card-delay-${i + 1}
              ${dark
                ? 'bg-dark-700/60 border-white/[0.06] hover:border-white/[0.12] hover:bg-dark-700'
                : 'bg-white border-slate-200/60 hover:border-slate-300 shadow-card hover:shadow-card-hover'
              }
              hover:-translate-y-1`}
          >
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${iconBgColors[key]}`}>
              {sectionIcons[key]}
            </div>
            <h3 className={`text-sm font-bold mb-1 ${dark ? 'text-white' : 'text-slate-800'}`}>{t({general:'general_medical',xray:'xray_analysis',mri:'mri_scan',ct:'ct_scan'}[key])}</h3>
            <p className={`text-[0.72rem] leading-relaxed ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{t({general:'general_desc',xray:'xray_desc',mri:'mri_desc',ct:'ct_desc'}[key])}</p>
          </button>
        ))}
      </div>

      <div className="max-w-[820px] w-full animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <div className={`flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-widest mb-3 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {t('try_asking')}
        </div>
        <div className="flex flex-wrap gap-2">
          {[t('quick_prompt_1'), t('quick_prompt_2'), t('quick_prompt_3'), t('quick_prompt_4')].map((p) => (
            <button
              key={p}
              onClick={() => onPrompt(p)}
              className={`inline-flex items-center px-4 py-2 rounded-full border text-xs font-medium transition-all
                ${dark
                  ? 'bg-dark-700/60 border-white/[0.06] text-slate-400 hover:text-white hover:bg-brand-500/[0.08] hover:border-brand-500/30'
                  : 'bg-white border-slate-200/60 text-slate-500 hover:text-brand-600 hover:bg-brand-50 hover:border-brand-200 shadow-sm'
                }
                hover:-translate-y-0.5`}
            >
              "{p}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
