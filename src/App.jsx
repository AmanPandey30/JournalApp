import React, { useState, useEffect, useCallback, useMemo } from 'react';
import JournalCard from './components/JournalCard';
import Auth from './components/Auth';
import WeatherWidget from './components/WeatherWidget';
import ProfileModal from './components/ProfileModal';
import { ActivityHeatmap, SearchBar, ExportButton } from './components/AdvancedFeatures';
import ChatWidget from './components/ChatWidget';
import api from './api/api';



const WRITING_PROMPTS = [
  "What was the best moment of today?",
  "What are you proud of today?",
  "What new thing did you learn this week?",
  "What has been on your mind lately?",
  "Write one highlight and one challenge from today.",
  "If tomorrow is a fresh start, what would you do differently?",
  "What are you grateful for today?",
  "What is a small win from today you might have overlooked?",
];

const QUOTES = [
  { text: "The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks.", author: "Mark Twain" },
  { text: "Writing is the painting of the voice.", author: "Voltaire" },
  { text: "Journal writing is a voyage to the interior.", author: "Christina Baldwin" },
  { text: "Fill your paper with the breathings of your heart.", author: "William Wordsworth" },
  { text: "In the journal I am at ease.", author: "Anaïs Nin" },
  { text: "Unexpressed emotions will never die. They are buried alive and will come forth later in uglier ways.", author: "Sigmund Freud" },
  { text: "Start writing, no matter what. The water does not flow until the faucet is turned on.", author: "Louis L'Amour" },
];

// ── Helpers ───────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)   return { text: 'Good Night',     emoji: '🌙' };
  if (h < 12)  return { text: 'Good Morning',   emoji: '☀️' };
  if (h < 17)  return { text: 'Good Afternoon', emoji: '🌤️' };
  return               { text: 'Good Evening',   emoji: '🌆' };
};

const formatDate = (ds) => {
  if (!ds) return '';
  return new Date(ds).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
};

const getDayOfYear = () => {
  const now = new Date(), start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
};

