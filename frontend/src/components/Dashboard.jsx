import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import OnboardingTour from './OnboardingTour';
import LiveCamera from './LiveCamera';
import SmartAlerts from './SmartAlerts';

/* ── tiny helpers ── */
const StatusDot = ({ active, color = 'cyan' }) => {
  const colors = { cyan: 'bg-neon-cyan', green: 'bg-neon-green', red: 'bg-neon-red' };
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${active ? colors[color] + ' animate-pulse' : 'bg-slate-600'}`} />;
};

const SLOT_STATUS = { idle: 'idle', analyzing: 'analyzing', done: 'done', error: 'error' };

/* ── Single upload slot ── */
const UploadSlot = ({ slotIndex, currentUser, onComplete }) => {
  const [status, setStatus]     = useState(SLOT_STATUS.idle);
  const [file, setFile]         = useState(null);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [isDragging, setIsDrag] = useState(false);
  const [zoomed, setZoomed]     = useState(false);
  const inputRef                = useRef(null);

  const analyze = async (f) => {
    setFile(f); setResult(null); setError(''); setStatus(SLOT_STATUS.analyzing);
    const formData = new FormData();
    formData.append('file', f);
    formData.append('user_email', currentUser?.email || 'anonymous');
    try {
      let token = null;
      if (currentUser) { try { token = await currentUser.getIdToken(); } catch {} }
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await axios.post(`${API_BASE}/upload-video`, formData, { headers, timeout: 600000 });
      const r = {
        videoUrl:      res.data.video_url,
        safetyStatus:  res.data.status,
        confidence:    res.data.confidence ?? null,
        safePercent:   res.data.safe_percentage ?? null,
        unsafePercent: res.data.unsafe_percentage ?? null,
      };
      setResult(r); setStatus(SLOT_STATUS.done);
      window.dispatchEvent(new CustomEvent('vs:analysis-result', { detail: { status: r.safetyStatus } }));
      onComplete?.({ ...r, filename: f.name });
    } catch (err) {
      let msg = 'Analysis failed.';
      if (err.response?.status === 401)      msg = 'Auth failed — please log in again.';
      else if (err.response?.status === 400) msg = err.response?.data?.detail || 'Invalid file.';
      else if (err.response?.status === 500) msg = err.response?.data?.detail || 'Server error.';
      else if (err.code === 'ERR_NETWORK')   msg = 'Cannot reach backend.';
      else                                   msg = err.response?.data?.detail || err.message || 'Upload failed.';
      setError(msg); setStatus(SLOT_STATUS.error);
    }
  };

  const handleFile = (f) => { if (f && f.type.startsWith('video/')) analyze(f); };
  const reset = () => {
    setFile(null); setResult(null); setError(''); setStatus(SLOT_STATUS.idle);
    if (inputRef.current) inputRef.current.value = '';
  };

  const isBusy = status === SLOT_STATUS.analyzing;
  const isDone = status === SLOT_STATUS.done;
  const isErr  = status === SLOT_STATUS.error;

  const borderCls =
    isDone && result?.safetyStatus === 'SAFE'   ? 'border-neon-green/50 shadow-[0_0_12px_rgba(0,255,159,0.1)]' :
    isDone && result?.safetyStatus === 'UNSAFE' ? 'border-neon-red/50 shadow-[0_0_12px_rgba(255,59,59,0.1)]'   :
    isErr                                        ? 'border-neon-red/30'   :
    isBusy                                       ? 'border-neon-cyan/50 shadow-[0_0_12px_rgba(0,240,255,0.08)]' :
                                                   'border-white/8 hover:border-neon-cyan/30';

  const slotContent = (
    <>
      {/* Slot header */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-white/2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <StatusDot active={isBusy || isDone} color={isDone ? (result?.safetyStatus === 'SAFE' ? 'green' : 'red') : 'cyan'} />
          <span className="font-mono-jet text-xs text-slate-500 tracking-widest">FEED {slotIndex + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          {(isDone || isErr || isBusy) && (
            <button onClick={reset} className="font-mono-jet text-xs text-slate-600 hover:text-neon-red transition-colors px-2 py-0.5 rounded border border-transparent hover:border-neon-red/30">
              ✕ RESET
            </button>
          )}
          <button
            onClick={() => setZoomed(z => !z)}
            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-neon-cyan transition-colors rounded"
            title={zoomed ? 'Exit fullscreen' : 'Expand feed'}
          >
            {zoomed ? (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Drop area */}
      {status === SLOT_STATUS.idle && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={e => { e.preventDefault(); setIsDrag(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all
            ${isDragging ? 'bg-neon-cyan/5' : 'hover:bg-white/2'}`}
        >
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <div className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-all
            ${isDragging ? 'border-neon-cyan bg-neon-cyan/10' : 'border-white/10'}`}>
            <svg className={`w-6 h-6 transition-colors ${isDragging ? 'text-neon-cyan' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-sora text-sm font-semibold text-slate-400 mb-1">
              {isDragging ? 'Drop to analyze' : 'Drop video here'}
            </p>
            <p className="font-inter text-xs text-slate-600">or click to browse</p>
          </div>
        </div>
      )}

      {/* Analyzing */}
      {status === SLOT_STATUS.analyzing && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-2 border-neon-cyan/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-neon-cyan animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
          </div>
          <div className="text-center">
            <p className="font-sora text-sm font-semibold text-neon-cyan tracking-wide mb-1 animate-pulse">ANALYZING</p>
            <p className="font-mono-jet text-xs text-slate-500 truncate max-w-[180px]">{file?.name}</p>
          </div>
          <div className="flex flex-col gap-1.5 w-full max-w-[200px] px-4">
            {['YOLO DETECTION', 'POSE ESTIMATION', 'CLASSIFICATION'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: `${i * 0.35}s` }} />
                <span className="font-mono-jet text-xs text-slate-600">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {status === SLOT_STATUS.done && result && (
        <div className="flex-1 flex flex-col p-4 gap-3">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-sm ${
            result.safetyStatus === 'SAFE'
              ? 'bg-neon-green/10 border border-neon-green/30'
              : 'bg-neon-red/10 border border-neon-red/30'
          }`}>
            <span className={`text-lg ${result.safetyStatus === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
              {result.safetyStatus === 'SAFE' ? '✓' : '⚠'}
            </span>
            <span className={`font-sora text-sm font-bold tracking-wide ${result.safetyStatus === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
              {result.safetyStatus}
            </span>
            {result.confidence != null && (
              <span className="font-mono-jet text-xs text-slate-400 ml-auto">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="font-mono-jet text-xs text-slate-500 truncate">{file?.name}</p>
          {result.confidence != null && (
            <div className="w-full bg-slate-800/60 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${result.safetyStatus === 'SAFE' ? 'bg-neon-green' : 'bg-neon-red'}`}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          )}
          {(result.safePercent != null || result.unsafePercent != null) && (
            <div className="flex gap-4 text-xs font-mono-jet">
              <span className="text-neon-green">{result.safePercent?.toFixed(1)}% safe</span>
              <span className="text-neon-red">{result.unsafePercent?.toFixed(1)}% unsafe</span>
            </div>
          )}
          {result.videoUrl && (
            <a
              href={`${API_BASE}${result.videoUrl}`}
              download
              className="mt-auto inline-flex items-center gap-1.5 font-mono-jet text-xs text-neon-cyan hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download annotated video
            </a>
          )}
        </div>
      )}

      {/* Error */}
      {status === SLOT_STATUS.error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
          <div className="w-12 h-12 rounded-full bg-neon-red/10 border border-neon-red/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-neon-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="font-inter text-xs text-neon-red text-center leading-relaxed">{error}</p>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Zoomed overlay */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-cyber-black/90 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setZoomed(false); }}
        >
          <div className={`glass-panel rounded-xl overflow-hidden flex flex-col border w-full max-w-4xl h-[80vh] ${borderCls}`}>
            {slotContent}
          </div>
        </div>
      )}

      {/* Normal card */}
      <div className={`glass-panel rounded-sm overflow-hidden flex flex-col border transition-all duration-300 ${borderCls}`}>
        {slotContent}
      </div>
    </>
  );
};

