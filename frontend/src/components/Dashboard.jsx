import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config/api';
import OnboardingTour from './OnboardingTour';
import LiveCamera from './LiveCamera';
import SmartAlerts from './SmartAlerts';

const StatusDot = ({ active, color = 'cyan' }) => {
  const colors = { cyan: 'bg-neon-cyan', green: 'bg-neon-green', red: 'bg-neon-red' };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? colors[color] + ' animate-pulse' : 'bg-slate-600'}`} />
  );
};

const SLOT_STATUS = { idle: 'idle', analyzing: 'analyzing', done: 'done', error: 'error' };

const formatBytes = (b) => {
  if (!b) return '';
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

/* ── Single upload slot ── */
const UploadSlot = ({ slotIndex, currentUser, onComplete }) => {
  const [status, setStatus]     = useState(SLOT_STATUS.idle);
  const [file, setFile]         = useState(null);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [isDragging, setIsDrag] = useState(false);
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
      onComplete?.();
    } catch (err) {
      let msg = 'Analysis failed.';
      if (err.response?.status === 401) msg = 'Auth failed — please log in again.';
      else if (err.response?.status === 400) msg = err.response?.data?.detail || 'Invalid file.';
      else if (err.response?.status === 500) msg = err.response?.data?.detail || 'Server error.';
      else if (err.code === 'ERR_NETWORK') msg = 'Cannot reach backend.';
      else msg = err.response?.data?.detail || err.message || 'Upload failed.';
      setError(msg); setStatus(SLOT_STATUS.error);
    }
  };

  const handleFile = (f) => { if (f && f.type.startsWith('video/')) analyze(f); };
  const reset = () => { setFile(null); setResult(null); setError(''); setStatus(SLOT_STATUS.idle); if (inputRef.current) inputRef.current.value = ''; };

  const isBusy = status === SLOT_STATUS.analyzing;
  const isDone = status === SLOT_STATUS.done;
  const isErr  = status === SLOT_STATUS.error;

  return (
    <div className={`glass-panel rounded-sm overflow-hidden flex flex-col border transition-all ${
      isDone && result?.safetyStatus === 'SAFE'   ? 'border-neon-green/40' :
      isDone && result?.safetyStatus === 'UNSAFE' ? 'border-neon-red/40'   :
      isErr                                        ? 'border-neon-red/30'   :
      isBusy                                       ? 'border-neon-cyan/40'  :
                                                     'border-neon-cyan/10 hover:border-neon-cyan/30'
    }`}>
      {/* Slot header */}
      <div className="px-4 py-2.5 border-b border-neon-cyan/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot
            active={isBusy || isDone}
            color={isDone ? (result?.safetyStatus === 'SAFE' ? 'green' : 'red') : 'cyan'}
          />
          <span className="font-mono-jet text-xs text-slate-500 tracking-widest">FEED {slotIndex + 1}</span>
        </div>
        {(isDone || isErr || isBusy) && (
          <button onClick={reset} className="font-mono-jet text-xs text-slate-600 hover:text-neon-red transition-colors">✕ RESET</button>
        )}
      </div>

      {/* Drop area or result */}
      {status === SLOT_STATUS.idle && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDrag(true); }}
          onDragLeave={() => setIsDrag(false)}
          onDrop={e => { e.preventDefault(); setIsDrag(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 flex flex-col items-center justify-center gap-3 p-6 cursor-pointer transition-all min-h-[180px] ${
            isDragging ? 'bg-neon-cyan/5' : 'hover:bg-neon-cyan/3'
          }`}
        >
          <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <svg className={`w-8 h-8 transition-colors ${isDragging ? 'text-neon-cyan' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <div className="text-center">
            <p className="font-orbitron text-xs text-slate-500 tracking-widest mb-0.5">
              {isDragging ? 'DROP TO ANALYZE' : 'DROP VIDEO'}
            </p>
            <p className="font-mono-jet text-xs text-slate-700">or click to browse</p>
          </div>
        </div>
      )}

      {status === SLOT_STATUS.analyzing && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 min-h-[180px]">
          <svg className="w-8 h-8 text-neon-cyan animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <div className="text-center">
            <p className="font-orbitron text-xs text-neon-cyan tracking-widest mb-1 animate-pulse">ANALYZING</p>
            <p className="font-mono-jet text-xs text-slate-500 truncate max-w-[160px]">{file?.name}</p>
          </div>
          <div className="flex flex-col gap-1.5 w-full max-w-[180px]">
            {['YOLO DETECTION', 'POSE ESTIMATION', 'CLASSIFICATION'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                <span className="font-mono-jet text-xs text-slate-600 tracking-wide">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {status === SLOT_STATUS.done && result && (
        <div className="flex-1 flex flex-col p-4 gap-3 min-h-[180px]">
          {/* Status banner */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-sm ${
            result.safetyStatus === 'SAFE' ? 'bg-neon-green/10 border border-neon-green/30' : 'bg-neon-red/10 border border-neon-red/30'
          }`}>
            <span className={`font-orbitron text-xs font-black tracking-widest ${result.safetyStatus === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
              {result.safetyStatus === 'SAFE' ? '✓ SAFE' : '⚠ UNSAFE'}
            </span>
            {result.confidence != null && (
              <span className="font-mono-jet text-xs text-slate-500 ml-auto">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            )}
          </div>

          {/* Filename */}
          <p className="font-mono-jet text-xs text-slate-400 truncate">{file?.name}</p>

          {/* Confidence bar */}
          {result.confidence != null && (
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${result.safetyStatus === 'SAFE' ? 'bg-neon-green' : 'bg-neon-red'}`}
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          )}

          {/* Download */}
          {result.videoUrl && (
            <a
              href={`${API_BASE}${result.videoUrl}`}
              download
              className="mt-auto font-mono-jet text-xs text-neon-cyan hover:underline flex items-center gap-1"
            >
              ↓ download processed video
            </a>
          )}
        </div>
      )}

      {status === SLOT_STATUS.error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 min-h-[180px]">
          <svg className="w-8 h-8 text-neon-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="font-mono-jet text-xs text-neon-red text-center leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upload');
  const [quickStats, setQuickStats] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => { if (currentUser?.email) fetchQuickStats(); }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.email) return;
    const key = `vs-onboarded-${currentUser.email}`;
    if (!localStorage.getItem(key)) setShowOnboarding(true);
  }, [currentUser]);

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

  const tabs = [
    { id: 'upload',  label: 'BATCH UPLOAD' },
    { id: 'live',    label: 'LIVE CAMERA' },
    { id: 'history', label: 'HISTORY',    navigate: '/history' },
    { id: 'stats',   label: 'STATISTICS', navigate: '/history' },
  ];

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen cyber-grid">
      {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} />}
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="glass-panel hud-frame p-5 rounded-sm mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentUser?.photoURL && (
              <img src={currentUser.photoURL} alt="" className="w-10 h-10 rounded-sm ring-1 ring-neon-cyan" />
            )}
            <div>
              <h1 className="font-orbitron text-lg font-bold text-white">
                OPERATOR: <span className="text-neon-cyan">{currentUser?.displayName?.split(' ')[0]?.toUpperCase() || 'UNKNOWN'}</span>
              </h1>
              <p className="font-mono-jet text-xs text-slate-500 tracking-wide">{currentUser?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono-jet text-xs text-neon-green">
            <StatusDot active color="green" />
            SYSTEM ACTIVE
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 border border-neon-cyan/10 rounded-sm p-1 glass-panel w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.navigate ? navigate(tab.navigate) : setActiveTab(tab.id)}
              className={`px-5 py-2 font-mono-jet text-xs tracking-widest rounded-sm transition-all ${
                activeTab === tab.id && !tab.navigate
                  ? 'bg-neon-cyan text-cyber-black font-bold'
                  : 'text-slate-500 hover:text-neon-cyan'
              }`}
            >
              {tab.label}
              {tab.id === 'live' && <span className="ml-2 text-neon-red text-xs">●</span>}
              {tab.navigate && <span className="ml-1 text-slate-600 text-xs">↗</span>}
            </button>
          ))}
        </div>

        {/* ── UPLOAD TAB — 4 independent slots ── */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 4 upload slots — 2×2 grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <StatusDot active color="cyan" />
                <span className="font-mono-jet text-xs text-slate-500 tracking-widest">4 INDEPENDENT FEED SLOTS — DROP OR CLICK TO ANALYZE</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <UploadSlot
                    key={i}
                    slotIndex={i}
                    currentUser={currentUser}
                    onComplete={fetchQuickStats}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="glass-panel hud-frame rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-neon-cyan/10">
                  <span className="font-orbitron text-xs text-neon-cyan tracking-widest">SYSTEM STATUS</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'AI MODEL',    value: 'ONLINE', color: 'green', active: true },
                    { label: 'YOLO ENGINE', value: 'READY',  color: 'green', active: true },
                    { label: 'MEDIAPIPE',   value: 'READY',  color: 'green', active: true },
                    { label: 'SLOTS',       value: '4 ACTIVE', color: 'cyan', active: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                      <span className="font-mono-jet text-xs text-slate-500 tracking-widest">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <StatusDot active={row.active} color={row.color} />
                        <span className={`font-mono-jet text-xs font-bold ${row.color === 'green' ? 'text-neon-green' : 'text-neon-cyan'}`}>{row.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-neon-cyan/10">
                  <span className="font-orbitron text-xs text-neon-cyan tracking-widest">OPERATOR STATS</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'TOTAL ANALYSES', value: quickStats?.total_videos ?? 0, color: 'text-neon-cyan' },
                    { label: 'SAFE FEEDS',     value: quickStats?.safe_videos ?? 0,  color: 'text-neon-green' },
                    { label: 'AVG CONFIDENCE', value: quickStats ? `${(quickStats.average_confidence * 100).toFixed(0)}%` : '0%', color: 'text-neon-cyan' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-mono-jet text-xs text-slate-500 tracking-widest">{s.label}</span>
                      <span className={`font-orbitron text-sm font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <SmartAlerts onAlertTriggered={() => setAlertCount(c => c + 1)} />
            </div>
          </div>
        )}

        {/* ── LIVE CAMERA TAB ── */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-sm border border-neon-red/20 flex items-start gap-3">
              <span className="text-neon-red text-lg">📡</span>
              <div>
                <p className="font-orbitron text-xs text-neon-red tracking-widest mb-1">LIVE STREAM MODE</p>
                <p className="font-mono-jet text-xs text-slate-400 leading-relaxed">
                  Live camera captures a JPEG snapshot every N seconds and runs it through the full AI pipeline. Requires camera permission and an active backend connection.
                </p>
              </div>
            </div>
            <LiveCamera />
          </div>
        )}

      </div>
    </section>
  );
};

export default Dashboard;