const getTodayStr = () => new Date().toLocaleDateString('en-CA');

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [loggedIn,  setLoggedIn]  = useState(!!localStorage.getItem('token'));
  const [username,  setUsername]  = useState(localStorage.getItem('username') || '');
  const [entries,   setEntries]   = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [apiError,  setApiError]  = useState('');

  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [formTitle,    setFormTitle]    = useState('');
  const [formContent,  setFormContent]  = useState('');
  const [suggestion,   setSuggestion]   = useState('');
  const [saving,       setSaving]       = useState(false);
  const [isListening,  setIsListening]  = useState(false);


  const [searchQuery,  setSearchQuery]  = useState('');
  const [showProfile,  setShowProfile]  = useState(false);
  const [activeTab,    setActiveTab]    = useState('journal'); // 'journal' | 'analytics'

  const todayQuote  = useMemo(() => QUOTES[getDayOfYear() % QUOTES.length], []);
  const todayPrompt = useMemo(() => WRITING_PROMPTS[getDayOfYear() % WRITING_PROMPTS.length], []);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchEntries = useCallback(async () => {
    setLoading(true); setApiError('');
    try {
      const res = await api.get('/journal');
      setEntries(res.data || []);
    } catch (err) {
      if (err.response?.status === 404) setEntries([]);
      else setApiError('Failed to load entries. Is the backend running?');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (loggedIn) fetchEntries(); }, [loggedIn, fetchEntries]);

  // ── Smart Suggestion AI ────────────────────────────────────────────────
  useEffect(() => {
    if (!loggedIn || !isFormOpen || formContent.length < 10) { setSuggestion(''); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.post('/ai/suggest', { text: formContent });
        setSuggestion(res.data.suggestion);
      } catch(e) {}
    }, 1500);
    return () => clearTimeout(t);
  }, [formContent, isFormOpen, loggedIn]);

  // ── Auth ───────────────────────────────────────────────────────────────
  const handleLoginSuccess = (name) => { setUsername(name); setLoggedIn(true); };
  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('username');
    setLoggedIn(false); setUsername(''); setEntries([]);
  };

  // ── CRUD ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim()) { alert('Please fill in both the title and content!'); return; }
    setSaving(true);
    try {
      await api.post('/journal', { title: formTitle, content: formContent });
      setFormTitle(''); setFormContent(''); setIsFormOpen(false);
      await fetchEntries();
    } catch (err) { alert('Failed to save: ' + (err.response?.data || err.message)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await api.delete(`/journal/id/${id}`);
      setEntries(p => p.filter(e => e.id !== id));
    } catch (err) {
      const status = err.response?.status;
      const msg = JSON.stringify(err.response?.data) || err.message;
      alert(`Delete failed (${status}): ${msg}`);
    }
  };

  const handleUpdate = (id, updated) => {
    setEntries(p => p.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  // ── Voice to Text ──────────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (isListening) {
      if (window._recognition) window._recognition.stop();
      setIsListening(false); return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser does not support Voice-to-Text.");
    const recognition = new SpeechRecognition();
    recognition.continuous = true; recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const finalTranscript = Array.from(event.results)
        .slice(event.resultIndex).filter(r => r.isFinal)
        .map(r => r[0].transcript).join(' ');
      if (finalTranscript) setFormContent(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + finalTranscript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    window._recognition = recognition; recognition.start();
  }, [isListening]);

  // ── Derived ────────────────────────────────────────────────────────────
  const todayCount = useMemo(() =>
    entries.filter(e => e.date && new Date(e.date).toLocaleDateString('en-CA') === getTodayStr()).length
  , [entries]);

  const totalWords = useMemo(() =>
    entries.reduce((s, e) => s + (e.content?.split(/\s+/).filter(Boolean).length || 0), 0)
  , [entries]);

  // streak
  const streak = useMemo(() => {
    const dateSet = new Set(entries.filter(e=>e.date).map(e=>new Date(e.date).toLocaleDateString('en-CA')));
    let count = 0;
    const d = new Date(); d.setHours(0,0,0,0);
    while (dateSet.has(d.toLocaleDateString('en-CA'))) {
      count++; d.setDate(d.getDate()-1);
    }
    return count;
  }, [entries]);

  // filtered + searched
  const filteredEntries = useMemo(() => {
    let list = entries;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.title?.toLowerCase().includes(q) || e.content?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, searchQuery]);

  const { text: greetText, emoji: greetEmoji } = getGreeting();

  if (!loggedIn) return <Auth onLoginSuccess={handleLoginSuccess} />;

  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="flex min-h-screen" style={{ background: '#080b12' }}>

      {/* ════════ SIDEBAR ════════ */}
      <aside className="w-[240px] flex-shrink-0 sidebar-bg flex flex-col gap-4 p-5 sticky top-0 h-screen overflow-y-auto main-scroll">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-xs animate-pulse-glow">✦</div>
          <span className="text-lg font-bold gradient-text">JournalAI</span>
        </div>

        <WeatherWidget />

        {/* Streak highlight */}
        {streak > 0 && (
          <div className="glass-purple rounded-2xl p-3.5 flex items-center gap-3 animate-fade-up">
            <span className="text-2xl animate-float">🔥</span>
            <div>
              <p className="text-white font-black text-lg leading-none">{streak} days</p>
              <p className="text-purple-300/60 text-[10px] mt-0.5">writing streak!</p>
            </div>
          </div>
        )}

        {/* Overview */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest">Overview</p>
          {[
            ['Total entries', entries.length, 'text-white'],
            ['Written today', todayCount, todayCount > 0 ? 'text-green-400' : 'text-gray-600'],
            ['Total words', totalWords.toLocaleString(), 'text-purple-400'],
          ].filter(Boolean).map(([label, val, cls]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500 text-xs">{label}</span>
              <span className={`font-bold text-sm ${cls}`}>{val}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto space-y-2">
          <button onClick={() => setShowProfile(true)}
            className="w-full glass rounded-2xl p-3.5 text-left hover:border-purple-500/30 group transition-all">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {username[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate group-hover:text-purple-400 transition-colors">@{username}</p>
                <p className="text-gray-600 text-[10px]">Edit profile →</p>
              </div>
            </div>
          </button>
          <button onClick={handleLogout}
            className="w-full text-gray-600 text-xs hover:text-red-400 transition-colors py-2 px-3 rounded-xl hover:bg-red-500/5">
            ← Logout
          </button>
        </div>
      </aside>

      {/* ════════ MAIN ════════ */}
      <main className="flex-1 overflow-y-auto main-scroll">

        {/* Hero */}
        <div className="hero-gradient border-b border-white/[0.04] px-10 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-gray-500 text-sm mb-1">{greetEmoji} {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
              <h1 className="text-4xl font-black tracking-tight">
                {greetText}, <span className="gradient-text">{username}!</span>
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                {entries.length === 0 ? "Write your first entry today — start your journey 🚀"
                  : `${entries.length} entr${entries.length===1?'y':'ies'} · ${totalWords.toLocaleString()} words${streak>0?` · 🔥 ${streak}-day streak`:''}`}
              </p>
            </div>
            <div className="flex gap-2.5 flex-shrink-0 mt-1 flex-wrap justify-end">
              <ExportButton entries={entries} username={username} />
              <button onClick={fetchEntries} disabled={loading}
                className="glass text-gray-400 hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all">
                {loading ? '⟳' : '↻'}
              </button>
              <button onClick={() => setIsFormOpen(!isFormOpen)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-purple-900/40 active:scale-95 text-sm">
                {isFormOpen ? '✕ Close' : '✦ Write Journal'}
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-4 mt-7">
            {[
              { label:'Total Entries', value:entries.length, icon:'📓', color:'text-purple-400', glow:'stat-glow-purple' },
              { label:'Written Today', value:todayCount,     icon:'✍️', color:todayCount>0?'text-green-400':'text-gray-600', glow:'stat-glow-green' },
              { label:'Total Words',   value:totalWords>=1000?`${(totalWords/1000).toFixed(1)}k`:totalWords, icon:'📝', color:'text-blue-400', glow:'stat-glow-blue' },
              { label:'Writing Streak',value:streak>0?`🔥 ${streak}d`:'—', icon:null, color:'text-orange-400', glow:'stat-glow-amber' },
            ].map((s,i) => (
              <div key={i} className={`glass rounded-2xl p-4 ${s.glow} animate-fade-up stagger-${i+1}`}>
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
                <p className={`text-2xl font-black mt-1.5 ${s.color}`}>{s.icon&&<span className="mr-1">{s.icon}</span>}{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tab Nav */}
          <div className="flex gap-1 mt-6 bg-white/[0.03] p-1 rounded-2xl w-fit">
            {[['journal','📖 Journal'], ['analytics','📊 Analytics']].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab===tab ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : 'text-gray-500 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="px-10 py-8 space-y-8">
          {apiError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm">⚠️ {apiError}</div>
          )}

          {/* ════ JOURNAL TAB ════ */}
          {activeTab === 'journal' && (
            <>
              {/* Write Form */}
              {isFormOpen && (
                <div className="glass-purple rounded-3xl p-8 animate-fade-up gradient-border">
                  <h3 className="text-xl font-bold mb-1 gradient-text">New Entry</h3>
                  <p className="text-gray-600 text-sm mb-6">💡 Today's prompt: <span className="text-gray-400 italic">"{todayPrompt}"</span></p>
                  <div className="space-y-4">
                    <input type="text" placeholder="Entry title..." value={formTitle}
                      onChange={e=>setFormTitle(e.target.value)}
                      className="w-full bg-[#080b12] border border-gray-800 p-4 rounded-2xl text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/60 transition-all text-sm font-medium"
                    />
                    <div className="relative">
                      <textarea placeholder={todayPrompt} value={formContent}
                        onChange={e=>setFormContent(e.target.value)}
                        className="w-full bg-[#080b12] border border-gray-800 p-4 pr-14 rounded-2xl h-40 text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/60 transition-all resize-none text-sm leading-relaxed"
                      />
                      <button onClick={toggleListening} type="button"
                        className={`absolute bottom-4 right-4 p-2.5 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700'}`}
                        title={isListening ? "Stop listening" : "Start Voice Typing"}>
                        {isListening ? '🛑' : '🎤'}
                      </button>
                    </div>
                    {suggestion && (
                      <p className="text-purple-400/80 text-xs italic mt-2 ml-1 animate-fade-in">✨ AI Coach: {suggestion}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-xs">{formContent.split(/\s+/).filter(Boolean).length} words</span>
                      <div className="flex gap-3">
                        <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-white px-6 py-2.5 transition-colors text-sm">Cancel</button>
                        <button onClick={handleSave} disabled={saving}
                          className="bg-purple-600 hover:bg-purple-500 px-8 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50">
                          {saving ? 'Saving...' : '✦ Save Entry'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quote */}
              <div className="glass rounded-3xl p-6 border border-purple-500/10 animate-fade-up">
                <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest mb-3">✨ Quote of the Day</p>
                <blockquote className="text-gray-300 text-base leading-relaxed italic" style={{fontFamily:"'Playfair Display',serif"}}>
                  "{todayQuote.text}"
                </blockquote>
                <p className="text-purple-400 text-xs font-medium mt-3">— {todayQuote.author}</p>
              </div>

              {/* Writing Prompts */}
              <div className="animate-fade-up stagger-1">
                <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest mb-3">💡 Writing Prompts — click to use</p>
                <div className="grid grid-cols-2 gap-3">
                  {WRITING_PROMPTS.slice(0,4).map((p,i) => (
                    <button key={i} onClick={() => { setFormContent(p+' '); setIsFormOpen(true); }}
                      className="glass text-left p-4 rounded-2xl hover:border-purple-500/30 group transition-all text-sm text-gray-500 hover:text-gray-300 card-hover">
                      <span className="text-purple-500 group-hover:text-purple-400 mr-2 transition-colors">→</span>{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entries section */}
              {entries.length > 0 && (
                <div className="animate-fade-up stagger-2 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest">📖 Journal Entries</h2>
                    <span className="text-gray-600 text-xs">{filteredEntries.length} shown</span>
                  </div>

                  {/* Search */}
                  <SearchBar
                    value={searchQuery} onChange={setSearchQuery}
                    resultCount={filteredEntries.length} total={entries.length}
                  />

                  {/* Cards */}
                  {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="glass rounded-3xl p-7">
                          <div className="skeleton h-3 w-24 rounded-full mb-4" />
                          <div className="skeleton h-5 w-3/4 rounded-xl mb-3" />
                          <div className="skeleton h-3 w-full rounded-xl mb-2" />
                          <div className="skeleton h-3 w-5/6 rounded-xl" />
                        </div>
                      ))}
                    </div>
                  ) : filteredEntries.length === 0 ? (
                    <div className="text-center py-12 text-gray-700">
                      <p className="text-4xl mb-3">{searchQuery ? '🔍' : '🗂️'}</p>
                      <p>{searchQuery ? `"${searchQuery}" returned no results` : `No entries found`}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      {filteredEntries.map((entry, i) => {
                        const eid = entry.id?.toString() || String(i);
                        return (
                          <JournalCard key={`e-${eid}`} id={eid} index={i}
                            date={formatDate(entry.date)} title={entry.title}
                            content={entry.content} mood={entry.mood} tags={entry.tags}
                            onDelete={handleDelete} onUpdate={handleUpdate}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!loading && entries.length === 0 && (
                <div className="text-center py-16 animate-fade-up">
                  <div className="animate-float inline-block text-6xl mb-6">📓</div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-2">Write Your First Entry</h3>
                  <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto">
                    Every great journey begins with a single entry.
                  </p>
                  <button onClick={() => setIsFormOpen(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-xl shadow-purple-900/30 animate-pulse-glow">
                    ✦ Write First Entry
                  </button>
                </div>
              )}
            </>
          )}

          {/* ════ ANALYTICS TAB ════ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              {entries.length === 0 ? (
                <div className="text-center py-20 text-gray-600">
                  <p className="text-5xl mb-4">📊</p>
                  <p>Write some entries first, then check your analytics!</p>
                </div>
              ) : (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label:'Longest Entry', value: (() => {
                          const max = entries.reduce((b,e) => (e.content?.split(/\s+/).filter(Boolean).length||0) > (b.content?.split(/\s+/).filter(Boolean).length||0) ? e : b, entries[0]);
                          return `${max?.title?.slice(0,20)}... (${max?.content?.split(/\s+/).filter(Boolean).length||0}w)`;
                        })(), icon:'🏆', color:'text-amber-400' },
                      { label:'Avg Words/Entry', value: entries.length ? Math.round(totalWords/entries.length) : 0, icon:'📏', color:'text-blue-400' },
                      { label:'Most Active Day', value: (() => {
                          const dayMap = {};
                          entries.forEach(e => { if(e.date){ const d=new Date(e.date).toLocaleDateString('en-US',{weekday:'short'}); dayMap[d]=(dayMap[d]||0)+1; }});
                          const sorted = Object.entries(dayMap).sort((a,b)=>b[1]-a[1]);
                          return sorted[0] ? sorted[0][0] : '—';
                        })(), icon:'📅', color:'text-green-400' },
                    ].map((s,i) => (
                      <div key={i} className="glass rounded-2xl p-5 animate-fade-up" style={{animationDelay:`${i*0.05}s`}}>
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">{s.label}</p>
                        <p className={`text-xl font-black mt-2 ${s.color}`}>{s.icon} {s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Heatmap */}
                  <ActivityHeatmap entries={entries} />
                </>
              )}
            </div>
          )}

        </div>
      </main>

      {showProfile && (
        <ProfileModal username={username} onClose={() => setShowProfile(false)} onLogout={handleLogout}
          onUsernameChange={name => { setUsername(name); localStorage.setItem('username', name); }}
        />
      )}

      {/* Floating UI Elements */}
      {loggedIn && <ChatWidget />}
    </div>
  );
}