/* ── Sidebar nav item ── */
const NavItem = ({ icon, label, active, onClick, badge, external }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 font-inter text-sm font-medium transition-all group ${
      active
        ? 'bg-neon-cyan/12 text-neon-cyan border border-neon-cyan/20'
        : 'text-slate-400 hover:text-white hover:bg-white/6 border border-transparent'
    }`}
  >
    <span className={`flex-shrink-0 ${active ? 'text-neon-cyan' : 'text-slate-500 group-hover:text-slate-300'}`}>
      {icon}
    </span>
    <span className="flex-1 text-left">{label}</span>
    {badge && <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse flex-shrink-0" />}
    {external && (
      <svg className="w-3 h-3 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    )}
  </button>
);

/* ── Sidebar panel ── */
const SidebarContent = ({ quickStats, activeTab, setActiveTab, navigate, onToggle, currentUser, eventHistory }) => {
  const initials = (currentUser?.displayName || currentUser?.email || 'U').charAt(0).toUpperCase();
  const displayName = currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'User';

  return (
    <div className="flex flex-col h-full">

      {/* ── Panel header + close ── */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5 flex-shrink-0">
        <span className="font-mono-jet text-xs text-slate-600 tracking-widest">MENU</span>
        <button onClick={onToggle} className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-all" title="Close panel">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-4 flex flex-col gap-6">

        {/* Main navigation */}
        <div>
          <p className="font-mono-jet text-xs text-slate-600 tracking-widest mb-2 px-1">WORKSPACE</p>
          <NavItem
            active={activeTab === 'upload'}
            onClick={() => setActiveTab('upload')}
            label="Batch Upload"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
          />
          <NavItem
            active={activeTab === 'live'}
            onClick={() => setActiveTab('live')}
            label="Live Camera"
            badge
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          />
          <NavItem
            active={activeTab === 'monitor'}
            onClick={() => setActiveTab('monitor')}
            label="Monitor & Alerts"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
          />
          <NavItem
            active={activeTab === 'events'}
            onClick={() => setActiveTab('events')}
            label="Event History"
            badge={eventHistory?.length > 0}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <NavItem
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
            label="Analytics"
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
        </div>

        {/* Mini stats */}
        <div>
          <p className="font-mono-jet text-xs text-slate-600 tracking-widest mb-2 px-1">MY STATS</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Analysed', value: quickStats?.total_videos ?? 0, color: 'text-neon-cyan' },
              { label: 'Safe',     value: quickStats?.safe_videos ?? 0,  color: 'text-neon-green' },
              { label: 'Unsafe',   value: quickStats ? (quickStats.total_videos - quickStats.safe_videos) : 0, color: 'text-neon-red' },
              { label: 'Avg Score', value: quickStats ? `${(quickStats.average_confidence * 100).toFixed(0)}%` : '—', color: 'text-slate-300' },
            ].map((s) => (
              <div key={s.label} className="bg-white/3 border border-white/5 rounded-lg p-2.5 text-center">
                <p className={`font-sora text-lg font-extrabold ${s.color}`}>{s.value}</p>
                <p className="font-inter text-xs text-slate-600 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── User footer ── */}
      <div className="border-t border-white/5 px-3 py-3 flex-shrink-0">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full ring-1 ring-neon-cyan/40 flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full ring-1 ring-neon-cyan/40 bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold font-sora flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="font-inter text-xs font-semibold text-slate-200 truncate">{displayName}</p>
            <p className="font-mono-jet text-xs text-slate-600 truncate">{currentUser?.email}</p>
          </div>
          <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

    </div>
  );
};

/* ── Main Dashboard ── */
const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]         = useState('upload');
  const [quickStats, setQuickStats]       = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [alertCount, setAlertCount]       = useState(0);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [eventHistory, setEventHistory]   = useState([]);

  useEffect(() => { if (currentUser?.email) fetchQuickStats(); }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.email) return;
    const key = `vs-onboarded-${currentUser.email}`;
    if (!localStorage.getItem(key)) setShowOnboarding(true);
  }, [currentUser]);

  // Close sidebar by default on mobile
  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleOnboardingComplete = () => {
    if (currentUser?.email) localStorage.setItem(`vs-onboarded-${currentUser.email}`, '1');
    setShowOnboarding(false);
  };

  const fetchQuickStats = async () => {
    try {
      const r = await axios.get(`${API_BASE}/videos/stats/${currentUser?.email}`);
      setQuickStats(r.data);
    } catch { setQuickStats({ total_videos: 0, safe_videos: 0, average_confidence: 0 }); }
  };

  return (
    <div className="fixed inset-0 top-14 flex cyber-grid overflow-hidden">
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}

      {/* ── Left sidebar ── */}
      <aside className={`
        flex-shrink-0 border-r border-white/5 bg-cyber-black/60 backdrop-blur-xl
        transition-all duration-300 ease-in-out overflow-hidden
        ${sidebarOpen ? 'w-56' : 'w-0'}
      `}>
        <div className="w-56 h-full">
          <SidebarContent
            quickStats={quickStats}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            navigate={navigate}
            alertCount={alertCount}
            onToggle={() => setSidebarOpen(o => !o)}
            currentUser={currentUser}
            eventHistory={eventHistory}
          />
        </div>
      </aside>

      {/* ── Main content area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar — tab label + user chip (no hamburger here) */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-cyber-black/30 backdrop-blur-sm flex-shrink-0">

          {/* Open-panel button — only visible when sidebar is closed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-7 h-7 flex flex-col items-center justify-center gap-[4px] hover:opacity-70 transition-opacity flex-shrink-0"
              title="Open panel"
            >
              <span className="block w-4 h-px bg-neon-cyan" />
              <span className="block w-4 h-px bg-neon-cyan" />
              <span className="block w-4 h-px bg-neon-cyan" />
            </button>
          )}

          {/* Current tab name */}
          <div className="flex items-center gap-2">
            <StatusDot active color="cyan" />
            <span className="font-sora text-sm font-semibold text-slate-200">
              {activeTab === 'upload' ? 'Batch Upload' : activeTab === 'live' ? 'Live Camera' : activeTab === 'monitor' ? 'Monitor & Alerts' : activeTab === 'events' ? 'Event History' : 'Analytics'}
            </span>
          </div>
        </div>

        {/* ── UPLOAD TAB ── */}
        {activeTab === 'upload' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full" style={{ gridAutoRows: 'minmax(280px, 1fr)' }}>
              {[0, 1, 2, 3].map(i => (
                <UploadSlot
                  key={i}
                  slotIndex={i}
                  currentUser={currentUser}
                  onComplete={(result) => {
                    fetchQuickStats();
                    if (result) {
                      setEventHistory(prev => [{
                        id: Date.now(),
                        feed: i + 1,
                        filename: result.filename,
                        status: result.safetyStatus,
                        confidence: result.confidence,
                        safePercent: result.safePercent,
                        unsafePercent: result.unsafePercent,
                        ts: new Date(),
                      }, ...prev]);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── LIVE CAMERA TAB ── */}
        {activeTab === 'live' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="glass-panel p-3 sm:p-4 rounded-sm border border-neon-red/20 flex items-start gap-3 mb-4">
              <span className="text-neon-red flex-shrink-0">📡</span>
              <div>
                <p className="font-sora text-xs font-semibold text-neon-red tracking-widest mb-1">LIVE STREAM MODE</p>
                <p className="font-inter text-xs text-slate-400 leading-relaxed">
                  Captures a JPEG snapshot every N seconds through the full AI pipeline.
                  Requires camera permission and an active backend connection.
                </p>
              </div>
            </div>
            <LiveCamera />
          </div>
        )}

        {/* ── MONITOR & ALERTS TAB ── */}
        {activeTab === 'monitor' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">

            {/* System status */}
            <div className="glass-panel rounded-xl border border-white/8 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <StatusDot active color="cyan" />
                <span className="font-sora text-sm font-semibold text-slate-200">System Status</span>
                <span className="ml-auto font-mono-jet text-xs text-neon-green">ALL SYSTEMS OPERATIONAL</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { label: 'AI Model',    sub: 'YOLOv8n + MediaPipe',  status: 'ONLINE',  color: 'green' },
                  { label: 'Backend API', sub: 'FastAPI / Uvicorn',     status: 'ONLINE',  color: 'green' },
                  { label: 'Feed Slots',  sub: '4 slots available',     status: 'READY',   color: 'cyan'  },
                  { label: 'Alert Engine',sub: 'Smart threshold alerts', status: 'ACTIVE',  color: 'cyan'  },
                ].map(({ label, sub, status, color }) => (
                  <div key={label} className="flex items-center gap-4 px-4 py-3">
                    <StatusDot active color={color} />
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm text-slate-200">{label}</p>
                      <p className="font-mono-jet text-xs text-slate-600 truncate">{sub}</p>
                    </div>
                    <span className={`font-mono-jet text-xs font-semibold ${color === 'green' ? 'text-neon-green' : 'text-neon-cyan'}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Analysed', value: quickStats?.total_videos ?? 0,  color: 'text-neon-cyan'  },
                { label: 'Safe',           value: quickStats?.safe_videos ?? 0,   color: 'text-neon-green' },
                { label: 'Unsafe',         value: quickStats ? (quickStats.total_videos - quickStats.safe_videos) : 0, color: 'text-neon-red' },
                { label: 'Avg Confidence', value: quickStats ? `${(quickStats.average_confidence * 100).toFixed(0)}%` : '—', color: 'text-slate-300' },
              ].map(s => (
                <div key={s.label} className="glass-panel border border-white/8 rounded-xl p-4 text-center">
                  <p className={`font-sora text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="font-inter text-xs text-slate-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Smart alerts */}
            <div>
              <p className="font-mono-jet text-xs text-slate-600 tracking-widest mb-3">SMART ALERTS</p>
              <SmartAlerts />
            </div>

          </div>
        )}

        {/* ── EVENT HISTORY TAB ── */}
        {activeTab === 'events' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-sora text-base font-bold text-slate-100">Event History</h2>
                <p className="font-inter text-xs text-slate-500 mt-0.5">All analysis results from this session across all feeds</p>
              </div>
              {eventHistory.length > 0 && (
                <button
                  onClick={() => setEventHistory([])}
                  className="font-mono-jet text-xs text-slate-600 hover:text-neon-red transition-colors px-3 py-1.5 rounded border border-transparent hover:border-neon-red/30"
                >
                  CLEAR ALL
                </button>
              )}
            </div>

            {/* Table — always visible */}
            <div className="glass-panel rounded-xl border border-white/8 overflow-hidden">
              {/* Column headers */}
              <div className="grid grid-cols-[60px_1fr_90px_90px_90px_100px] gap-3 px-4 py-2.5 border-b border-white/5 bg-white/2">
                {['FEED', 'FILENAME', 'STATUS', 'CONFIDENCE', 'SAFE %', 'TIME'].map(h => (
                  <span key={h} className="font-mono-jet text-xs text-slate-500 tracking-widest">{h}</span>
                ))}
              </div>

              {eventHistory.length === 0 ? (
                /* Empty state inside the table */
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="font-inter text-sm text-slate-600">No events yet</p>
                  <p className="font-inter text-xs text-slate-700">Upload a video in <span className="text-neon-cyan cursor-pointer hover:underline" onClick={() => setActiveTab('upload')}>Batch Upload</span> to log results here</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {eventHistory.map((ev) => (
                    <div key={ev.id} className="grid grid-cols-[60px_1fr_90px_90px_90px_100px] gap-3 px-4 py-3 items-center hover:bg-white/2 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ev.status === 'SAFE' ? 'bg-neon-green' : 'bg-neon-red'}`} />
                        <span className="font-mono-jet text-xs text-slate-400">F{ev.feed}</span>
                      </div>
                      <span className="font-inter text-xs text-slate-300 truncate" title={ev.filename}>{ev.filename}</span>
                      <span className={`font-mono-jet text-xs font-semibold ${ev.status === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
                        {ev.status}
                      </span>
                      <span className="font-mono-jet text-xs text-slate-400">
                        {ev.confidence != null ? `${(ev.confidence * 100).toFixed(1)}%` : '—'}
                      </span>
                      <span className="font-mono-jet text-xs text-slate-400">
                        {ev.safePercent != null ? `${ev.safePercent.toFixed(1)}%` : '—'}
                      </span>
                      <span className="font-mono-jet text-xs text-slate-600">
                        {ev.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            <div>
              <h2 className="font-sora text-base font-bold text-slate-100">Analytics</h2>
              <p className="font-inter text-xs text-slate-500 mt-0.5">Session performance across all feeds</p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(() => {
                const total   = eventHistory.length;
                const safe    = eventHistory.filter(e => e.status === 'SAFE').length;
                const unsafe  = total - safe;
                const avgConf = total > 0
                  ? eventHistory.reduce((s, e) => s + (e.confidence ?? 0), 0) / total
                  : 0;
                return [
                  { label: 'Total Events',    value: total,                                    color: 'text-neon-cyan'  },
                  { label: 'Safe',            value: safe,                                     color: 'text-neon-green' },
                  { label: 'Unsafe',          value: unsafe,                                   color: 'text-neon-red'   },
                  { label: 'Avg Confidence',  value: total > 0 ? `${(avgConf*100).toFixed(1)}%` : '—', color: 'text-slate-300' },
                ].map(s => (
                  <div key={s.label} className="glass-panel border border-white/8 rounded-xl p-4 text-center">
                    <p className={`font-sora text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="font-inter text-xs text-slate-500 mt-1">{s.label}</p>
                  </div>
                ));
              })()}
            </div>

            {/* Safe vs Unsafe bar */}
            {eventHistory.length > 0 && (() => {
              const total  = eventHistory.length;
              const safe   = eventHistory.filter(e => e.status === 'SAFE').length;
              const safePct = (safe / total) * 100;
              return (
                <div className="glass-panel border border-white/8 rounded-xl p-5">
                  <p className="font-mono-jet text-xs text-slate-600 tracking-widest mb-4">SAFE VS UNSAFE RATIO</p>
                  <div className="flex rounded-full overflow-hidden h-4 mb-3">
                    <div className="bg-neon-green transition-all duration-700" style={{ width: `${safePct}%` }} />
                    <div className="bg-neon-red flex-1" />
                  </div>
                  <div className="flex justify-between font-mono-jet text-xs">
                    <span className="text-neon-green">Safe {safePct.toFixed(1)}%</span>
                    <span className="text-neon-red">Unsafe {(100 - safePct).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })()}

            {/* Per-feed breakdown */}
            {eventHistory.length > 0 && (
              <div className="glass-panel border border-white/8 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="font-mono-jet text-xs text-slate-600 tracking-widest">PER-FEED BREAKDOWN</p>
                </div>
                <div className="divide-y divide-white/5">
                  {[1, 2, 3, 4].map(feed => {
                    const feedEvents = eventHistory.filter(e => e.feed === feed);
                    if (feedEvents.length === 0) return null;
                    const feedSafe = feedEvents.filter(e => e.status === 'SAFE').length;
                    const feedAvg  = feedEvents.reduce((s, e) => s + (e.confidence ?? 0), 0) / feedEvents.length;
                    return (
                      <div key={feed} className="flex items-center gap-4 px-4 py-3">
                        <span className="font-mono-jet text-xs text-slate-400 w-12 flex-shrink-0">FEED {feed}</span>
                        <div className="flex-1 bg-slate-800/60 rounded-full h-2">
                          <div
                            className="bg-neon-cyan h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(feedSafe / feedEvents.length) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono-jet text-xs text-slate-400 w-16 text-right flex-shrink-0">
                          {feedEvents.length} events
                        </span>
                        <span className="font-mono-jet text-xs text-slate-500 w-14 text-right flex-shrink-0">
                          {(feedAvg * 100).toFixed(0)}% avg
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All-time stats from backend */}
            <div className="glass-panel border border-white/8 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="font-mono-jet text-xs text-slate-600 tracking-widest">ALL-TIME STATS</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-white/5">
                {[
                  { label: 'Total Uploaded',  value: quickStats?.total_videos ?? 0,  color: 'text-neon-cyan'  },
                  { label: 'Safe Videos',     value: quickStats?.safe_videos ?? 0,   color: 'text-neon-green' },
                  { label: 'Avg Confidence',  value: quickStats ? `${(quickStats.average_confidence * 100).toFixed(1)}%` : '—', color: 'text-slate-300' },
                ].map(s => (
                  <div key={s.label} className="p-4 text-center">
                    <p className={`font-sora text-xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className="font-inter text-xs text-slate-600 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {eventHistory.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg className="w-10 h-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-inter text-sm text-slate-600">Upload videos to see session analytics</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
