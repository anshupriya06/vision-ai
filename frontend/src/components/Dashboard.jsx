import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import API_BASE from '../config/api';
import VideoHistory from './VideoHistory';
import DashboardStats from './DashboardStats';

const StatusDot = ({ active, color = 'cyan' }) => {
  const colors = { cyan: 'bg-neon-cyan', green: 'bg-neon-green', red: 'bg-neon-red' };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? colors[color] + ' animate-pulse' : 'bg-slate-600'}`} />
  );
};

const Dashboard = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [processedVideo, setProcessedVideo] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState(null);
  const [unsafePercentage, setUnsafePercentage] = useState(null);
  const [safePercentage, setSafePercentage] = useState(null);
  const [modelConfidence, setModelConfidence] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [quickStats, setQuickStats] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => { if (currentUser?.email) fetchQuickStats(); }, [currentUser]);
  useEffect(() => {
    if (processedVideo && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [processedVideo]);

  const fetchQuickStats = async () => {
    try {
      const r = await axios.get(`${API_BASE}/videos/stats/${currentUser?.email}`);
      setQuickStats(r.data);
    } catch { setQuickStats({ total_videos: 0, safe_videos: 0, average_confidence: 0 }); }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file); setErrorMessage(''); setProcessedVideo(null); setSafetyStatus(null);
    } else { setErrorMessage('Please select a valid video file'); }
  };

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files[0]); };

  const handleUpload = async () => {
    if (!selectedFile) { setErrorMessage('Please select a video file first'); return; }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('user_email', currentUser?.email || 'anonymous');
    try {
      setUploadStatus('uploading'); setErrorMessage('');
      let token = null;
      if (currentUser) { try { token = await currentUser.getIdToken(); } catch {} }
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await axios.post(`${API_BASE}/upload-video`, formData, { headers, timeout: 600000 });
      setUploadStatus('processing');
      await new Promise(r => setTimeout(r, 1000));
      setProcessedVideo(response.data.video_url);
      setSafetyStatus(response.data.status);
      setModelConfidence(response.data.confidence ?? null);
      const unsafePct = response.data.unsafe_percentage ?? (response.data.confidence != null ? (1 - response.data.confidence) * 100 : null);
      const safePct = response.data.safe_percentage ?? (response.data.confidence != null ? response.data.confidence * 100 : null);
      setUnsafePercentage(unsafePct != null ? Number(unsafePct) : null);
      setSafePercentage(safePct != null ? Number(safePct) : null);
      setUploadStatus('completed');
      if (currentUser?.email) fetchQuickStats();
    } catch (error) {
      setUploadStatus('error');
      if (error.response?.status === 401) setErrorMessage('Authentication failed. Please log in again.');
      else if (error.response?.status === 400) setErrorMessage(error.response?.data?.detail || 'Invalid file format.');
      else if (error.response?.status === 500) setErrorMessage(error.response?.data?.detail || 'Server error. Please try again.');
      else if (error.code === 'ERR_NETWORK') setErrorMessage(`Cannot reach backend at ${API_BASE}`);
      else setErrorMessage(error.response?.data?.detail || error.message || 'Upload failed.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null); setUploadStatus('idle'); setProcessedVideo(null);
    setSafetyStatus(null); setUnsafePercentage(null); setSafePercentage(null);
    setModelConfidence(null); setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const tabs = [
    { id: 'upload', label: 'UPLOAD FEED' },
    { id: 'history', label: 'HISTORY' },
    { id: 'stats', label: 'STATISTICS' },
  ];

  const isProcessing = uploadStatus === 'uploading' || uploadStatus === 'processing';

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen cyber-grid">
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
        <div className="flex gap-1 mb-6 border border-neon-cyan/10 rounded-sm p-1 glass-panel w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 font-mono-jet text-xs tracking-widest rounded-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-cyan text-cyber-black font-bold'
                  : 'text-slate-500 hover:text-neon-cyan'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main upload area */}
            <div className="lg:col-span-2 space-y-6">

              {/* Processing status */}
              {isProcessing && (
                <div className="glass-panel border border-neon-cyan/30 p-4 rounded-sm">
                  <div className="font-mono-jet text-xs text-neon-cyan tracking-widest mb-3 flex items-center gap-2">
                    <StatusDot active color="cyan" /> AI ANALYSIS IN PROGRESS
                  </div>
                  <div className="space-y-2">
                    {['UPLOADING VIDEO FEED', 'RUNNING YOLO DETECTION', 'MEDIAPIPE POSE ESTIMATION', 'CLASSIFYING ACTIVITIES'].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${i <= (uploadStatus === 'uploading' ? 0 : 2) ? 'bg-neon-cyan animate-pulse' : 'bg-slate-700'}`} />
                        <span className={`font-mono-jet text-xs tracking-wider ${i <= (uploadStatus === 'uploading' ? 0 : 2) ? 'text-slate-300' : 'text-slate-600'}`}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {errorMessage && (
                <div className="glass-panel neon-border-red p-4 rounded-sm flex items-start gap-3">
                  <span className="text-neon-red font-mono-jet text-lg leading-none">!</span>
                  <p className="font-mono-jet text-xs text-neon-red tracking-wide">{errorMessage}</p>
                </div>
              )}

              {/* Upload zone or results */}
              {(uploadStatus === 'idle' || uploadStatus === 'error') && (
                <div className="glass-panel rounded-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-neon-cyan/10 flex items-center gap-2">
                    <StatusDot active={!!selectedFile} color="cyan" />
                    <span className="font-mono-jet text-xs tracking-widest text-slate-400">VIDEO FEED INPUT</span>
                  </div>

                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`m-4 border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-neon-cyan bg-neon-cyan/5 shadow-neon-cyan' : 'border-slate-700 hover:border-neon-cyan/50'
                    }`}
                  >
                    <input ref={fileInputRef} type="file" accept="video/*" onChange={e => handleFileSelect(e.target.files[0])} className="hidden" />
                    <div className="flex flex-col items-center gap-4">
                      <svg className={`w-12 h-12 ${isDragging ? 'text-neon-cyan' : 'text-slate-600'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-orbitron text-sm text-white mb-1">{isDragging ? 'RELEASE TO UPLOAD' : 'DROP VIDEO FEED'}</p>
                        <p className="font-mono-jet text-xs text-slate-500 tracking-wide">or click to browse files</p>
                      </div>
                      {selectedFile && (
                        <div className="flex items-center gap-2 px-4 py-2 border border-neon-green/30 bg-neon-green/5 rounded-sm">
                          <StatusDot active color="green" />
                          <span className="font-mono-jet text-xs text-neon-green">{selectedFile.name}</span>
                          <button onClick={e => { e.stopPropagation(); handleReset(); }} className="text-slate-500 hover:text-neon-red transition-colors ml-2">✕</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="px-4 pb-4 flex justify-center">
                      <button onClick={handleUpload} className="btn-cyber-solid px-8 py-3 font-orbitron text-sm tracking-widest flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        ANALYZE FEED
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Results */}
              {uploadStatus === 'completed' && processedVideo && (
                <div className="space-y-4">
                  {/* Status badge */}
                  <div className={`glass-panel p-4 rounded-sm flex items-center gap-4 ${safetyStatus === 'SAFE' ? 'neon-border-green' : 'neon-border-red'}`}>
                    <StatusDot active color={safetyStatus === 'SAFE' ? 'green' : 'red'} />
                    <div>
                      <div className={`font-orbitron text-lg font-black ${safetyStatus === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
                        {safetyStatus === 'SAFE' ? '✓ AREA CLEAR' : '⚠ THREAT DETECTED'}
                      </div>
                      <div className="font-mono-jet text-xs text-slate-500 tracking-wide mt-0.5">
                        {safetyStatus === 'SAFE'
                          ? `SAFE: ${safePercentage?.toFixed(1) ?? '--'}%`
                          : `UNSAFE ACTIVITY: ${unsafePercentage?.toFixed(1) ?? '--'}%`}
                      </div>
                    </div>
                  </div>

                  {/* Video */}
                  <div className="glass-panel rounded-sm overflow-hidden">
                    <div className="px-4 py-2 border-b border-neon-cyan/10 font-mono-jet text-xs text-slate-500 tracking-widest flex items-center gap-2">
                      <StatusDot active color="cyan" /> PROCESSED OUTPUT
                    </div>
                    <div className="hud-frame m-3 bg-black rounded-sm overflow-hidden">
                      <video ref={videoRef} key={processedVideo} autoPlay muted playsInline controls
                        className="w-full h-auto" src={`${API_BASE}${processedVideo}`}
                        onError={e => console.error('Video error:', e)} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    <button onClick={handleReset} className="btn-cyber px-5 py-2 text-xs font-mono-jet tracking-widest"><span>NEW ANALYSIS</span></button>
                    <a href={`${API_BASE}${processedVideo}`} download className="btn-cyber-solid px-5 py-2 text-xs font-mono-jet tracking-widest flex items-center gap-2">
                      DOWNLOAD
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* AI Status sidebar */}
            <div className="space-y-4">
              <div className="glass-panel hud-frame rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-neon-cyan/10">
                  <span className="font-orbitron text-xs text-neon-cyan tracking-widest">SYSTEM STATUS</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'AI MODEL', value: 'ONLINE', color: 'green', active: true },
                    { label: 'YOLO ENGINE', value: 'READY', color: 'green', active: true },
                    { label: 'MEDIAPIPE', value: 'READY', color: 'green', active: true },
                    { label: 'PROCESSING', value: isProcessing ? 'ACTIVE' : 'IDLE', color: isProcessing ? 'cyan' : 'green', active: isProcessing },
                    { label: 'THREAT LEVEL', value: safetyStatus === 'UNSAFE' ? 'HIGH' : 'LOW', color: safetyStatus === 'UNSAFE' ? 'red' : 'green', active: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                      <span className="font-mono-jet text-xs text-slate-500 tracking-widest">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <StatusDot active={row.active} color={row.color} />
                        <span className={`font-mono-jet text-xs font-bold ${
                          row.color === 'green' ? 'text-neon-green' : row.color === 'red' ? 'text-neon-red' : 'text-neon-cyan'
                        }`}>{row.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="glass-panel rounded-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-neon-cyan/10">
                  <span className="font-orbitron text-xs text-neon-cyan tracking-widest">OPERATOR STATS</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { label: 'TOTAL ANALYSES', value: quickStats?.total_videos ?? 0, color: 'text-neon-cyan' },
                    { label: 'SAFE FEEDS', value: quickStats?.safe_videos ?? 0, color: 'text-neon-green' },
                    { label: 'AVG CONFIDENCE', value: quickStats ? `${(quickStats.average_confidence * 100).toFixed(0)}%` : '0%', color: 'text-neon-cyan' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-mono-jet text-xs text-slate-500 tracking-widest">{s.label}</span>
                      <span className={`font-orbitron text-sm font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && <VideoHistory />}
        {activeTab === 'stats' && <DashboardStats />}
      </div>
    </section>
  );
};

export default Dashboard;
