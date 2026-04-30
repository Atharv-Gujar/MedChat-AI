import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ theme }) {
  const dark = theme === 'dark';
  const { t } = useLanguage();
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (tab === 'signin') {
        await signIn(email, password);
        navigate('/', { replace: true });
      } else if (tab === 'signup') {
        await signUp(email, password, fullName);
        setSuccess(t('account_created'));
        setTab('signin');
      } else if (tab === 'reset') {
        await resetPassword(email);
        setSuccess(t('reset_sent'));
        setTab('signin');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex w-[45%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0b1326 0%, #171f33 35%, #006156 100%)' }}>
        {/* Ambient decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(122,215,198,0.08) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,97,86,0.12) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white animate-glow"
              style={{ background: 'linear-gradient(135deg, #7ad7c6, #006156)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="10" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white font-display">MedChat AI</h1>
              <span className="text-xs font-semibold" style={{ color: '#7ad7c6' }}>{t('clinical_platform')}</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          {[
            { icon: '🔬', title: t('multi_modal'), desc: t('multi_modal_desc') },
            { icon: '📄', title: t('rag_insights'), desc: t('rag_desc') },
            { icon: '🛡️', title: t('secure_private'), desc: t('secure_desc') },
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-4 animate-fadeIn" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: 'rgba(122,215,198,0.08)' }}>{f.icon}</div>
              <div>
                <h3 className="text-sm font-bold text-white font-display">{f.title}</h3>
                <p className="text-xs text-white/50 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 text-xs text-white/30">
          {t('auth_disclaimer')}
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white animate-glow"
              style={{ background: 'linear-gradient(135deg, #7ad7c6, #006156)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M12 2a3 3 0 0 0-3 3v1H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3V5a3 3 0 0 0-3-3z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="10" y1="11" x2="14" y2="11" />
              </svg>
            </div>
            <h1 className="text-xl font-extrabold font-display" style={{ color: 'var(--on-surface)' }}>MedChat AI</h1>
          </div>

          {/* Tab Switcher */}
          {tab !== 'reset' && (
            <div className="flex rounded-2xl p-1 mb-6"
              style={{ background: dark ? 'var(--surface-container)' : 'var(--surface-container)' }}>
              {['signin', 'signup'].map(tabKey => (
                <button key={tabKey} onClick={() => { setTab(tabKey); setError(''); setSuccess(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold font-display transition-all duration-300"
                  style={{
                    background: tab === tabKey ? (dark ? 'var(--surface-highest)' : '#ffffff') : 'transparent',
                    color: tab === tabKey ? 'var(--primary)' : 'var(--outline)',
                    boxShadow: tab === tabKey ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  }}>
                  {tabKey === 'signin' ? t('sign_in') : t('sign_up')}
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold font-display" style={{ color: 'var(--on-surface)' }}>
              {tab === 'signin' ? t('welcome_back') : tab === 'signup' ? t('create_account') : t('reset_password')}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--outline)' }}>
              {tab === 'signin' ? t('sign_in_desc') : tab === 'signup' ? t('sign_up_desc') : t('reset_desc')}
            </p>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 animate-fadeIn"
              style={{ background: dark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)', color: '#ef4444' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 animate-fadeIn"
              style={{ background: dark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)', color: '#10b981' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-display" style={{ color: 'var(--outline)' }}>{t('full_name')}</label>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--outline)' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Dr. John Doe" className="auth-input pl-11" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-display" style={{ color: 'var(--outline)' }}>{t('email_address')}</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--outline)' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email" required className="auth-input pl-11" />
              </div>
            </div>

            {tab !== 'reset' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-display" style={{ color: 'var(--outline)' }}>{t('password')}</label>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--outline)' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required minLength={6} className="auth-input pl-11 pr-11" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                    style={{ color: 'var(--outline)' }}>
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {tab === 'signin' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setTab('reset'); setError(''); setSuccess(''); }}
                  className="text-xs font-semibold transition-colors hover:opacity-70" style={{ color: 'var(--primary)' }}>
                  {t('forgot_password')}
                </button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl text-sm font-bold font-display text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7ad7c6, #006156)', boxShadow: '0 4px 20px rgba(122,215,198,0.2)' }}>
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {tab === 'signin' ? t('sign_in') : tab === 'signup' ? t('create_account') : t('send_reset_link')}
            </button>
          </form>

          {/* Divider + Google Auth */}
          {tab !== 'reset' && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--outline)' }}>{t('or_continue')}</span>
                <div className="flex-1 h-px" style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }} />
              </div>

              <button
                onClick={async () => {
                  setGoogleLoading(true); setError('');
                  try { await signInWithGoogle(); }
                  catch (err) { setError(err.message || 'Google sign-in failed'); setGoogleLoading(false); }
                }}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-bold font-display transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  background: dark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                  color: 'var(--on-surface)',
                  boxShadow: `inset 0 0 0 1px ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
                }}>
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-t-[var(--primary)] rounded-full animate-spin" style={{ borderColor: 'var(--outline-variant)', borderTopColor: 'var(--primary)' }} />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {t('continue_google')}
              </button>
            </div>
          )}

          {tab === 'reset' && (
            <button onClick={() => { setTab('signin'); setError(''); setSuccess(''); }}
              className="w-full mt-4 py-2 text-sm font-semibold transition-colors" style={{ color: 'var(--outline)' }}>
              {t('back_signin')}
            </button>
          )}

          <p className="text-center text-xs mt-6" style={{ color: 'var(--outline)' }}>
            {tab === 'signin' ? t('no_account') + ' ' : t('have_account') + ' '}
            <button onClick={() => { setTab(tab === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
              className="font-bold transition-colors hover:opacity-70" style={{ color: 'var(--primary)' }}>
              {tab === 'signin' ? t('sign_up') : t('sign_in')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
