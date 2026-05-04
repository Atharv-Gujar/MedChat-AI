import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SECTIONS } from '../config';
import { listChatSessions, getMessages, deleteChatSession, isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Toast from '../components/Toast';

const sectionColors = {
  general: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', text: '#34d399', label: 'General' },
  research: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', text: '#60a5fa', label: 'Research' },
  xray: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', text: '#60a5fa', label: 'X-Ray' },
  mri: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', text: '#c084fc', label: 'MRI' },
  ct: { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)', text: '#2dd4bf', label: 'CT Scan' },
};

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function highlightMatch(text, query) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-400/30 text-inherit rounded px-0.5">{part}</mark> : part
  );
}

export default function HistoryPage({ theme }) {
  const dark = theme === 'dark';
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [expandedSession, setExpandedSession] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchInMessages, setSearchInMessages] = useState(false);
  const [messageSearchResults, setMessageSearchResults] = useState([]);
  const [searchingMessages, setSearchingMessages] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Load all sessions
  const loadSessions = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await listChatSessions();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Filter sessions by section and title search
  const filteredSessions = sessions.filter(s => {
    if (filterSection !== 'all' && s.section !== filterSection) return false;
    if (searchQuery && !searchInMessages) {
      return (s.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Deep search in messages
  useEffect(() => {
    if (!searchQuery || !searchInMessages || !supabase) {
      setMessageSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingMessages(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('session_id, role, content, created_at')
          .ilike('content', `%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          // Group by session_id
          const grouped = {};
          data.forEach(msg => {
            if (!grouped[msg.session_id]) grouped[msg.session_id] = [];
            grouped[msg.session_id].push(msg);
          });
          setMessageSearchResults(grouped);
        }
      } catch (err) {
        console.error('Message search failed:', err);
      }
      setSearchingMessages(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, searchInMessages]);

  // Get sessions that match message search
  const messageMatchSessionIds = Object.keys(messageSearchResults);
  const displaySessions = searchInMessages && searchQuery
    ? filteredSessions.filter(s => messageMatchSessionIds.includes(s.id) || (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredSessions;

  // Expand a session to see its messages
  const toggleSession = async (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      setExpandedMessages([]);
      return;
    }
    setExpandedSession(sessionId);
    setLoadingMessages(true);
    try {
      const msgs = await getMessages(sessionId);
      setExpandedMessages(msgs || []);
    } catch {
      setExpandedMessages([]);
    }
    setLoadingMessages(false);
  };

  const handleDelete = async (sessionId) => {
    const ok = await deleteChatSession(sessionId);
    if (ok) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setSelectedIds(prev => { const n = new Set(prev); n.delete(sessionId); return n; });
      if (expandedSession === sessionId) { setExpandedSession(null); setExpandedMessages([]); }
      setToast({ show: true, message: 'Session deleted' });
    }
    setDeleteConfirm(null);
  };

  // Selection helpers
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(displaySessions.map(s => s.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    let deleted = 0;
    for (const id of selectedIds) {
      const ok = await deleteChatSession(id);
      if (ok) deleted++;
    }
    setSessions(prev => prev.filter(s => !selectedIds.has(s.id)));
    if (selectedIds.has(expandedSession)) { setExpandedSession(null); setExpandedMessages([]); }
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
    setBulkDeleting(false);
    setSelectMode(false);
    setToast({ show: true, message: `${deleted} session${deleted !== 1 ? 's' : ''} deleted` });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
    setBulkDeleteConfirm(false);
  };

  // Count sessions per section for filter badges
  const sectionCounts = {};
  sessions.forEach(s => { sectionCounts[s.section] = (sectionCounts[s.section] || 0) + 1; });

  // Check if a session has a diagnosis report
  const hasDiagnosis = (session) => {
    if (messageSearchResults[session.id]) {
      return messageSearchResults[session.id].some(m => m.content?.includes('Diagnostic Report') || m.content?.includes('SOAP Note'));
    }
    return false;
  };

  const allSelected = displaySessions.length > 0 && displaySessions.every(s => selectedIds.has(s.id));

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4" style={{ background: dark ? '#131b2e' : '#ffffff' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display" style={{ color: 'var(--on-surface)' }}>
              {t('history_title') || 'Conversation History'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--outline)' }}>
              {sessions.length} {sessions.length === 1 ? (t('session_saved') || 'session saved') : (t('sessions_saved') || 'sessions saved')}
            </p>
          </div>

          {/* Select / bulk actions */}
          <div className="flex items-center gap-2">
            {selectMode ? (
              <>
                <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                  {selectedIds.size} {t('selected') || 'selected'}
                </span>
                <button onClick={allSelected ? deselectAll : selectAll}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200"
                  style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                  {allSelected ? (t('deselect_all') || 'Deselect All') : (t('select_all') || 'Select All')}
                </button>
                {selectedIds.size > 0 && (
                  bulkDeleteConfirm ? (
                    <div className="flex items-center gap-1">
                      <button onClick={handleBulkDelete} disabled={bulkDeleting}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all duration-200"
                        style={{ background: bulkDeleting ? '#666' : '#ef4444' }}>
                        {bulkDeleting ? (t('deleting') || 'Deleting...') : `${t('delete') || 'Delete'} ${selectedIds.size}`}
                      </button>
                      <button onClick={() => setBulkDeleteConfirm(false)}
                        className="px-2 py-1.5 rounded-xl text-[11px] font-bold hover:opacity-70" style={{ color: 'var(--outline)' }}>
                        {t('cancel') || 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setBulkDeleteConfirm(true)}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200 flex items-center gap-1"
                      style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      {t('delete') || 'Delete'}
                    </button>
                  )
                )}
                <button onClick={exitSelectMode}
                  className="px-2 py-1.5 rounded-xl text-[11px] font-bold hover:opacity-70" style={{ color: 'var(--outline)' }}>
                  {t('cancel') || 'Cancel'}
                </button>
              </>
            ) : (
              sessions.length > 0 && (
                <button onClick={() => setSelectMode(true)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200 hover:opacity-80"
                  style={{ borderColor: 'var(--outline-variant)', color: 'var(--outline)' }}>
                  {t('select') || 'Select'}
                </button>
              )
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--outline)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchInMessages ? (t('search_messages') || 'Search inside conversations...') : (t('search_title') || 'Search by session title...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 border"
              style={{
                background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                borderColor: searchQuery ? 'var(--primary)' : 'var(--outline-variant)',
                color: 'var(--on-surface)',
              }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
                style={{ color: 'var(--outline)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Deep search toggle */}
          <button onClick={() => setSearchInMessages(!searchInMessages)}
            className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border flex items-center gap-1.5 shrink-0"
            style={{
              background: searchInMessages ? (dark ? 'rgba(122,215,198,0.1)' : 'rgba(0,121,107,0.06)') : 'transparent',
              borderColor: searchInMessages ? 'var(--primary)' : 'var(--outline-variant)',
              color: searchInMessages ? 'var(--primary)' : 'var(--outline)',
            }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {searchInMessages ? (t('deep_search_on') || 'Deep Search ON') : (t('search_in_messages') || 'Search in Messages')}
          </button>
        </div>

        {/* Section filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setFilterSection('all')}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 border"
            style={{
              background: filterSection === 'all' ? (dark ? 'rgba(122,215,198,0.1)' : 'rgba(0,121,107,0.06)') : 'transparent',
              borderColor: filterSection === 'all' ? 'var(--primary)' : 'var(--outline-variant)',
              color: filterSection === 'all' ? 'var(--primary)' : 'var(--outline)',
            }}>
            {t('all') || 'All'} ({sessions.length})
          </button>
          {Object.entries(sectionColors).map(([key, sc]) => (
            sectionCounts[key] > 0 && (
              <button key={key} onClick={() => setFilterSection(filterSection === key ? 'all' : key)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 border"
                style={{
                  background: filterSection === key ? sc.bg : 'transparent',
                  borderColor: filterSection === key ? sc.border : 'var(--outline-variant)',
                  color: filterSection === key ? sc.text : 'var(--outline)',
                }}>
                {sc.label} ({sectionCounts[key]})
              </button>
            )
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-2" style={{ background: 'var(--bg)' }}>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3" style={{ color: 'var(--outline)' }}>
              <div className="w-5 h-5 border-2 border-t-[var(--primary)] rounded-full animate-spin" style={{ borderColor: 'var(--outline-variant)', borderTopColor: 'var(--primary)' }} />
              <span className="text-sm">{t('loading_sessions') || 'Loading sessions...'}</span>
            </div>
          </div>
        ) : displaySessions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: dark ? 'rgba(122,215,198,0.06)' : 'rgba(0,121,107,0.06)', color: 'var(--primary)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-1 font-display" style={{ color: 'var(--on-surface)' }}>
              {searchQuery ? (t('no_results') || 'No results found') : (t('no_conversations') || 'No conversations yet')}
            </h3>
            <p className="text-sm max-w-md" style={{ color: 'var(--outline)' }}>
              {searchQuery ? (t('try_different') || 'Try a different search term or disable filters.') : (t('start_history_hint') || 'Start a consultation to see your history here.')}
            </p>
          </div>
        ) : (
          displaySessions.map(session => {
            const sc = sectionColors[session.section] || sectionColors.general;
            const isExpanded = expandedSession === session.id;
            const msgMatches = messageSearchResults[session.id] || [];

            return (
              <div key={session.id}
                className="rounded-2xl border transition-all duration-200"
                style={{
                  background: dark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                  borderColor: isExpanded ? sc.border : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                }}>
                {/* Session Header */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => selectMode ? toggleSelect(session.id) : toggleSession(session.id)}>
                  {/* Checkbox in select mode */}
                  {selectMode && (
                    <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 cursor-pointer"
                      style={{
                        borderColor: selectedIds.has(session.id) ? 'var(--primary)' : 'var(--outline-variant)',
                        background: selectedIds.has(session.id) ? 'var(--primary)' : 'transparent',
                      }}>
                      {selectedIds.has(session.id) && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-3 h-3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Section badge */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: sc.bg, color: sc.text }}>
                    {sc.label[0]}
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--on-surface)' }}>
                      {highlightMatch(session.title || `${sc.label} Session`, searchQuery)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ background: sc.bg, color: sc.text }}>
                        {sc.label}
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--outline)' }}>
                        {timeAgo(session.updated_at || session.created_at)}
                      </span>
                      {msgMatches.length > 0 && searchQuery && searchInMessages && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24' }}>
                          {msgMatches.length} {msgMatches.length > 1 ? (t('matches') || 'matches') : (t('match') || 'match')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Delete */}
                    {deleteConfirm === session.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(session.id); }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10">
                          {t('delete') || 'Delete'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold hover:opacity-70" style={{ color: 'var(--outline)' }}>
                          {t('cancel') || 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(session.id); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70"
                        style={{ color: 'var(--outline)' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    )}

                    {/* Expand arrow */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--outline)' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Messages */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-6">
                        <div className="w-4 h-4 border-2 border-t-[var(--primary)] rounded-full animate-spin" style={{ borderColor: 'var(--outline-variant)', borderTopColor: 'var(--primary)' }} />
                      </div>
                    ) : expandedMessages.length === 0 ? (
                      <p className="text-xs py-4 text-center" style={{ color: 'var(--outline)' }}>{t('no_messages') || 'No messages in this session.'}</p>
                    ) : (
                      <div className="flex flex-col gap-2 pt-3 max-h-[400px] overflow-y-auto">
                        {expandedMessages.map((msg, i) => {
                          const isUser = msg.role === 'user';
                          const isDiagnosis = msg.content?.includes('Diagnostic Report') || msg.content?.includes('SOAP Note');
                          return (
                            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                                style={{
                                  background: isUser
                                    ? 'linear-gradient(135deg, #7ad7c6, #006156)'
                                    : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                                  color: isUser ? '#ffffff' : 'var(--on-surface)',
                                  border: isDiagnosis ? `1px solid ${sc.border}` : 'none',
                                }}>
                                {isDiagnosis && (
                                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3" style={{ color: sc.text }}>
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <span className="font-bold text-[10px]" style={{ color: sc.text }}>{t('diagnostic_report_label') || 'Diagnostic Report'}</span>
                                  </div>
                                )}
                                <p className="whitespace-pre-wrap break-words">
                                  {highlightMatch(
                                    msg.content?.length > 500 && !isDiagnosis
                                      ? msg.content.slice(0, 500) + '...'
                                      : msg.content || '',
                                    searchQuery
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Searching indicator */}
        {searchingMessages && (
          <div className="flex items-center justify-center py-3">
            <div className="flex items-center gap-2" style={{ color: 'var(--outline)' }}>
              <div className="w-3 h-3 border-2 border-t-[var(--primary)] rounded-full animate-spin" style={{ borderColor: 'var(--outline-variant)', borderTopColor: 'var(--primary)' }} />
              <span className="text-xs">{t('searching_messages') || 'Searching messages...'}</span>
            </div>
          </div>
        )}
      </div>

      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ show: false, message: '' })} theme={theme} />
    </div>
  );
}
