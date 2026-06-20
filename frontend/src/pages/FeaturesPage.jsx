import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    tag: 'CORE',
    title: 'Batch Video Analysis',
    desc: 'Upload up to 4 videos simultaneously across independent feed slots. Each slot runs its own AI pipeline — no waiting, no queue. Drop a video and results appear automatically.',
    bullets: ['4 parallel upload slots', 'Auto-analysis on drop', 'MP4, AVI, MOV, MKV support', 'Annotated video download'],
    color: 'cyan',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    tag: 'AI',
    title: 'Three-Stage AI Pipeline',
    desc: 'Every frame passes through three specialised models working in sequence to deliver accurate, explainable results — not just a black-box score.',
    bullets: ['YOLOv8n object & person detection', 'MediaPipe 33-point pose estimation', 'Scikit-learn activity classifier', 'Rule-based fallback for edge cases'],
    color: 'cyan',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    tag: 'LIVE',
    title: 'Live Webcam Monitoring',
    desc: 'Turn any connected camera into a continuous AI surveillance feed. Set the capture interval and let VisionSafe analyse the scene automatically, every few seconds.',
    bullets: ['Multi-camera device selector', 'Configurable 2–30s capture interval', 'Real-time SAFE/UNSAFE status', 'Session stats & frame snapshot strip'],
    color: 'red',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    tag: 'ALERTS',
    title: 'Smart Alert Engine',
    desc: 'Define exactly when you want to be notified. Set an unsafe event count and time window — alerts fire only when your threshold is breached, not on every single detection.',
    bullets: ['Configurable threshold (1–20 events)', 'Rolling time window (10s–5 min)', 'Browser push notifications', 'Audible alert sound'],
    color: 'red',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    tag: 'HISTORY',
    title: 'Video History & Analytics',
    desc: 'Every analysed video is stored with full metadata. Filter by confidence, review frame-level detections, watch the annotated playback, and export reports.',
    bullets: ['Confidence threshold filter slider', 'Frame-level detection breakdown', 'Annotated video player', 'CSV & PDF export'],
    color: 'green',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    tag: 'ADMIN',
    title: 'Admin Panel',
    desc: 'Platform-wide oversight for administrators. Monitor all users, review every upload, flag suspicious videos, and track system health from a single control panel.',
    bullets: ['All-user video oversight', 'Flag & review queue', 'Per-user analytics', 'System-wide statistics'],
    color: 'green',
  },
];

const STATS = [
  { value: '3-Stage', label: 'AI Pipeline' },
  { value: '<15s', label: 'Avg. Analysis Time' },
  { value: '6', label: 'Activity Classes' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const colorMap = {
  cyan:  { border: 'border-neon-cyan/20', icon: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20', tag: 'text-neon-cyan bg-neon-cyan/10', bullet: 'bg-neon-cyan' },
  green: { border: 'border-neon-green/20', icon: 'text-neon-green bg-neon-green/10 border-neon-green/20', tag: 'text-neon-green bg-neon-green/10', bullet: 'bg-neon-green' },
  red:   { border: 'border-neon-red/20', icon: 'text-neon-red bg-neon-red/10 border-neon-red/20', tag: 'text-neon-red bg-neon-red/10', bullet: 'bg-neon-red' },
};

const FeaturesPage = () => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="min-h-screen cyber-grid pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-neon-cyan/30 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
            <span className="font-mono-jet text-xs text-neon-cyan tracking-widest">PLATFORM FEATURES</span>
          </div>
          <h1 className="font-sora text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
            Everything you need to<br className="hidden sm:block" />
            <span className="text-gradient"> secure your workspace</span>
          </h1>
          <p className="font-inter text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            VisionSafe combines state-of-the-art computer vision with an intuitive interface — so you spend less time reviewing footage and more time acting on insights.
          </p>
        </div>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {STATS.map(s => (
            <div key={s.label} className="glass-panel rounded-xl border border-white/8 p-5 text-center">
              <p className="font-sora text-2xl sm:text-3xl font-extrabold text-gradient mb-1">{s.value}</p>
              <p className="font-mono-jet text-xs text-slate-500 tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Feature cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <div
                key={f.title}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`glass-panel rounded-2xl border ${c.border} p-6 flex flex-col gap-4 transition-all duration-300 cursor-default
                  ${hovered === i ? 'scale-[1.02] shadow-lg' : ''}`}
              >
                {/* Icon + tag */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                    {f.icon}
                  </div>
                  <span className={`font-mono-jet text-xs font-bold px-2.5 py-1 rounded-full ${c.tag}`}>
                    {f.tag}
                  </span>
                </div>

                {/* Title + desc */}
                <div>
                  <h3 className="font-sora text-lg font-extrabold text-white mb-2">{f.title}</h3>
                  <p className="font-inter text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>

                {/* Bullets */}
                <ul className="space-y-2 mt-auto">
                  {f.bullets.map(b => (
                    <li key={b} className="flex items-center gap-2.5">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.bullet}`} />
                      <span className="font-inter text-xs text-slate-300">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── Activity classes section ── */}
        <div className="glass-panel rounded-2xl border border-white/8 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-white mb-3">
              What the AI detects
            </h2>
            <p className="font-inter text-slate-400 text-sm max-w-xl mx-auto">
              The classifier recognises 6 activity classes and routes them into SAFE or UNSAFE categories.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Walking',  status: 'SAFE',   icon: '🚶' },
              { label: 'Running',  status: 'SAFE',   icon: '🏃' },
              { label: 'Standing', status: 'SAFE',   icon: '🧍' },
              { label: 'Sitting',  status: 'SAFE',   icon: '🪑' },
              { label: 'Fighting', status: 'UNSAFE', icon: '⚠️' },
              { label: 'Falling',  status: 'UNSAFE', icon: '🆘' },
            ].map(a => (
              <div key={a.label} className={`rounded-xl border p-4 text-center ${
                a.status === 'SAFE'
                  ? 'border-neon-green/20 bg-neon-green/5'
                  : 'border-neon-red/20 bg-neon-red/5'
              }`}>
                <div className="text-2xl mb-2">{a.icon}</div>
                <p className="font-sora text-sm font-bold text-white mb-1">{a.label}</p>
                <span className={`font-mono-jet text-xs font-bold ${
                  a.status === 'SAFE' ? 'text-neon-green' : 'text-neon-red'
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div className="glass-panel rounded-2xl border border-neon-cyan/20 p-8 sm:p-12 text-center bg-neon-cyan/3">
          <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-white mb-3">
            See it in action
          </h2>
          <p className="font-inter text-slate-400 text-sm sm:text-base mb-8 max-w-md mx-auto">
            Start with the free plan — no credit card, no commitment. Analyse your first video in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-neon-cyan text-cyber-black font-inter font-bold px-8 py-3 rounded-lg hover:bg-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.3)] transition-all text-sm w-full sm:w-auto"
            >
              Get started free →
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="border border-neon-cyan/40 text-neon-cyan font-inter font-semibold px-8 py-3 rounded-lg hover:bg-neon-cyan/10 transition-all text-sm w-full sm:w-auto"
            >
              See how it works
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeaturesPage;
