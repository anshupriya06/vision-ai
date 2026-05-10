import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import API_BASE from '../config/api';

const StatusDot = ({ active, color = 'cyan' }) => {
  const colors = { cyan: 'bg-neon-cyan', green: 'bg-neon-green', red: 'bg-neon-red' };
  return <span className={`inline-block w-2 h-2 rounded-full ${active ? colors[color] + ' animate-pulse' : 'bg-slate-600'}`} />;
};

const LiveCamera = () => {
  const { currentUser } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captureInterval, setCaptureInterval] = useState(5); // seconds between snapshots
  const [snapshots, setSnapshots] = useState([]);            // last N analyzed frames
  const [liveStatus, setLiveStatus] = useState(null);        // latest safety status
  const [stats, setStats] = useState({ total: 0, safe: 0, unsafe: 0 });

  /* enumerate cameras */
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices().then(devs => {
      const cams = devs.filter(d => d.kind === 'videoinput');
      setDevices(cams);
      if (cams.length) setSelectedDevice(cams[0].deviceId);
    }).catch(() => {});
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setCameraError('');
    try {
      const constraints = {
        video: selectedDevice ? { deviceId: { exact: selectedDevice } } : { facingMode: 'environment' },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      else if (err.name === 'NotFoundError') setCameraError('No camera found on this device.');
      else setCameraError(`Camera error: ${err.message}`);
    }
  };

  const stopCamera = useCallback(() => {
    stopAnalysis();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setLiveStatus(null);
  }, []);

  /* capture a single frame as blob */
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
  };

  /* analyze one frame via backend */
  const analyzeFrame = async () => {
    if (!cameraActive) return;
    try {
      const blob = await captureFrame();
      if (!blob) return;

      const formData = new FormData();
      formData.append('file', blob, `snapshot-${Date.now()}.jpg`);
      formData.append('user_email', currentUser?.email || 'anonymous');

      let token = null;
      if (currentUser) { try { token = await currentUser.getIdToken(); } catch {} }
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await axios.post(`${API_BASE}/upload-video`, formData, { headers, timeout: 30000 });

      const result = {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        status: res.data.status,
        confidence: res.data.confidence ?? 0,
        thumbnail: URL.createObjectURL(blob),
      };

      setLiveStatus(result.status);
      setSnapshots(prev => [result, ...prev].slice(0, 12));
      setStats(prev => ({
        total: prev.total + 1,
        safe: prev.safe + (result.status === 'SAFE' ? 1 : 0),
        unsafe: prev.unsafe + (result.status === 'UNSAFE' ? 1 : 0),
      }));
    } catch {
      /* silent — don't crash the loop on a failed frame */
    }
  };

  const startAnalysis = () => {
    if (intervalRef.current) return;
    setIsAnalyzing(true);
    analyzeFrame(); // immediate first capture
    intervalRef.current = setInterval(analyzeFrame, captureInterval * 1000);
  };

  const stopAnalysis = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsAnalyzing(false);
  };

  const clearSnapshots = () => { setSnapshots([]); setStats({ total: 0, safe: 0, unsafe: 0 }); setLiveStatus(null); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Camera feed */}
      <div className="lg:col-span-2 space-y-4">

        {/* Error */}
        {cameraError && (
          <div className="glass-panel neon-border-red p-4 rounded-sm flex items-start gap-3">
            <span className="text-neon-red font-mono-jet text-lg leading-none">!</span>
            <p className="font-mono-jet text-xs text-neon-red">{cameraError}</p>
          </div>
        )}

        {/* Live status banner */}
        {liveStatus && (
          <div className={`glass-panel p-3 rounded-sm flex items-center gap-3 ${liveStatus === 'SAFE' ? 'neon-border-green' : 'neon-border-red'}`}>
            <StatusDot active color={liveStatus === 'SAFE' ? 'green' : 'red'} />
            <span className={`font-orbitron text-sm font-black ${liveStatus === 'SAFE' ? 'text-neon-green' : 'text-neon-red'}`}>
              {liveStatus === 'SAFE' ? '✓ AREA CLEAR' : '⚠ THREAT DETECTED'}
            </span>
            <span className="font-mono-jet text-xs text-slate-500 ml-auto">LAST FRAME ANALYSIS</span>
          </div>
        )}

        {/* Video */}
        <div className="glass-panel rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neon-cyan/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusDot active={cameraActive} color={cameraActive ? (isAnalyzing ? 'red' : 'green') : 'cyan'} />
              <span className="font-mono-jet text-xs text-slate-400 tracking-widest">
                {cameraActive ? (isAnalyzing ? 'LIVE ANALYSIS ACTIVE' : 'CAMERA READY') : 'CAMERA OFFLINE'}
              </span>
            </div>
            {isAnalyzing && (
              <span className="font-mono-jet text-xs text-neon-red animate-pulse tracking-widest">● REC</span>
            )}
          </div>

          <div className="relative bg-black aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!cameraActive ? 'hidden' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraActive && (
              <div className="flex flex-col items-center gap-3 text-center p-8">
                <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="font-orbitron text-sm text-slate-600">CAMERA OFFLINE</p>
                <p className="font-mono-jet text-xs text-slate-700">Start the camera to begin live monitoring</p>
              </div>
            )}

            {/* Scanning overlay when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border border-neon-red/30" />
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-neon-red" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-neon-red" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-neon-red" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-neon-red" />
              </div>
            )}
          </div>

          {/* Camera controls */}
          <div className="px-4 py-4 border-t border-neon-cyan/10 flex flex-wrap items-center gap-3">
            {!cameraActive ? (
              <button onClick={startCamera} className="btn-cyber-solid px-5 py-2 font-mono-jet text-xs tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                START CAMERA
              </button>
            ) : (
              <>
                {!isAnalyzing ? (
                  <button onClick={startAnalysis} className="btn-cyber-solid px-5 py-2 font-mono-jet text-xs tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyber-black animate-pulse" />
                    START ANALYSIS
                  </button>
                ) : (
                  <button onClick={stopAnalysis} className="btn-danger px-5 py-2 font-mono-jet text-xs tracking-widest">
                    STOP ANALYSIS
                  </button>
                )}
                <button onClick={stopCamera} className="btn-cyber px-4 py-2 font-mono-jet text-xs tracking-widest">
                  <span>STOP CAMERA</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Snapshot strip */}
        {snapshots.length > 0 && (
          <div className="glass-panel rounded-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-neon-cyan/10 flex items-center justify-between">
              <span className="font-orbitron text-xs text-neon-cyan tracking-widest">CAPTURED FRAMES</span>
              <button onClick={clearSnapshots} className="font-mono-jet text-xs text-slate-500 hover:text-neon-red transition-colors">CLEAR</button>
            </div>
            <div className="flex gap-2 p-3 overflow-x-auto">
              {snapshots.map(snap => (
                <div key={snap.id} className={`flex-shrink-0 relative border rounded-sm overflow-hidden ${snap.status === 'SAFE' ? 'border-neon-green/40' : 'border-neon-red/40'}`}>
                  <img src={snap.thumbnail} alt="frame" className="w-24 h-16 object-cover" />
                  <div className={`absolute bottom-0 left-0 right-0 px-1 py-0.5 text-center font-mono-jet text-xs font-bold ${snap.status === 'SAFE' ? 'bg-neon-green/80 text-black' : 'bg-neon-red/80 text-white'}`}>
                    {snap.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-4">

        {/* Camera selector */}
        <div className="glass-panel rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neon-cyan/10">
            <span className="font-orbitron text-xs text-neon-cyan tracking-widest">CAMERA CONFIG</span>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="font-mono-jet text-xs text-slate-500 tracking-widest block mb-2">DEVICE</label>
              <select
                value={selectedDevice}
                onChange={e => setSelectedDevice(e.target.value)}
                disabled={cameraActive}
                className="cyber-input w-full px-3 py-2 text-xs rounded-sm disabled:opacity-50"
              >
                {devices.length === 0 && <option value="">No cameras found</option>}
                {devices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0, 8)}`}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="font-mono-jet text-xs text-slate-500 tracking-widest">CAPTURE INTERVAL</label>
                <span className="font-orbitron text-xs text-neon-cyan font-bold">every {captureInterval}s</span>
              </div>
              <input
                type="range" min={2} max={30} step={1}
                value={captureInterval}
                onChange={e => { setCaptureInterval(Number(e.target.value)); if (isAnalyzing) { stopAnalysis(); setTimeout(startAnalysis, 100); } }}
                className="confidence-range"
                style={{ '--val': `${((captureInterval - 2) / 28) * 100}%` }}
              />
              <div className="flex justify-between mt-1">
                <span className="font-mono-jet text-xs text-slate-600">2s</span>
                <span className="font-mono-jet text-xs text-slate-600">30s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="glass-panel rounded-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-neon-cyan/10">
            <span className="font-orbitron text-xs text-neon-cyan tracking-widest">SESSION STATS</span>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'FRAMES ANALYZED', value: stats.total, color: 'text-neon-cyan' },
              { label: 'SAFE FRAMES', value: stats.safe, color: 'text-neon-green' },
              { label: 'UNSAFE FRAMES', value: stats.unsafe, color: 'text-neon-red' },
              { label: 'SAFE RATE', value: stats.total > 0 ? `${((stats.safe / stats.total) * 100).toFixed(0)}%` : '--', color: stats.total > 0 && stats.safe / stats.total > 0.8 ? 'text-neon-green' : 'text-neon-red' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                <span className="font-mono-jet text-xs text-slate-500 tracking-widest">{s.label}</span>
                <span className={`font-orbitron text-sm font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="glass-panel rounded-sm p-4 border border-neon-cyan/10">
          <p className="font-mono-jet text-xs text-slate-500 leading-relaxed">
            <span className="text-neon-cyan font-bold">HOW IT WORKS</span><br />
            The camera captures a JPEG frame every {captureInterval}s and sends it through the full AI pipeline — YOLOv8 detection + MediaPipe pose estimation — returning a SAFE / UNSAFE classification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveCamera;
